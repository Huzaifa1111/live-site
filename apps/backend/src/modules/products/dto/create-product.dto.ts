// apps/backend/src/modules/products/dto/create-product.dto.ts
import { IsString, IsNumber, IsOptional, Min, MaxLength, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class VariationDto {
  @IsString() sku: string;
  @IsNumber() @Min(0) price: number;
  @IsOptional() @IsNumber() @Min(0) salePrice?: number;
  @IsOptional() @IsString() saleStartDate?: string;
  @IsOptional() @IsString() saleEndDate?: string;
  @IsNumber() @Min(0) stock: number;
  @IsOptional() @IsBoolean() inStock?: boolean;
  @IsOptional() @IsArray() @IsString({ each: true }) images?: string[];
  @IsOptional() @IsNumber() weight?: number;
  @IsOptional() @IsNumber() length?: number;
  @IsOptional() @IsNumber() width?: number;
  @IsOptional() @IsNumber() height?: number;
  @IsOptional() @IsBoolean() isDefault?: boolean;
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attributeValueIds?: string[];
}

export class CreateProductDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsString()
  @MaxLength(5000)
  description: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(0)
  stock: number;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsString()
  longDescription?: string;

  @IsOptional()
  @IsString()
  shippingPolicy?: string;

  @IsOptional()
  @IsString()
  returnPolicy?: string;

  @IsOptional()
  @IsString()
  brandId?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VariationDto)
  variations?: VariationDto[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  upsellIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  crossSellIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  descriptionImages?: string[];
}