import { Entity, ObjectIdColumn, ObjectId, Column, CreateDateColumn } from 'typeorm';

@Entity('reviews')
export class Review {
    @ObjectIdColumn()
    id: string;

    @Column()
    rating: number;

    @Column()
    comment: string;

    @Column()
    userId: string;

    @Column()
    productId: string;

    @CreateDateColumn()
    createdAt: Date;

    // Manual relations for MongoDB
    user?: any;
    product?: any;
}
