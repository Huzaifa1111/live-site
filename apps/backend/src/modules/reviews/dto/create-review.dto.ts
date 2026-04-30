import { IsInt, IsNotEmpty, IsString, Max, Min, MinLength } from 'class-validator';

export class CreateReviewDto {
    @IsInt()
    @Min(1)
    @Max(5)
    @IsNotEmpty()
    rating: number;

    @IsString()
    @IsNotEmpty()
    @MinLength(5)
    comment: string;

    @IsString()
    @IsNotEmpty()
    productId: string;
}
