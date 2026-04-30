// apps/frontend/src/components/products/ProductCard.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { resolveProductImage } from '@/lib/image';
import { ShoppingBag, Eye, Heart } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useWishlist } from '@/lib/WishlistContext';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string | null;
  images?: string[];
  category?: string | { id: number; name: string };
  featured?: boolean;
}

interface ProductCardProps {
  product: Product;
}


export default function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart, isLoading } = useCart();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const productImage = resolveProductImage(product.images || product.image);
  const isWishlisted = isInWishlist(product.id);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      router.push('/auth/login?redirect=/products');
      return;
    }

    try {
      await addToCart(product.id, 1);
    } catch (error: any) {
      alert(error.message || 'Failed to add to cart');
    }
  };

  return (
    <div
      className={`group relative bg-white transition-all duration-700 font-plus-jakarta-sans rounded-xl overflow-hidden animate-fade-in-up ${isHovered ? '-translate-y-2 shadow-xl' : 'shadow-sm border border-gray-100'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-gray-50 rounded-lg mx-2 mt-2">
        <Image
          src={productImage || 'https://placehold.co/600x600/000000/ffffff?text=No+Image'}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className={`object-cover transition-transform duration-1000 ease-out ${isHovered ? 'scale-105' : 'scale-100'}`}
        />
        <div className={`absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`}></div>
        <div className={`absolute top-2 right-2 flex flex-col space-y-1.5 transition-all duration-500 z-20 ${isHovered ? 'translate-x-0 opacity-100' : 'translate-x-12 opacity-0'}`}>
          <button
            onClick={handleAddToCart}
            disabled={isLoading || Number(product.stock) === 0}
            className="w-8 h-8 bg-white/90 backdrop-blur-md hover:bg-emerald-600 hover:text-white rounded-full flex items-center justify-center text-gray-900 transition-all duration-300 shadow-lg border border-white/20"
          >
            <ShoppingBag size={16} className={`${isLoading ? 'animate-pulse' : ''}`} />
          </button>
          <Link
            href={`/products/${product.id}`}
            className="w-8 h-8 bg-white/90 backdrop-blur-md hover:bg-black hover:text-white rounded-full flex items-center justify-center text-gray-900 transition-all duration-300 shadow-lg border border-white/20"
          >
            <Eye size={16} />
          </Link>
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleWishlist(product);
            }}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg border border-white/20 ${isWishlisted ? 'bg-red-600 text-white border-red-600' : 'bg-white/90 backdrop-blur-md text-gray-900 hover:bg-red-600 hover:text-white'}`}
          >
            <Heart size={16} className={`${isWishlisted ? 'fill-current' : ''}`} />
          </button>
        </div>
        <div className="absolute top-2 left-2 flex flex-col gap-1.5">
          {product.category && (
            <span className="inline-block bg-black/90 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded shadow-sm border border-white/10">
              {typeof product.category === 'object' ? product.category.name : product.category}
            </span>
          )}
          {product.featured && (
            <span className="inline-block bg-emerald-600 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded shadow-sm">
              Featured
            </span>
          )}
        </div>
      </div>
      <div className="p-3 text-center">
        <h3 className="text-[13px] md:text-[14px] font-bold text-gray-900 group-hover:text-emerald-600 transition-colors duration-500 line-clamp-1 mb-1.5">
          <Link href={`/products/${product.id}`}>
            {product.name}
          </Link>
        </h3>
        <div className="space-y-1.5">
          <div className="flex items-center justify-center space-x-2">
            <span className="text-base font-black text-black tracking-tight">
              ${Number(product.price).toFixed(2)}
            </span>
          </div>
          <div className="flex items-center justify-center">
            {Number(product.stock) > 0 ? (
              <span className="text-[10px] uppercase font-black tracking-widest text-emerald-600 flex items-center gap-1.5">
                <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></span>
                In Stock
              </span>
            ) : (
              <span className="text-[10px] uppercase font-black tracking-widest text-gray-400">
                Unavailable
              </span>
            )}
          </div>
        </div>
        <div className="mt-3 flex justify-center">
          <div className={`h-[1px] bg-emerald-500 transition-all duration-700 rounded-full ${isHovered ? 'w-8' : 'w-0'}`}></div>
        </div>
      </div>
    </div>
  );
}