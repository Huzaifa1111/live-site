import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { AdminService } from '../admin/admin.service';

@Injectable()
export class ReviewService {
    constructor(
        @InjectRepository(Review)
        private readonly reviewRepository: Repository<Review>,
        private adminService: AdminService,
    ) { }

    async create(userId: string, createReviewDto: CreateReviewDto): Promise<Review> {
        const review = (this.reviewRepository.create({
            rating: createReviewDto.rating,
            comment: createReviewDto.comment,
            productId: createReviewDto.productId,
            userId,
        } as any) as unknown) as Review;
        const savedReview = await this.reviewRepository.save(review);
        this.adminService.notifyAnalyticsUpdate();
        return savedReview;
    }

    async findByProduct(productId: string): Promise<Review[]> {
        const reviews = await this.reviewRepository.find({
            where: { productId } as any,
            order: { createdAt: 'DESC' } as any,
        });

        const userRepo = this.reviewRepository.manager.getRepository('User');
        for (const r of reviews) {
            r.user = await userRepo.findOne({ where: { _id: r.userId } as any });
        }
        return reviews;
    }

    async findAll(): Promise<Review[]> {
        const reviews = await this.reviewRepository.find({
            order: { createdAt: 'DESC' } as any,
        });

        const userRepo = this.reviewRepository.manager.getRepository('User');
        const productRepo = this.reviewRepository.manager.getRepository('Product');

        for (const r of reviews) {
            r.user = await userRepo.findOne({ where: { _id: r.userId } as any });
            r.product = await productRepo.findOne({ where: { _id: r.productId } as any });
        }
        return reviews;
    }

    async getReviewStats() {
        const count = await this.reviewRepository.count();
        return { count };
    }
}
