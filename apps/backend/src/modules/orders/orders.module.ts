import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { Order } from './order.entity';
import { Product } from '../products/product.entity';
import { CartModule } from '../cart/cart.module';
import { StripeService } from './stripe.service';
import { OrderItem } from './order-item.entity';
import { Brand } from '../brands/brand.entity';
import { AdminModule } from '../admin/admin.module';
import { Settings } from '../admin/settings.entity';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, Product, OrderItem, Brand, Settings]),
    CartModule,
    AdminModule,
    EmailModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService, StripeService],
  exports: [OrdersService],
})
export class OrdersModule { }