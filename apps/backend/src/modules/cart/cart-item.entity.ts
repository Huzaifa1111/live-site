import { Entity, ObjectIdColumn, ObjectId, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('cart_items')
export class CartItem {
  @ObjectIdColumn()
  id: string;

  @Column()
  userId: string;

  @Column()
  productId: string;

  @Column({ nullable: true })
  variationId: string;

  @Column()
  quantity: number;

  @Column()
  price: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Manual relations for MongoDB
  user?: any;
  product?: any;
}