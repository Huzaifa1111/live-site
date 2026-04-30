import { Entity, ObjectIdColumn, ObjectId, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('product_variations')
export class ProductVariation {
    @ObjectIdColumn()
    id: string;

    @Column({ unique: true })
    sku: string;

    @Column()
    price: number;

    @Column({ nullable: true })
    salePrice: number;

    @Column({ nullable: true })
    saleStartDate: Date;

    @Column({ nullable: true })
    saleEndDate: Date;

    @Column({ default: 0 })
    stock: number;

    @Column({ default: true })
    inStock: boolean;

    @Column({ nullable: true })
    images: string[];

    @Column({ nullable: true })
    weight: number;

    @Column({ nullable: true })
    length: number;

    @Column({ nullable: true })
    width: number;

    @Column({ nullable: true })
    height: number;

    @Column({ default: false })
    isDefault: boolean;

    @Column()
    productId: string;

    @Column({ nullable: true })
    attributeValueIds: string[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
