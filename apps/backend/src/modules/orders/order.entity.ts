import { Entity, ObjectIdColumn, ObjectId, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { OrderItem } from './order-item.entity';

export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

@Entity('orders')
export class Order {
  @ObjectIdColumn()
  id: string;

  @Column({ unique: true, nullable: true })
  orderNumber: string;

  @Column()
  userId: string;

  @Column()
  subtotal: number;

  @Column({ default: 0 })
  shippingFee: number;

  @Column({ default: 0 })
  tax: number;

  @Column()
  total: number;

  @Column({
    default: OrderStatus.PENDING
  })
  status: OrderStatus;

  @Column({ nullable: true })
  shippingAddress: string;

  @Column({ nullable: true })
  paymentMethod: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Manual relations/embedded data for MongoDB
  items: OrderItem[];
  user?: any;
}