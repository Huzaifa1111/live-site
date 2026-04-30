import { Entity, ObjectIdColumn, ObjectId, Column, UpdateDateColumn } from 'typeorm';

@Entity('settings')
export class Settings {
    @ObjectIdColumn()
    id: string;

    @Column({ default: 'My Awesome Store' })
    storeName: string;

    @Column({ default: 'admin@example.com' })
    storeEmail: string;

    @Column({ default: '+1234567890' })
    storePhone: string;

    @Column({ nullable: true })
    storeAddress: string;

    @Column({ default: 'USD' })
    currency: string;

    @Column({ default: false })
    maintenanceMode: boolean;

    @Column({ default: 0 })
    taxRate: number;

    @Column({ default: 0 })
    shippingFee: number;

    @UpdateDateColumn()
    updatedAt: Date;
}
