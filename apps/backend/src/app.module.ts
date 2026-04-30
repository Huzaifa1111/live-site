import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { BrandsModule } from './modules/brands/brands.module';
import { ProductsModule } from './modules/products/products.module';
import { OrdersModule } from './modules/orders/orders.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { AdminModule } from './modules/admin/admin.module';
import { EmailModule } from './modules/email/email.module';
import { CartModule } from './modules/cart/cart.module';
import { ContactModule } from './modules/contact/contact.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { CategoriesModule } from './modules/categories/categories.module';





@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: async () => {
        return {
          type: 'mongodb',
          url: process.env.MONGODB_URI,
          database: process.env.DB_NAME || 'store_db',
          synchronize: true,
          logging: true, // Enabled for debugging
          autoLoadEntities: true,
          retryAttempts: 3, // Reduced to fail faster for debugging
          retryDelay: 3000,
        }
      },
    }),
    AuthModule,
    UsersModule,
    BrandsModule,
    ProductsModule,
    OrdersModule,
    UploadsModule,
    AdminModule,
    EmailModule,
    CartModule,
    ContactModule,
    ReviewsModule,
    CategoriesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }