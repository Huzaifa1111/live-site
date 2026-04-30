import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Attribute, AttributeValue } from './attribute.entity';

@Injectable()
export class AttributesService {
    constructor(
        @InjectRepository(Attribute)
        private attributeRepository: Repository<Attribute>,
        @InjectRepository(AttributeValue)
        private attributeValueRepository: Repository<AttributeValue>,
    ) { }

    async findAll(query?: string) {
        const where: any = {};
        if (query) {
            where.name = { $regex: query, $options: 'i' };
        }
        const attributes = await this.attributeRepository.find({ where });
        
        // Manually fetch values
        for (const attr of attributes) {
            attr.values = await this.attributeValueRepository.find({ where: { attributeId: attr.id } as any });
        }
        return attributes;
    }

    async create(name: string) {
        const attribute = this.attributeRepository.create({ name });
        return this.attributeRepository.save(attribute);
    }

    async remove(id: string) {
        const attribute = await this.attributeRepository.findOne({ where: { _id: id } as any });
        if (!attribute) throw new NotFoundException('Attribute not found');
        return this.attributeRepository.remove(attribute);
    }

    async findValuesByAttribute(attributeName: string, query?: string) {
        const attribute = await this.attributeRepository.findOne({
            where: { name: attributeName },
        });

        if (!attribute) return [];

        const where: any = { attributeId: attribute.id };
        if (query) {
            where.value = { $regex: query, $options: 'i' };
        }

        return this.attributeValueRepository.find({ where });
    }

    async createAttributeValue(attributeName: string, value: string) {
        let attribute = await this.attributeRepository.findOne({ where: { name: attributeName } });

        if (!attribute) {
            attribute = this.attributeRepository.create({ name: attributeName });
            await this.attributeRepository.save(attribute);
        }

        let attrValue: AttributeValue | null = await this.attributeValueRepository.findOne({
            where: { attributeId: attribute.id, value } as any,
        });

        if (!attrValue) {
            const newAttrValue = (this.attributeValueRepository.create({
                value,
                attributeId: attribute.id,
            } as any) as unknown) as AttributeValue;
            attrValue = await this.attributeValueRepository.save(newAttrValue);
        }

        return attrValue;
    }
}
