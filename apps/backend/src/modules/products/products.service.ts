// apps/backend/src/modules/products/products.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { ProductVariation } from './variation.entity';
import { Brand } from '../brands/brand.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductFilterDto } from './dto/product-filter.dto';
import { CloudinaryService } from '../uploads/cloudinary.service';
import { Category } from '../categories/category.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(ProductVariation)
    private variationRepository: Repository<ProductVariation>,
    @InjectRepository(Brand)
    private brandRepository: Repository<Brand>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    private cloudinaryService: CloudinaryService,
  ) { }

  private async getOrCreateCategory(name: string): Promise<Category> {
    let category = await this.categoryRepository.findOne({ where: { name } });
    if (!category) {
      category = this.categoryRepository.create({ name });
      category = await this.categoryRepository.save(category);
    }
    return category;
  }

  async create(createProductDto: CreateProductDto, images?: Express.Multer.File[]): Promise<any> {
    const imageUrls: string[] = [];

    if (images && images.length > 0) {
      for (const image of images) {
        const url = await this.cloudinaryService.uploadImage(image);
        imageUrls.push(url);
      }
    }

    const productData: Partial<Product> = {
      name: createProductDto.name,
      description: createProductDto.description,
      longDescription: createProductDto.longDescription,
      shippingPolicy: createProductDto.shippingPolicy,
      returnPolicy: createProductDto.returnPolicy,
      price: createProductDto.price,
      stock: createProductDto.stock,
      sku: createProductDto.sku,
      categoryId: createProductDto.categoryId,
      featured: typeof createProductDto.featured === 'string' ? createProductDto.featured === 'true' : !!createProductDto.featured,
      images: imageUrls,
      descriptionImages: createProductDto.descriptionImages || [],
      brandId: createProductDto.brandId,
      upsellIds: createProductDto.upsellIds || [],
      crossSellIds: createProductDto.crossSellIds || [],
    };

    if (!productData.categoryId && createProductDto.category) {
       const cat = await this.getOrCreateCategory(createProductDto.category);
       productData.categoryId = cat.id;
    }

    const product = this.productRepository.create(productData as Product);
    const savedProduct = await this.productRepository.save(product);

    if (createProductDto.variations && createProductDto.variations.length > 0) {
      for (const vDto of createProductDto.variations) {
        const variation = this.variationRepository.create({
          ...vDto,
          productId: savedProduct.id,
          attributeValueIds: vDto.attributeValueIds || [],
        } as any);
        await this.variationRepository.save(variation);
      }
    }

    return {
      message: 'Product created successfully',
      data: await this.findOne(savedProduct.id),
    };
  }

  async findAll(filters?: ProductFilterDto): Promise<Product[]> {
    const where: any = {};

    if (filters?.category) {
       const cat = await this.categoryRepository.findOne({ where: { name: filters.category } });
       if (cat) where.categoryId = cat.id;
    }

    if (filters?.featured !== undefined) {
      where.featured = filters.featured;
    }

    if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
      where.price = {};
      if (filters.minPrice !== undefined) where.price.$gte = filters.minPrice;
      if (filters.maxPrice !== undefined) where.price.$lte = filters.maxPrice;
    }

    if (filters?.search) {
      where.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } }
      ];
    }

    const products = await this.productRepository.find({
      where,
      order: { createdAt: 'DESC' } as any,
      take: filters?.limit,
    });

    // Manually join basic info if needed for listings
    for (const p of products) {
        if (p.brandId) p.brand = await this.brandRepository.findOne({ where: { _id: p.brandId } as any });
        p.variations = await this.variationRepository.find({ where: { productId: p.id } });
    }

    return products;
  }

  async findFeaturedProducts(limit?: number): Promise<Product[]> {
    return this.findAll({ featured: true, limit });
  }

  async getCategories(): Promise<string[]> {
    const categories = await this.categoryRepository.find();
    return categories.map(c => c.name);
  }

  async findOne(id: string): Promise<Product> {
    const { ObjectId } = require('mongodb');
    const objectId = new ObjectId(id);

    const product = await this.productRepository.findOne({
      where: { _id: objectId } as any,
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // Manual joins for MongoDB
    if (product.brandId) product.brand = await this.brandRepository.findOne({ where: { _id: new ObjectId(product.brandId) } as any });
    if (product.categoryId) product.category = await this.categoryRepository.findOne({ where: { _id: new ObjectId(product.categoryId) } as any });
    product.variations = await this.variationRepository.find({ where: { productId: product.id } });
    
    if (product.upsellIds && product.upsellIds.length > 0) {
        const upIds = product.upsellIds.map((u: string) => new ObjectId(u));
        product.upsells = await this.productRepository.find({ where: { _id: { $in: upIds } } as any });
    }
    
    if (product.crossSellIds && product.crossSellIds.length > 0) {
        const crIds = product.crossSellIds.map((c: string) => new ObjectId(c));
        product.crossSells = await this.productRepository.find({ where: { _id: { $in: crIds } } as any });
    }

    return product;
  }

  async update(id: string, updateProductDto: any, images?: Express.Multer.File[]): Promise<Product> {
    const product = await this.findOne(id);
    const imageUrls: string[] = product.images || [];

    if (images && images.length > 0) {
       for (const image of images) {
         const url = await this.cloudinaryService.uploadImage(image);
         imageUrls.push(url);
       }
    }

    const updateData: any = { ...updateProductDto };

    if (updateProductDto.category) {
      const cat = await this.getOrCreateCategory(updateProductDto.category);
      updateData.categoryId = cat.id;
    }

    if (updateProductDto.price !== undefined) updateData.price = parseFloat(updateProductDto.price);
    if (updateProductDto.stock !== undefined) updateData.stock = parseInt(updateProductDto.stock);
    
    updateData.images = imageUrls;

    if (updateData.variations) {
      await this.variationRepository.delete({ productId: id } as any);
      for (const vDto of updateData.variations) {
        const variation = this.variationRepository.create({
          ...vDto,
          productId: id,
          attributeValueIds: vDto.attributeValueIds || [],
        } as any);
        await this.variationRepository.save(variation);
      }
      delete updateData.variations;
    }

    await this.productRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.productRepository.delete(id);
    await this.variationRepository.delete({ productId: id } as any);
  }
}