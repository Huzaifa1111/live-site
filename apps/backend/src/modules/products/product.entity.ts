import { Entity, ObjectIdColumn, ObjectId, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('products')
export class Product {
  @ObjectIdColumn()
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  price: number;

  @Column({ default: 0 })
  stock: number;

  @Column({ nullable: true })
  images: string[];

  @Column({ nullable: true })
  categoryId: string;

  @Column({ default: false })
  featured: boolean;

  @Column({ nullable: true })
  sku: string;

  @Column({ nullable: true })
  longDescription: string;

  @Column({ nullable: true })
  shippingPolicy: string;

  @Column({ nullable: true })
  returnPolicy: string;

  @Column({ nullable: true })
  descriptionImages: string[];

  @Column({ nullable: true })
  brandId: string;

  // Manual relations/references for MongoDB
  @Column({ nullable: true })
  upsellIds: string[];

  @Column({ nullable: true })
  crossSellIds: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Placeholder fields to maintain TypeScript compatibility in services if needed
  category?: any;
  brand?: any;
  variations?: any[];
  reviews?: any[];
  upsells?: Product[];
  crossSells?: Product[];
}