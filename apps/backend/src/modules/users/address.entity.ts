import {
    Entity,
    ObjectIdColumn,
    ObjectId,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

export enum AddressType {
    HOME = 'home',
    OFFICE = 'office'
}

@Entity('addresses')
export class Address {
    @ObjectIdColumn()
    id: string;

    @Column()
    userId: string;

    @Column({
        default: AddressType.HOME
    })
    type: AddressType;

    @Column()
    street: string;

    @Column()
    city: string;

    @Column({ nullable: true })
    state: string;

    @Column()
    zipCode: string;

    @Column()
    country: string;

    @Column({ default: false })
    isDefault: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
