// apps/frontend/src/components/products/ProductDetail.tsx
'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Heart, Share2, Info, Plus, Minus, Check, Truck, ShieldCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { resolveProductImage } from '@/lib/image';

import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/lib/auth';

interface AttributeValue {
  id: number;
  value: string;
  attribute: {
    name: string;
  };
}

interface Variation {
  id: number;
  sku: string;
  price: number;
  salePrice?: number;
  stock: number;
  images?: string[];
  attributeValues: AttributeValue[];
}

interface Product {
  id: number;
  name: string;
  description: string;
  longDescription?: string;
  price: number;
  stock: number;
  image: string | null;
  images?: string[];
  category?: string | { id: number; name: string };
  brand?: { name: string };
  variations?: Variation[];
  createdAt: string;
}

interface ProductDetailProps {
  product: Product;
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { addToCart, isLoading: cartLoading } = useCart();

  const [addingToCart, setAddingToCart] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isShortDescOpen, setIsShortDescOpen] = useState(true);

  // Group attributes from all variations
  const attributes = useMemo(() => {
    const map: { [key: string]: Set<string> } = {};
    product.variations?.forEach(v => {
      v.attributeValues.forEach(av => {
        if (!map[av.attribute.name]) {
          map[av.attribute.name] = new Set();
        }
        map[av.attribute.name].add(av.value);
      });
    });
    return Object.keys(map).map(name => ({
      name,
      values: Array.from(map[name])
    }));
  }, [product.variations]);

  // Selected values state: { "Color": "Red", "Size": "XL" }
  const [selectedAttributes, setSelectedAttributes] = useState<{ [key: string]: string }>({});

  const handleAttributeSelect = (name: string, value: string) => {
    setSelectedAttributes(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageSelect = (idx: number) => {
    setSelectedImage(idx);
    const clickedImage = allImages[idx];

    // Find variation that has this image and select it
    if (product.variations) {
      const variationWithImage = product.variations.find(v =>
        v.images?.some(vImg => vImg === clickedImage)
      );

      if (variationWithImage) {
        const newAttributes: { [key: string]: string } = {};
        variationWithImage.attributeValues.forEach(av => {
          newAttributes[av.attribute.name] = av.value;
        });
        setSelectedAttributes(newAttributes);
      }
    }
  };

  // Find matching variation based on ALL selected attributes
  const selectedVariation = useMemo(() => {
    if (!product.variations) return null;
    return product.variations.find(v => {
      // Every selected attribute must match the value in this variation
      return Object.entries(selectedAttributes).every(([name, value]) => {
        return v.attributeValues.some(av => av.attribute.name === name && av.value === value);
      });
    });
  }, [product.variations, selectedAttributes]);

  const currentPrice = selectedVariation?.price || product.price;
  const currentSalePrice = selectedVariation?.salePrice;
  const displayPrice = currentSalePrice || currentPrice;
  const hasSale = !!currentSalePrice && currentSalePrice < currentPrice;

  const currentStock = selectedVariation?.stock || product.stock;
  const currentSku = selectedVariation?.sku || `KOT-SG-${product.id}`;

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=/products/${product.id}`);
      return;
    }

    const missingAttributes = attributes.filter(attr => !selectedAttributes[attr.name]);
    if (missingAttributes.length > 0) {
      alert(`Please select ${missingAttributes.map(a => a.name).join(', ')}`);
      return;
    }

    setAddingToCart(true);
    try {
      await addToCart(product.id, quantity, selectedVariation?.id);
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      alert(error.message || 'Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const allImages = useMemo(() => {
    const images = product.images && product.images.length > 0
      ? [...product.images]
      : [product.image || ''];

    // Add variation images if a variation is selected
    if (selectedVariation?.images && selectedVariation.images.length > 0) {
      const varImages = selectedVariation.images.filter((img: string) => !images.includes(img));
      return [...varImages, ...images];
    }
    return images;
  }, [product, selectedVariation]);

  return (
    <div className="space-y-4 md:space-y-6 pb-6 md:pb-12 font-plus-jakarta-sans text-gray-900 animate-fade-in-up">
      <Card className="border-none shadow-[0_20px_50px_rgba(0,0,0,0.04)] rounded-[2.5rem] md:rounded-[3rem] overflow-hidden bg-white/70 backdrop-blur-xl border border-white/20">
        <CardContent className="p-4 md:p-6 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 lg:gap-10">
            {/* Image Gallery */}
            <div className="space-y-4 md:space-y-6">
              <div className="relative aspect-square w-full max-w-sm mx-auto rounded-[2.5rem] overflow-hidden bg-gray-50/50 border border-gray-100 shadow-inner group">
                <img
                  src={resolveProductImage(allImages[selectedImage]) || 'https://placehold.co/600x600/000000/ffffff?text=No+Image'}
                  alt={product.name}
                  className="absolute inset-0 w-full h-full object-contain transition-all duration-1000 ease-out group-hover:scale-110"
                />
                <div className="absolute top-6 right-6 flex flex-col gap-3">
                  <button
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-md shadow-lg border border-white/30 ${isWishlisted ? 'bg-rose-500 text-white border-rose-500' : 'bg-white/80 text-gray-900 hover:text-rose-500'}`}
                  >
                    <Heart size={20} className={isWishlisted ? 'fill-current' : ''} />
                  </button>
                  <button className="w-12 h-12 bg-white/80 backdrop-blur-md hover:bg-emerald-600 hover:text-white rounded-full flex items-center justify-center text-gray-900 transition-all duration-300 shadow-lg border border-white/30">
                    <Share2 size={20} />
                  </button>
                </div>
              </div>

              {allImages.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none snap-x justify-center">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleImageSelect(idx)}
                      className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all duration-500 flex-shrink-0 snap-center ${selectedImage === idx
                        ? 'border-emerald-600 scale-95 shadow-lg'
                        : 'border-transparent opacity-50 hover:opacity-100 hover:scale-105'
                        }`}
                    >
                      <img 
                        src={resolveProductImage(img) || 'https://placehold.co/600x600/000000/ffffff?text=No+Image'} 
                        className="absolute inset-0 w-full h-full object-cover" 
                        alt="" 
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="flex flex-col space-y-4 md:space-y-6">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="px-5 py-2 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-emerald-100/30">
                      {(product.category && typeof product.category === 'object') ? product.category.name : (product.category || 'Premium Series')}
                    </span>
                    {product.brand && (
                      <span className="px-5 py-2 bg-gray-50 text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-gray-100">
                        {product.brand.name}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col items-end">
                    {hasSale && (
                      <span className="text-sm text-gray-400 line-through font-bold opacity-70">
                        ${Number(currentPrice).toFixed(2)}
                      </span>
                    )}
                    <div className="text-3xl font-black text-emerald-600 tracking-tighter flex items-start gap-1">
                      <span className="text-lg mt-1 opacity-70 font-bold">$</span>
                      {Number(displayPrice).toFixed(2).split('.')[0]}
                      <span className="text-lg mt-1 opacity-70 font-bold">.{Number(displayPrice).toFixed(2).split('.')[1]}</span>
                    </div>
                  </div>
                </div>

                <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-[1.2]">
                  {product.name}
                </h1>

                <p className="text-[11px] font-black text-emerald-900/40 uppercase tracking-[0.3em]">
                  SKU : {currentSku}
                </p>
              </div>

              {/* Variations */}
              <div className="space-y-6 md:space-y-8 pt-2 md:pt-4">
                {/* Collapsible Short Description */}
                <div className="overflow-hidden rounded-3xl border border-gray-100 shadow-sm bg-white">
                  <button
                    onClick={() => setIsShortDescOpen(!isShortDescOpen)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left bg-emerald-900 text-white transition-all hover:bg-emerald-800"
                  >
                    <span className="text-xs font-black uppercase tracking-[0.2em]">Product Highlights</span>
                    {isShortDescOpen ? <Minus size={16} /> : <Plus size={16} />}
                  </button>
                  <div className={`transition-all duration-300 ease-in-out ${isShortDescOpen ? 'max-h-[500px] opacity-100 p-6' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                    <div
                      className="prose prose-sm max-w-none text-gray-600 font-medium leading-relaxed rich-text-content"
                      dangerouslySetInnerHTML={{ __html: product.description }}
                    />
                  </div>
                </div>

                {/* Dynamic Attributes */}
                {attributes.map((attr) => (
                  <div key={attr.name} className="space-y-4">
                    <label className="text-[11px] font-black uppercase tracking-[0.25em] text-gray-900 flex items-center gap-2">
                      {attr.name} Selection
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {attr.values.map((val) => {
                        const isSelected = selectedAttributes[attr.name] === val;
                        // For Colors, we can try to render a circle if it looks like a color name
                        const isColor = attr.name.toLowerCase() === 'color';

                        return (
                          <button
                            key={val}
                            onClick={() => handleAttributeSelect(attr.name, val)}
                            className={`min-w-[56px] h-14 px-4 rounded-2xl border-2 font-black text-xs transition-all duration-300 flex items-center justify-center gap-2 ${isSelected
                              ? 'border-black bg-black text-white shadow-xl shadow-black/20 translate-y-[-4px]'
                              : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'
                              }`}
                          >
                            {isColor && (
                              <div
                                className="w-4 h-4 rounded-full border border-white/20"
                                style={{ backgroundColor: val.toLowerCase() }}
                              />
                            )}
                            {val}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
                  <div className="flex items-center gap-3 p-3 md:p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <Truck className="text-emerald-500 flex-shrink-0" size={18} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-900">Premium Delivery</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 md:p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <ShieldCheck className="text-emerald-500 flex-shrink-0" size={18} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-900">100% Authentic</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-50">
                  <div className="flex items-center bg-gray-50 rounded-2xl p-2 px-5 gap-6 border border-gray-100 self-start sm:self-auto shadow-inner h-[60px]">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 flex items-center justify-center text-xl font-black text-gray-400 hover:text-emerald-600 transition-colors"
                    >-</button>
                    <span className="w-6 text-center font-black text-lg">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center text-xl font-black text-gray-400 hover:text-emerald-600 transition-colors"
                    >+</button>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    disabled={currentStock === 0 || addingToCart}
                    className="flex-grow h-[60px] flex items-center justify-center px-8 md:px-12 py-4 md:py-5 bg-emerald-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] hover:bg-emerald-950 transition-colors shadow-lg shadow-emerald-900/20 active:scale-95 group overflow-hidden relative"
                  >
                    <div className="relative flex items-center">
                      <ShoppingCart className="w-4 h-4 mr-4" />
                      {addingToCart ? 'Authenticating...' : currentStock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
