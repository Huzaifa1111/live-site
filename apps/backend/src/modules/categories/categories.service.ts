import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';
import { AdminService } from '../admin/admin.service';

@Injectable()
export class CategoriesService {
    constructor(
        @InjectRepository(Category)
        private categoryRepository: Repository<Category>,
        private adminService: AdminService,
    ) { }

    async findAll() {
        return this.categoryRepository.find({
            order: { createdAt: 'DESC' } as any,
        });
    }

    async findOne(id: string) {
        const category = await this.categoryRepository.findOne({
            where: { _id: id } as any,
        });

        if (!category) {
            throw new NotFoundException(`Category with ID ${id} not found`);
        }

        // Manually fetch products if needed
        const productRepo = this.categoryRepository.manager.getRepository('Product');
        category.products = await productRepo.find({ where: { categoryId: id } as any });

        return category;
    }

    async create(createCategoryDto: any) {
        const category = this.categoryRepository.create(createCategoryDto);
        const savedCategory = await this.categoryRepository.save(category);

        // Notify analytics update (categories changed)
        this.adminService.notifyAnalyticsUpdate();

        return savedCategory;
    }

    async update(id: string, updateCategoryDto: any) {
        const category = await this.findOne(id);
        Object.assign(category, updateCategoryDto);
        const updated = await this.categoryRepository.save(category);

        this.adminService.notifyAnalyticsUpdate();

        return updated;
    }

    async remove(id: string) {
        const category = await this.findOne(id);
        await this.categoryRepository.remove(category);

        this.adminService.notifyAnalyticsUpdate();

        return { message: 'Category deleted successfully' };
    }
}
