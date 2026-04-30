'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ProductForm from '@/components/forms/ProductForm';
import productService from '@/services/product.service';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<any>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await productService.getProductById(id);
        setProduct({
          id: data.id,
          name: data.name,
          description: data.description,
          longDescription: data.longDescription,
          price: data.price,
          stock: data.stock,
          categoryId: data.category?.id || '',
          featured: data.featured,
          shippingPolicy: data.shippingPolicy,
          returnPolicy: data.returnPolicy,
        });
      } catch (error) {
        console.error('Error fetching product:', error);
        alert('Failed to load product. Please try again.');
        router.push('/admin/products');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h1>
          <button
            onClick={() => router.push('/admin/products')}
            className="text-blue-600 hover:text-blue-800"
          >
            Go back to products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <button
          onClick={() => router.push('/admin/products')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Products
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
        <p className="text-gray-600">Update product details below</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <ProductForm initialData={product} isEditing={true} />
        </CardContent>
      </Card>
    </div>
  );
}