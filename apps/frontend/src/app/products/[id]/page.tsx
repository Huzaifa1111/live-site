// apps/frontend/src/app/products/[id]/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import productService, { Product } from '@/services/product.service';
import { resolveProductImage } from '@/lib/image';
import { ArrowLeft, Package, Star, Loader2, Sparkles, TrendingUp, MessageSquare, Info, Truck, RotateCcw, Award, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/lib/auth';
import ReviewForm from '@/components/products/ReviewForm';
import ReviewList from '@/components/products/ReviewList';
import ProductDetail from '@/components/products/ProductDetail';
import ProductCard from '@/components/products/ProductCard';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import api from '@/lib/api';

const SHIPPING_POLICIES = [
  `
  <ul class="space-y-2 text-sm text-gray-600 leading-relaxed">
    <li class="flex items-start gap-2"><span class="text-emerald-600 font-bold">•</span> Free standard shipping on orders over $100</li>
    <li class="flex items-start gap-2"><span class="text-emerald-600 font-bold">•</span> Express delivery available (2-3 business days)</li>
    <li class="flex items-start gap-2"><span class="text-emerald-600 font-bold">•</span> International shipping available to over 50 countries</li>
    <li class="flex items-start gap-2"><span class="text-emerald-600 font-bold">•</span> All items are carefully packaged and insured</li>
  </ul>
  `,
  `
  <ul class="space-y-2 text-sm text-gray-600 leading-relaxed">
    <li class="flex items-start gap-2"><span class="text-emerald-600 font-bold">•</span> Standard shipping takes 3-5 business days</li>
    <li class="flex items-start gap-2"><span class="text-emerald-600 font-bold">•</span> Priority handling for all premium orders</li>
    <li class="flex items-start gap-2"><span class="text-emerald-600 font-bold">•</span> Secure tracking provided via email</li>
    <li class="flex items-start gap-2"><span class="text-emerald-600 font-bold">•</span> Fragile items receive double-layered protection</li>
  </ul>
  `,
  `
  <ul class="space-y-2 text-sm text-gray-600 leading-relaxed">
    <li class="flex items-start gap-2"><span class="text-emerald-600 font-bold">•</span> Ships within 24 hours of purchase</li>
    <li class="flex items-start gap-2"><span class="text-emerald-600 font-bold">•</span> Local delivery options for nearby areas</li>
    <li class="flex items-start gap-2"><span class="text-emerald-600 font-bold">•</span> Eco-friendly packaging used whenever possible</li>
    <li class="flex items-start gap-2"><span class="text-emerald-600 font-bold">•</span> Signature required for high-value shipments</li>
  </ul>
  `
];

const RETURN_POLICIES = [
  `
  <ul class="space-y-2 text-sm text-gray-600 leading-relaxed">
    <li class="flex items-start gap-2"><span class="text-emerald-600 font-bold">•</span> 30-day return window for unworn items</li>
    <li class="flex items-start gap-2"><span class="text-emerald-600 font-bold">•</span> Original packaging and tags must be intact</li>
    <li class="flex items-start gap-2"><span class="text-emerald-600 font-bold">•</span> Free return shipping on defective items</li>
    <li class="flex items-start gap-2"><span class="text-emerald-600 font-bold">•</span> Refunds processed within 5-7 business days</li>
  </ul>
  `,
  `
  <ul class="space-y-2 text-sm text-gray-600 leading-relaxed">
    <li class="flex items-start gap-2"><span class="text-emerald-600 font-bold">•</span> Hassle-free returns within 14 days of receipt</li>
    <li class="flex items-start gap-2"><span class="text-emerald-600 font-bold">•</span> Store credit available for opened items</li>
    <li class="flex items-start gap-2"><span class="text-emerald-600 font-bold">•</span> Quick exchange for size or color variance</li>
    <li class="flex items-start gap-2"><span class="text-emerald-600 font-bold">•</span> Quality check required for all returned goods</li>
  </ul>
  `,
  `
  <ul class="space-y-2 text-sm text-gray-600 leading-relaxed">
    <li class="flex items-start gap-2"><span class="text-emerald-600 font-bold">•</span> Lifetime guarantee on manufacturing defects</li>
    <li class="flex items-start gap-2"><span class="text-emerald-600 font-bold">•</span> Easy return portal accessible via dashboard</li>
    <li class="flex items-start gap-2"><span class="text-emerald-600 font-bold">•</span> No restocking fees for loyal members</li>
    <li class="flex items-start gap-2"><span class="text-emerald-600 font-bold">•</span> International returns handled case-by-case</li>
  </ul>
  `
];

const getRandomPolicy = (policies: string[], seed: number) => {
  return policies[seed % policies.length];
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [product, setProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'details' | 'reviews' | 'shipping' | 'brand'>('details');
  const scrollRef = useRef<HTMLDivElement>(null);

  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await productService.getProductById(id);
        console.log('Fetched Product:', data);
        setProduct(data);
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
      fetchReviews();
    }
  }, [id]);

  const fetchReviews = async () => {
    try {
      setReviewsLoading(true);
      const response = await api.get(`/reviews/product/${id}`);
      setReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setReviewsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">Loading Product Details</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center font-plus-jakarta-sans bg-white">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-100 mx-auto mb-6" />
          <h1 className="text-3xl font-black text-gray-900 mb-4 tracking-tighter">Product Not Found</h1>
          <button onClick={() => router.push('/products')} className="px-8 py-3 bg-black text-white rounded-full text-[10px] font-black uppercase tracking-[0.3em] hover:bg-emerald-600 transition-all">
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] relative overflow-hidden font-plus-jakarta-sans text-black pb-16">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-50 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 opacity-40 pointer-events-none"></div>

      <style jsx global>{`
        .rich-text-content img {
          max-width: 85%;
          height: auto;
          border-radius: 2rem;
          margin: 2.5rem auto;
          display: block;
          box-shadow: 0 20px 50px rgba(0,0,0,0.05);
          border: 1px solid rgba(0,0,0,0.05);
        }
        .prose-emerald img {
          border-radius: 1.5rem;
        }
      `}</style>

      <div className="max-w-[1440px] mx-auto px-4 md:px-12 py-6 md:py-10 relative z-10">
        <Breadcrumbs customLabels={{ [id.toString()]: product.name }} />

        <button
          onClick={() => router.back()}
          className="group flex items-center text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 hover:text-emerald-600 mb-6 transition-all"
        >
          <ArrowLeft className="w-4 h-4 mr-3 group-hover:-translate-x-2 transition-transform" />
          Back to Products
        </button>

        <ProductDetail product={product as any} />

        {/* Tab Selection */}
        <div className="mt-12 md:mt-20 border-b border-gray-100 mb-8 flex items-center justify-center gap-8 md:gap-12">
          <button
            onClick={() => setActiveTab('details')}
            className={`flex items-center gap-3 pb-6 text-xs font-black uppercase tracking-[0.3em] transition-all relative ${activeTab === 'details' ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <Info size={16} />
            Description
            {activeTab === 'details' && (
              <div className="absolute bottom-0 left-0 w-full h-1 bg-emerald-600 rounded-full animate-in fade-in slide-in-from-bottom-1 duration-300"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`flex items-center gap-3 pb-6 text-xs font-black uppercase tracking-[0.3em] transition-all relative ${activeTab === 'reviews' ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <MessageSquare size={16} />
            Reviews & Feedback
            {activeTab === 'reviews' && (
              <div className="absolute bottom-0 left-0 w-full h-1 bg-emerald-600 rounded-full animate-in fade-in slide-in-from-bottom-1 duration-300"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('shipping')}
            className={`flex items-center gap-3 pb-6 text-xs font-black uppercase tracking-[0.3em] transition-all relative ${activeTab === 'shipping' ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <Truck size={16} />
            Shipping & Return
            {activeTab === 'shipping' && (
              <div className="absolute bottom-0 left-0 w-full h-1 bg-emerald-600 rounded-full animate-in fade-in slide-in-from-bottom-1 duration-300"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('brand')}
            className={`flex items-center gap-3 pb-6 text-xs font-black uppercase tracking-[0.3em] transition-all relative ${activeTab === 'brand' ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <Award size={16} />
            About Brand
            {activeTab === 'brand' && (
              <div className="absolute bottom-0 left-0 w-full h-1 bg-emerald-600 rounded-full animate-in fade-in slide-in-from-bottom-1 duration-300"></div>
            )}
          </button>
        </div>

        {/* Tab Content */}
        <div className="min-h-[300px]">
          {activeTab === 'details' ? (
            <div className="bg-emerald-50/30 p-6 md:p-8 rounded-3xl border border-emerald-50/50 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 text-emerald-900/10 group-hover:scale-110 transition-transform duration-700">
                <Package size={100} />
              </div>
              <div
                className="prose prose-emerald max-w-none text-emerald-900/70 font-medium leading-[2] text-base md:text-lg rich-text-content"
                dangerouslySetInnerHTML={{ __html: product.longDescription || product.description || "No additional details available for this product." }}
              />

              {/* Description Images Gallery */}
              {product.descriptionImages && product.descriptionImages.length > 0 && (
                <div className="mt-12 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 bg-emerald-600 rounded-full animate-pulse"></span>
                      <h3 className="text-xl font-black text-emerald-900 tracking-tight uppercase tracking-[0.2em] text-[10px]">Product Gallery</h3>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          if (scrollRef.current) scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
                        }}
                        className="p-2 rounded-full bg-white border border-emerald-100 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button
                        onClick={() => {
                          if (scrollRef.current) scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
                        }}
                        className="p-2 rounded-full bg-white border border-emerald-100 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>

                  <div
                    ref={scrollRef}
                    className="flex gap-6 overflow-x-auto pb-8 scrollbar-none snap-x snap-mandatory px-2"
                  >
                    {product.descriptionImages.map((img: string, idx: number) => (
                      <div key={idx} className="flex-shrink-0 w-72 md:w-80 snap-center">
                        <div className="group relative aspect-square rounded-[2rem] overflow-hidden border-4 border-white shadow-xl hover:shadow-emerald-200/50 transition-all duration-700">
                          <img
                            src={resolveProductImage(img)}
                            alt={`${product.name} - Image ${idx + 1}`}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : activeTab === 'shipping' ? (
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
              <div className="flex items-start gap-4 p-4 bg-emerald-50/30 rounded-2xl border border-emerald-100/50">
                <Truck className="text-emerald-600 flex-shrink-0 mt-1" size={24} />
                <div className="space-y-2 w-full">
                  <h3 className="text-lg font-black text-gray-900 uppercase tracking-wide">Shipping Policy</h3>
                  {product.shippingPolicy ? (
                    <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: product.shippingPolicy }} />
                  ) : (
                    <div className="w-full" dangerouslySetInnerHTML={{ __html: getRandomPolicy(SHIPPING_POLICIES, id) }} />
                  )}
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <RotateCcw className="text-gray-600 flex-shrink-0 mt-1" size={24} />
                <div className="space-y-2 w-full">
                  <h3 className="text-lg font-black text-gray-900 uppercase tracking-wide">Return Policy</h3>
                  {product.returnPolicy ? (
                    <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: product.returnPolicy }} />
                  ) : (
                    <div className="w-full" dangerouslySetInnerHTML={{ __html: getRandomPolicy(RETURN_POLICIES, id) }} />
                  )}
                </div>
              </div>
            </div>
          ) : activeTab === 'brand' ? (
            <div className="bg-gradient-to-br from-emerald-50/50 to-white p-6 md:p-8 rounded-3xl border border-emerald-100/50 shadow-sm space-y-6">
              <div className="flex items-center gap-4 pb-4 border-b border-emerald-100">
                <Award className="text-emerald-600" size={32} />
                <div>
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight">{product.brand?.name || 'Premium Brand'}</h3>
                  <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">Est. Since Excellence</p>
                </div>
              </div>
              <div className="prose prose-emerald max-w-none text-gray-700 leading-relaxed space-y-4">
                <p className="font-medium">
                  {product.brand?.name || 'Our brand'} represents the pinnacle of craftsmanship and innovation in luxury goods.
                  With decades of heritage and a commitment to excellence, we deliver products that transcend trends and stand the test of time.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="p-4 bg-white rounded-2xl border border-gray-100 text-center">
                    <div className="text-3xl font-black text-emerald-600 mb-2">50+</div>
                    <div className="text-xs font-bold uppercase tracking-wider text-gray-500">Years Heritage</div>
                  </div>
                  <div className="p-4 bg-white rounded-2xl border border-gray-100 text-center">
                    <div className="text-3xl font-black text-emerald-600 mb-2">100%</div>
                    <div className="text-xs font-bold uppercase tracking-wider text-gray-500">Authentic</div>
                  </div>
                  <div className="p-4 bg-white rounded-2xl border border-gray-100 text-center">
                    <div className="text-3xl font-black text-emerald-600 mb-2">Global</div>
                    <div className="text-xs font-bold uppercase tracking-wider text-gray-500">Presence</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
              <div className="lg:col-span-8">
                {reviewsLoading ? (
                  <div className="flex justify-center py-20 bg-gray-50/50 rounded-3xl animate-pulse">
                    <Loader2 className="animate-spin text-emerald-600" size={32} />
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="py-24 text-center bg-gray-50/30 rounded-[3rem] border-2 border-dashed border-gray-100">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-300">No Reviews Yet</span>
                  </div>
                ) : (
                  <ReviewList reviews={reviews} />
                )}
              </div>

              <div className="lg:col-span-4">
                {isAuthenticated ? (
                  <div className="sticky top-8 bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-100">
                    <ReviewForm productId={id} onSuccess={fetchReviews} />
                  </div>
                ) : (
                  <div className="sticky top-8 p-12 text-center bg-gray-900 text-white rounded-[2.5rem] shadow-2xl overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500"></div>
                    <Star className="w-10 h-10 text-emerald-500 mx-auto mb-8 opacity-50" />
                    <h3 className="text-xl font-black mb-4 uppercase tracking-[0.2em]">Share Your Experience</h3>
                    <p className="text-white/40 text-[10px] mb-10 font-bold uppercase tracking-widest leading-loose">Log in to write a review about this product.</p>
                    <button
                      onClick={() => router.push(`/auth/login?redirect=/products/${id}`)}
                      className="w-full py-4 bg-white text-black rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-emerald-500 hover:text-white transition-all shadow-lg"
                    >
                      Log In
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Upsells Section */}
        {product.upsells && product.upsells.length > 0 && (
          <div className="mt-12 md:mt-16 space-y-4">
            <div className="flex items-center gap-3">
              <Sparkles size={16} className="text-emerald-600" />
              <h2 className="text-2xl md:text-3xl font-black tracking-tight text-gray-900">You May Also Like</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {product.upsells.map((upsell: any) => (
                <ProductCard key={upsell.id} product={upsell as any} />
              ))}
            </div>
          </div>
        )}

        {/* Cross-sells Section */}
        {product.crossSells && product.crossSells.length > 0 && (
          <div className="mt-12 md:mt-16 space-y-4 bg-white p-4 md:p-6 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
              <TrendingUp size={16} className="text-emerald-600" />
              <h2 className="text-2xl md:text-3xl font-black tracking-tight text-gray-900">Bought Together</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {product.crossSells.map((crossSell: any) => (
                <ProductCard key={crossSell.id} product={crossSell as any} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
