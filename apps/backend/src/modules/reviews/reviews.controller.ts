import { Controller, Get, Post, Body, UseGuards, Param, Req } from '@nestjs/common';
import { ReviewService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('reviews')
export class ReviewController {
    constructor(private readonly reviewService: ReviewService) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    async create(@Req() req: any, @Body() createReviewDto: CreateReviewDto) {
        return await this.reviewService.create(req.user.id, createReviewDto);
    }

    @Get('product/:id')
    async findByProduct(@Param('id') id: string) {
        return await this.reviewService.findByProduct(id);
    }

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    async findAll() {
        return await this.reviewService.findAll();
    }
}
