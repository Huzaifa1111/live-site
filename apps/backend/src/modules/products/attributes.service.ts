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
        if (query) {
            return this.attributeRepository.find({
                where: { name: Like(`%${query}%`) },
                relations: ['values']
            });
        }
        return this.attributeRepository.find({ relations: ['values'] });
    }

    async create(name: string) {
        const attribute = this.attributeRepository.create({ name });
        return this.attributeRepository.save(attribute);
    }

    async remove(id: number) {
        const attribute = await this.attributeRepository.findOne({ where: { id } });
        if (!attribute) throw new NotFoundException('Attribute not found');
        return this.attributeRepository.remove(attribute);
    }

    async findValuesByAttribute(attributeName: string, query?: string) {
        const attribute = await this.attributeRepository.findOne({
            where: { name: attributeName },
            relations: ['values'],
        });

        if (!attribute) {
            // If attribute doesn't exist, return empty array (or create it if that's desired, 
            // but for search let's just return empty)
            return [];
        }

        if (query) {
            return this.attributeValueRepository.find({
                where: {
                    attribute: { id: attribute.id },
                    value: Like(`%${query}%`),
                },
            });
        }

        return attribute.values;
    }

    async createAttributeValue(attributeName: string, value: string) {
        let attribute = await this.attributeRepository.findOne({ where: { name: attributeName } });

        if (!attribute) {
            attribute = this.attributeRepository.create({ name: attributeName });
            await this.attributeRepository.save(attribute);
        }

        let attrValue = await this.attributeValueRepository.findOne({
            where: { attribute: { id: attribute.id }, value },
        });

        if (!attrValue) {
            attrValue = this.attributeValueRepository.create({
                value,
                attribute,
            });
            await this.attributeValueRepository.save(attrValue);
        }

        return attrValue;
    }
}
