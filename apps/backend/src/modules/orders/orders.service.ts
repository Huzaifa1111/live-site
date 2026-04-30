import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './order.entity';
import { OrderItem } from './order-item.entity';
import { Product } from '../products/product.entity';
import { CartService } from '../cart/cart.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { StripeService } from './stripe.service';
import { AdminService } from '../admin/admin.service';
import { Settings } from '../admin/settings.entity';
import { EmailService } from '../email/email.service';
import { PdfService } from './pdf.service';


@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Settings)
    private settingsRepository: Repository<Settings>,
    private cartService: CartService,
    private stripeService: StripeService,
    private adminService: AdminService,
    private emailService: EmailService,
    private pdfService: PdfService,
  ) { }

  private async getSettings(): Promise<{ taxRate: number; shippingFee: number }> {
    let settings = await this.settingsRepository.findOne({ where: {} });
    if (!settings) {
      settings = this.settingsRepository.create();
      await this.settingsRepository.save(settings);
    }
    return {
      taxRate: Number(settings.taxRate) || 0,
      shippingFee: Number(settings.shippingFee) || 0,
    };
  }

  async createOrder(userId: string, createOrderDto: CreateOrderDto) {
    this.logger.log(`Starting createOrder for user ${userId}. Payment Method: ${createOrderDto.paymentMethod}`);

    // Get cart items
    const cartItems = await this.cartService.getCart(userId);
    if (cartItems.length === 0) {
      throw new BadRequestException('Cart is empty. Please add items before checkout.');
    }

    const subtotal = cartItems.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
    const { taxRate, shippingFee } = await this.getSettings();
    const tax = parseFloat((subtotal * (taxRate / 100)).toFixed(2));
    const total = parseFloat((subtotal + shippingFee + tax).toFixed(2));

    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    const orderNumber = `ORD-${dateStr}-${randomStr}`;

    const order = this.orderRepository.create({
      userId,
      orderNumber,
      subtotal,
      shippingFee,
      tax,
      total,
      shippingAddress: createOrderDto.shippingAddress,
      paymentMethod: createOrderDto.paymentMethod,
      status: OrderStatus.PENDING,
    });

    if (createOrderDto.paymentMethod === 'stripe') {
      if (!createOrderDto.paymentIntentId) throw new Error('Payment Intent ID is required for Stripe payments');
      const paymentIntent = await this.stripeService.retrievePaymentIntent(createOrderDto.paymentIntentId);
      if (paymentIntent.status === 'succeeded') order.status = OrderStatus.PROCESSING;
      else throw new Error(`Payment not successful: ${paymentIntent.status}`);
    }

    const savedOrder = await this.orderRepository.save(order);

    for (const item of cartItems) {
      const orderItem = this.orderItemRepository.create({
        orderId: savedOrder.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      });
      await this.orderItemRepository.save(orderItem);

      // Deduct Stock
      const product = await this.productRepository.findOne({ where: { _id: item.productId } as any });
      if (product) {
        if (product.stock < item.quantity) throw new BadRequestException(`Insufficient stock for product: ${product.name}`);
        product.stock -= item.quantity;
        await this.productRepository.save(product);
      }
    }

    await this.cartService.clearCart(userId);
    await this.adminService.notifyAnalyticsUpdate();

    try {
      const orderWithData = await this.getOrderById(savedOrder.id);
      if (orderWithData && orderWithData.user) {
        const pdfBuffer = await this.pdfService.generateInvoice(orderWithData);
        await this.emailService.sendOrderConfirmation(
          orderWithData.user.email,
          orderWithData.user.name,
          orderWithData,
          [{ filename: `invoice-${orderWithData.orderNumber}.pdf`, content: pdfBuffer }]
        );
      }
    } catch (emailError) {
      this.logger.error(`Failed to send order confirmation: ${emailError.message}`);
    }

    return savedOrder;
  }

  async getOrderByOrderNumber(orderNumber: string) {
    if (!orderNumber) throw new BadRequestException('Order number is required');
    const order = await this.orderRepository.findOne({ where: { orderNumber: orderNumber.trim() } });
    if (!order) throw new NotFoundException(`Order with identifier ${orderNumber} not found`);

    // Manual joins
    order.items = await this.orderItemRepository.find({ where: { orderId: order.id } });
    for (const item of order.items) {
        item.product = await this.productRepository.findOne({ where: { _id: item.productId } as any });
    }
    return order;
  }

  async createPaymentIntent(userId: string) {
    const cartItems = await this.cartService.getCart(userId);
    if (cartItems.length === 0) throw new BadRequestException('Cart is empty.');

    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const { taxRate, shippingFee } = await this.getSettings();
    const tax = parseFloat((subtotal * (taxRate / 100)).toFixed(2));
    const total = parseFloat((subtotal + shippingFee + tax).toFixed(2));

    const paymentIntent = await this.stripeService.createPaymentIntent(total);
    return { clientSecret: paymentIntent.client_secret, subtotal, shippingFee, tax, total };
  }

  async getUserOrders(userId: string) {
    const orders = await this.orderRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' } as any,
    });
    for (const o of orders) {
        o.items = await this.orderItemRepository.find({ where: { orderId: o.id } });
        for (const item of o.items) {
            item.product = await this.productRepository.findOne({ where: { _id: item.productId } as any });
        }
    }
    return orders;
  }

  async getAllOrders() {
    const orders = await this.orderRepository.find({ order: { createdAt: 'DESC' } as any });
    for (const o of orders) {
        o.items = await this.orderItemRepository.find({ where: { orderId: o.id } });
        for (const item of o.items) {
            item.product = await this.productRepository.findOne({ where: { _id: item.productId } as any });
        }
    }
    return orders;
  }

  async getOrderById(id: string, userId?: string) {
    const { ObjectId } = require('mongodb');
    const where: any = { _id: new ObjectId(id) };
    if (userId) where.userId = userId;

    const order = await this.orderRepository.findOne({ where });
    if (!order) throw new NotFoundException('Order not found');

    // Manual join users, items, and products
    const userRepo = this.orderRepository.manager.getRepository('User');
    order.user = await userRepo.findOne({ where: { _id: order.userId } as any });
    order.items = await this.orderItemRepository.find({ where: { orderId: order.id } });
    for (const item of order.items) {
        item.product = await this.productRepository.findOne({ where: { _id: item.productId } as any });
    }

    return order;
  }

  async updateOrderStatus(id: string, status: OrderStatus) {
    const order = await this.getOrderById(id);
    order.status = status;
    const savedOrder = await this.orderRepository.save(order);
    this.adminService.notifyAnalyticsUpdate();
    return savedOrder;
  }

  async cancelOrder(id: string, userId: string) {
    const { ObjectId } = require('mongodb');
    const order = await this.orderRepository.findOne({ where: { _id: new ObjectId(id), userId } as any });
    if (!order) throw new NotFoundException('Order not found');

    const cancellableStatuses: OrderStatus[] = [OrderStatus.PENDING, OrderStatus.PROCESSING];
    if (!cancellableStatuses.includes(order.status)) {
      throw new ForbiddenException(`Order cannot be cancelled. Status is "${order.status}".`);
    }

    order.status = OrderStatus.CANCELLED;
    const saved = await this.orderRepository.save(order);
    this.adminService.notifyAnalyticsUpdate();
    return saved;
  }

  async deleteOrder(id: string) {
    const { ObjectId } = require('mongodb');
    const result = await this.orderRepository.delete(new ObjectId(id) as any);
    if (result.affected === 0) throw new NotFoundException('Order not found');
  }
}