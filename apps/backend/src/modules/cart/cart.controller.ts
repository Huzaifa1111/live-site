import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartItemDto } from './dto/add-to-cart.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  async getCart(@Req() req) {
    return await this.cartService.getCart(req.user.id);
  }

  @Get('count')
  async getCartCount(@Req() req) {
    const count = await this.cartService.getCartCount(req.user.id);
    return { count };
  }

  @Get('total')
  async getCartTotal(@Req() req) {
    const total = await this.cartService.getCartTotal(req.user.id);
    return { total };
  }

  @Post()
  async addToCart(@Req() req, @Body() addToCartDto: AddToCartDto) {
    return await this.cartService.addToCart(req.user.id, addToCartDto);
  }

  @Put(':id')
  async updateCartItem(
    @Req() req,
    @Param('id') itemId: string,
    @Body() updateCartDto: UpdateCartItemDto,
  ) {
    return await this.cartService.updateCartItem(req.user.id, itemId, updateCartDto);
  }

  @Delete(':id')
  async removeFromCart(@Req() req, @Param('id') itemId: string) {
    return await this.cartService.removeFromCart(req.user.id, itemId);
  }

  @Delete()
  async clearCart(@Req() req) {
    return await this.cartService.clearCart(req.user.id);
  }
}