import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  UseInterceptors,
  UploadedFiles,
  NotFoundException,
  Query
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductFilterDto } from './dto/product-filter.dto';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  @Get('test')
  test() {
    return {
      message: 'Products API is working!',
      timestamp: new Date().toISOString(),
      status: 'OK'
    };
  }

  @Post()
  @UseInterceptors(FilesInterceptor('images'))
  async create(
    @Body() body: any,
    @UploadedFiles() images?: Express.Multer.File[],
  ) {
    // Create correct DTO with proper types
    const createProductDto = new CreateProductDto();
    createProductDto.name = body.name;
    createProductDto.description = body.description;
    createProductDto.longDescription = body.longDescription;
    createProductDto.shippingPolicy = body.shippingPolicy;
    createProductDto.returnPolicy = body.returnPolicy;
    createProductDto.sku = body.sku;

    // Robust parsing
    const parsedPrice = parseFloat(body.price);
    const parsedStock = parseInt(body.stock);

    createProductDto.price = isNaN(parsedPrice) ? 0 : parsedPrice;
    createProductDto.stock = isNaN(parsedStock) ? 0 : parsedStock;
    createProductDto.category = body.category;
    createProductDto.featured = body.featured === 'true' || body.featured === true;

    if (body.brandId) createProductDto.brandId = body.brandId;
    if (body.upsellIds) {
      createProductDto.upsellIds = Array.isArray(body.upsellIds)
        ? body.upsellIds
        : [body.upsellIds];
    }
    if (body.crossSellIds) {
      createProductDto.crossSellIds = Array.isArray(body.crossSellIds)
        ? body.crossSellIds
        : [body.crossSellIds];
    }

    if (body.descriptionImages) {
      try {
        createProductDto.descriptionImages = typeof body.descriptionImages === 'string'
          ? JSON.parse(body.descriptionImages)
          : body.descriptionImages;
      } catch (e) {
        console.error('Failed to parse descriptionImages:', e);
      }
    }

    if (body.variations) {
      try {
        createProductDto.variations = JSON.parse(body.variations);
      } catch (e) {
        console.error('Failed to parse variations:', e);
      }
    }

    try {
      const result = await this.productsService.create(createProductDto, images);
      return result;
    } catch (error) {
      console.error('Error creating product:', error);
      return { error: 'Internal server error' };
    }
  }

  @Get()
  async findAll(@Query() filters?: ProductFilterDto) { // UPDATE THIS METHOD
    if (filters?.featured !== undefined || filters?.category || filters?.search) {
      return this.productsService.findAll(filters);
    }
    return this.productsService.findAll();
  }

  @Get('featured') // ADD THIS ENDPOINT
  async findFeatured(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit) : undefined;
    return this.productsService.findFeaturedProducts(limitNum);
  }

  @Get('categories') // ADD THIS ENDPOINT
  async getCategories() {
    const categories = await this.productsService.getCategories();
    return { categories };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.productsService.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }
      throw error;
    }
  }

  @Patch(':id')
  @UseInterceptors(FilesInterceptor('images'))
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: any,
    @UploadedFiles() images?: Express.Multer.File[],
  ) {
    try {
      await this.productsService.findOne(id);

      const updateData: any = {};
      if (updateProductDto.name !== undefined) updateData.name = updateProductDto.name;
      if (updateProductDto.description !== undefined) updateData.description = updateProductDto.description;
      if (updateProductDto.longDescription !== undefined) updateData.longDescription = updateProductDto.longDescription;
      if (updateProductDto.shippingPolicy !== undefined) updateData.shippingPolicy = updateProductDto.shippingPolicy;
      if (updateProductDto.returnPolicy !== undefined) updateData.returnPolicy = updateProductDto.returnPolicy;
      if (updateProductDto.sku !== undefined) updateData.sku = updateProductDto.sku;
      if (updateProductDto.price !== undefined) updateData.price = parseFloat(updateProductDto.price);
      if (updateProductDto.stock !== undefined) updateData.stock = parseInt(updateProductDto.stock);
      if (updateProductDto.category) updateData.category = updateProductDto.category;
      if (updateProductDto.featured !== undefined) updateData.featured = updateProductDto.featured === 'true' || updateProductDto.featured === true;

      if (updateProductDto.brandId) updateData.brandId = updateProductDto.brandId;
      if (updateProductDto.upsellIds) {
        updateData.upsellIds = Array.isArray(updateProductDto.upsellIds)
          ? updateProductDto.upsellIds
          : [updateProductDto.upsellIds];
      }
      if (updateProductDto.crossSellIds) {
        updateData.crossSellIds = Array.isArray(updateProductDto.crossSellIds)
          ? updateProductDto.crossSellIds
          : [updateProductDto.crossSellIds];
      }

      const updatedProduct = await this.productsService.update(id, updateData, images);
      return {
        message: 'Product updated successfully',
        data: updatedProduct,
      };
    } catch (error) {
      console.error('Error updating product:', error);
      if (error instanceof NotFoundException) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }
      return { error: 'Internal server error' };
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      await this.productsService.findOne(id);

      await this.productsService.remove(id);
      return {
        success: true,
        message: 'Product deleted successfully'
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }
      throw error;
    }
  }
}