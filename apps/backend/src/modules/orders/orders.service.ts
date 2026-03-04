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
    let settings = await this.settingsRepository.findOne({ where: { id: 1 } });
    if (!settings) {
      settings = this.settingsRepository.create({ id: 1 });
      await this.settingsRepository.save(settings);
    }
    return {
      taxRate: Number(settings.taxRate) || 0,
      shippingFee: Number(settings.shippingFee) || 0,
    };
  }

  async createOrder(userId: number, createOrderDto: CreateOrderDto) {
    this.logger.log(`Starting createOrder for user ${userId}. Payment Method: ${createOrderDto.paymentMethod}`);

    // Get cart items
    const cartItems = await this.cartService.getCart(userId);
    this.logger.log(`Found ${cartItems.length} items in cart for user ${userId}`);

    if (cartItems.length === 0) {
      throw new BadRequestException('Cart is empty. Please add items before checkout.');
    }

    // Calculate subtotal from cart items
    const subtotal = cartItems.reduce((sum, item) => {
      return sum + (Number(item.price) * item.quantity);
    }, 0);
    this.logger.log(`Calculated subtotal: ${subtotal}`);

    // Fetch live settings for tax and shipping
    const { taxRate, shippingFee } = await this.getSettings();
    const tax = parseFloat((subtotal * (taxRate / 100)).toFixed(2));
    const total = parseFloat((subtotal + shippingFee + tax).toFixed(2));
    this.logger.log(`Calculated total: ${total} (Tax: ${tax}, Shipping: ${shippingFee})`);

    // Generate professional order number
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    const orderNumber = `ORD-${dateStr}-${randomStr}`;

    // Create order object
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

    // Handle Stripe Payment
    if (createOrderDto.paymentMethod === 'stripe') {
      this.logger.log(`Processing stripe payment for user ${userId}`);
      if (!createOrderDto.paymentIntentId) {
        throw new Error('Payment Intent ID is required for Stripe payments');
      }

      try {
        const paymentIntent = await this.stripeService.retrievePaymentIntent(createOrderDto.paymentIntentId);

        if (paymentIntent.status === 'succeeded') {
          order.status = OrderStatus.PROCESSING; // Or PAID
        } else {
          throw new Error(`Payment not successful: ${paymentIntent.status}`);
        }
      } catch (error) {
        this.logger.error(`Stripe verification failed for user ${userId}: ${error.message}`);
        throw new BadRequestException('Failed to verify payment: ' + error.message);
      }
    }

    this.logger.log(`Saving order ${orderNumber} to database...`);
    const savedOrder = await this.orderRepository.save(order);
    this.logger.log(`Order saved with ID: ${savedOrder.id}`);

    // Create Order Items
    this.logger.log(`Creating order items for order ID: ${savedOrder.id}`);
    for (const item of cartItems) {
      const orderItem = this.orderItemRepository.create({
        orderId: savedOrder.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      });
      await this.orderItemRepository.save(orderItem);
    }

    // Deduct Stock
    this.logger.log(`Deducting stock for order ID: ${savedOrder.id}`);
    for (const item of cartItems) {
      const product = await this.productRepository.findOne({ where: { id: item.productId } });
      if (product) { // Ensure product exists
        if (product.stock < item.quantity) {
          this.logger.error(`Insufficient stock for product ${product.id}`);
          throw new BadRequestException(`Insufficient stock for product: ${product.name}`);
        }
        product.stock -= item.quantity;
        await this.productRepository.save(product);
        // console.log(`Stock deducted for product ${product.id}: ${item.quantity} units. New stock: ${product.stock}`);
      }
    }

    // Clear cart after order is created
    this.logger.log(`Clearing cart for user ${userId}`);
    await this.cartService.clearCart(userId);

    // Trigger real-time analytics update
    await this.adminService.notifyAnalyticsUpdate();

    // Send Order Confirmation Email
    try {
      this.logger.log(`Initiating order confirmation email for Order ID: ${savedOrder.id}`);
      // Fetch full order details including user and item relations
      const orderWithData = await this.getOrderById(savedOrder.id);
      if (orderWithData && orderWithData.user) {
        // Generate Invoice PDF
        const pdfBuffer = await this.pdfService.generateInvoice(orderWithData);

        await this.emailService.sendOrderConfirmation(
          orderWithData.user.email,
          orderWithData.user.name,
          orderWithData,
          [
            {
              filename: `invoice-${orderWithData.orderNumber}.pdf`,
              content: pdfBuffer,
            }
          ]
        );
      } else {
        this.logger.warn(`Could not send confirmation email: Order or User data not found for ID ${savedOrder.id}`);
      }
    } catch (emailError) {
      this.logger.error(`Failed to send order confirmation email for order ${savedOrder.id}: ${emailError.message}`);
      // We don't throw here as the order is already placed successfully
    }

    return savedOrder;
  }

  async getOrderByOrderNumber(orderNumber: string) {
    if (!orderNumber) {
      throw new BadRequestException('Order number is required');
    }

    try {
      const order = await this.orderRepository.findOne({
        where: { orderNumber: orderNumber.trim() },
        relations: ['items', 'items.product', 'items.product.brand']
      });

      if (!order) {
        throw new NotFoundException(`Order with identifier ${orderNumber} not found`);
      }

      return order;
    } catch (error) {
      console.error(`[OrdersService] Detailed Tracking Error for ${orderNumber}:`, error);
      if (error instanceof NotFoundException) throw error;
      throw new Error(`Technical tracking failure: ${error.message}`);
    }
  }

  async createPaymentIntent(userId: number) {
    const cartItems = await this.cartService.getCart(userId);

    if (cartItems.length === 0) {
      console.warn(`[OrdersService] CreatePaymentIntent failed: Cart is empty for user ${userId}`);
      throw new BadRequestException('Cart is empty. Please add items before checkout.');
    }

    const subtotal = cartItems.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);

    // Fetch live settings for tax and shipping
    const { taxRate, shippingFee } = await this.getSettings();
    const tax = parseFloat((subtotal * (taxRate / 100)).toFixed(2));
    const total = parseFloat((subtotal + shippingFee + tax).toFixed(2));

    try {
      const paymentIntent = await this.stripeService.createPaymentIntent(total);

      return {
        clientSecret: paymentIntent.client_secret,
        subtotal,
        shippingFee,
        tax,
        total,
      };
    } catch (error) {
      console.error('[OrdersService] Stripe Payment Intent Creation Failed:', error.message);
      throw error;
    }
  }

  async getUserOrders(userId: number) {
    return this.orderRepository.find({
      where: { userId },
      relations: ['items', 'items.product'],
      order: { createdAt: 'DESC' },
    });
  }

  async getAllOrders() {
    return this.orderRepository.find({
      relations: ['items', 'items.product'],
      order: { createdAt: 'DESC' },
    });
  }

  async getOrderById(id: number, userId?: number) {
    const where: any = { id };
    if (userId) {
      where.userId = userId;
    }

    try {
      const order = await this.orderRepository.findOne({
        where,
        relations: {
          user: true,
          items: {
            product: {
              brand: true
            }
          }
        }
      });

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      return order;
    } catch (error) {
      console.error(`[OrdersService] Failed to fetch order by ID ${id}:`, error.message);
      if (error instanceof NotFoundException) throw error;
      throw new Error('Database operation failed while fetching order');
    }
  }

  async updateOrderStatus(id: number, status: OrderStatus) {
    const order = await this.getOrderById(id);
    order.status = status;
    const savedOrder = await this.orderRepository.save(order);

    // Trigger real-time analytics update
    this.adminService.notifyAnalyticsUpdate();

    return savedOrder;
  }

  async cancelOrder(id: number, userId: number) {
    // Fetch order owned by this user
    const order = await this.orderRepository.findOne({ where: { id, userId } });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const cancellableStatuses: OrderStatus[] = [OrderStatus.PENDING, OrderStatus.PROCESSING];

    if (!cancellableStatuses.includes(order.status)) {
      throw new ForbiddenException(
        `Order cannot be cancelled. It is currently "${order.status}". Only pending or processing orders can be cancelled.`
      );
    }

    order.status = OrderStatus.CANCELLED;
    const saved = await this.orderRepository.save(order);

    // Notify analytics
    this.adminService.notifyAnalyticsUpdate();

    return saved;
  }

  async deleteOrder(id: number) {
    const result = await this.orderRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Order not found');
    }
  }
}