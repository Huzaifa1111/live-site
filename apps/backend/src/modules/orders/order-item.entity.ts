import { Entity, ObjectIdColumn, ObjectId, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('order_items')
export class OrderItem {
    @ObjectIdColumn()
    id: string;

    @Column()
    orderId: string;

    @Column()
    productId: string;

    @Column()
    quantity: number;

    @Column()
    price: number;

    @Column({ nullable: true })
    color: string;

    @Column({ nullable: true })
    size: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // Manual relations for MongoDB
    order?: any;
    product?: any;
}
