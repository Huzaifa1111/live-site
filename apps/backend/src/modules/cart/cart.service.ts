import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from './cart-item.entity';
import { Product } from '../products/product.entity';
import { AddToCartDto, UpdateCartItemDto } from './dto/add-to-cart.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem)
    private cartItemRepository: Repository<CartItem>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) { }

  async getCart(userId: string) {
    const cartItems = await this.cartItemRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' } as any,
    });

    const cartWithProducts = await Promise.all(
      cartItems.map(async (item) => {
        const { ObjectId } = require('mongodb');
        const product = await this.productRepository.findOne({
          where: { _id: new ObjectId(item.productId) } as any,
        });

        let variation: any = null;
        if (product && item.variationId) {
            // Find variations associated with this product
            const variationRepo = this.cartItemRepository.manager.getRepository('ProductVariation');
            const variations = await variationRepo.find({ where: { productId: product.id } as any });
            product.variations = variations;
            variation = variations.find(v => v.id === item.variationId) || null;
        }

        return {
          ...item,
          product: product || null,
          variation: variation,
        };
      })
    );

    return cartWithProducts;
  }

  async addToCart(userId: string, addToCartDto: AddToCartDto) {
    const { productId, quantity, variationId } = addToCartDto;
    const { ObjectId } = require('mongodb');

    const product = await this.productRepository.findOne({ where: { _id: new ObjectId(productId) } as any });
    if (!product) throw new NotFoundException('Product not found');

    let variation: any = null;
    if (variationId) {
       const variationRepo = this.cartItemRepository.manager.getRepository('ProductVariation');
       variation = await variationRepo.findOne({ where: { _id: new ObjectId(variationId) } as any });
       if (!variation) throw new NotFoundException('Variation not found');
    }

    const availableStock = variation ? variation.stock : product.stock;
    if (availableStock < quantity) throw new BadRequestException('Insufficient stock');

    const existingCartItem = await this.cartItemRepository.findOne({
      where: { userId, productId, variationId: variationId || undefined } as any,
    });

    if (existingCartItem) {
      existingCartItem.quantity += quantity;
      return await this.cartItemRepository.save(existingCartItem);
    }

    const cartItem = this.cartItemRepository.create({
      userId,
      productId,
      variationId: variationId || undefined,
      quantity,
      price: variation ? variation.price : product.price,
    } as any);

    return await this.cartItemRepository.save(cartItem);
  }

  async updateCartItem(userId: string, itemId: string, updateCartDto: UpdateCartItemDto) {
    const cartItem = await this.cartItemRepository.findOne({
      where: { _id: itemId, userId } as any,
    });

    if (!cartItem) throw new NotFoundException('Cart item not found');

    const { ObjectId } = require('mongodb');
    const product = await this.productRepository.findOne({ where: { _id: new ObjectId(cartItem.productId) } as any });
    if (product && product.stock < updateCartDto.quantity) {
      throw new BadRequestException('Insufficient stock');
    }

    cartItem.quantity = updateCartDto.quantity;
    return await this.cartItemRepository.save(cartItem);
  }

  async removeFromCart(userId: string, itemId: string) {
    const result = await this.cartItemRepository.delete({ _id: itemId, userId } as any);
    if (result.affected === 0) throw new NotFoundException('Cart item not found');
    return { message: 'Item removed from cart' };
  }

  async clearCart(userId: string) {
    await this.cartItemRepository.delete({ userId });
    return { message: 'Cart cleared' };
  }

  async getCartCount(userId: string) {
    const items = await this.cartItemRepository.find({ where: { userId } });
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }

  async getCartTotal(userId: string) {
    const cartItems = await this.cartItemRepository.find({ where: { userId } });
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }
}