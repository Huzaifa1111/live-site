import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req, ParseIntPipe } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus } from './order.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';

import { Public } from '../../common/decorators/public.decorator';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) { }

  @Public()
  @Get('track/:orderNumber')
  async trackOrder(@Param('orderNumber') orderNumber: string) {
    return this.ordersService.getOrderByOrderNumber(orderNumber);
  }

  @Post("create-payment-intent")
  @UseGuards(JwtAuthGuard)
  async createPaymentIntent(@Req() req) {
    return this.ordersService.createPaymentIntent(req.user.id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Req() req, @Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.createOrder(req.user.id, createOrderDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getUserOrders(@Req() req) {
    return await this.ordersService.getUserOrders(req.user.id);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getAllOrders() {
    return await this.ordersService.getAllOrders();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getOrderById(@Req() req, @Param('id') id: string) {
    return await this.ordersService.getOrderById(id, req.user.id);
  }

  @Put(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateOrderStatus(
    @Param('id') id: string,
    @Body('status') status: OrderStatus,
  ) {
    return await this.ordersService.updateOrderStatus(id, status);
  }

  @Put(':id/cancel')
  @UseGuards(JwtAuthGuard)
  async cancelOrder(@Req() req, @Param('id') id: string) {
    return await this.ordersService.cancelOrder(id, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async deleteOrder(@Param('id') id: string) {
    return await this.ordersService.deleteOrder(id);
  }
}