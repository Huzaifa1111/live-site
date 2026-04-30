// apps/frontend/src/app/page.tsx - UPDATED CLEAN VERSION
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import WatchHero from '@/components/WatchHero';
import ProductCard from '@/components/products/ProductCard';
import { ArrowRight, Truck, ShieldCheck, RefreshCcw, Headset, Star, ShoppingCart } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { resolveProductImage } from '@/lib/image';

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.8, ease: "anticipate" } as any
};

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingToCartId, setAddingToCartId] = useState<number | null>(null);

  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const handleAddToCart = async (product: any) => {
    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=/`);
      return;
    }

    try {
      setAddingToCartId(product.id);
      await addToCart(product.id, 1);
      // Optional: you could add a toast here
    } catch (error: any) {
      alert(error.message || 'Failed to add to cart');
    } finally {
      setAddingToCartId(null);
    }
  };

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        console.log('🔄 Fetching featured products...');

        // First, get all products to see what's in DB
        const allResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/products`);
        const allProducts = await allResponse.json();

        console.log('📊 All products from API:', allProducts.length);
        console.log('🔍 Featured status of all products:');
        allProducts.forEach((p: any) => {
          console.log(`  ID ${p.id}: "${p.name}" - Featured: ${p.featured}`);
        });

        const featuredCount = allProducts.filter((p: any) => p.featured === true).length;
        console.log(`⭐ Products with featured=true: ${featuredCount}`);

        // Now try the featured endpoint
        console.log('🔗 Calling /products/featured endpoint...');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/products/featured?limit=8`);

        if (response.ok) {
          const data = await response.json();
          console.log('✅ Featured endpoint returned:', data.length, 'products');
          console.log('Featured data:', data);

          setFeaturedProducts(data);

          if (data.length === 0 && featuredCount > 0) {
            console.error('⚠️ BUG DETECTED: Products have featured=true but endpoint returns empty!');
            setError('BUG: Products marked as featured but not showing. Check backend logs.');
          }
        } else {
          console.error('❌ Featured endpoint failed:', response.status);
          setError('Featured endpoint error: ' + response.status);
        }

      } catch (err: any) {
        console.error('❌ Error fetching products:', err);
        setError('Cannot connect to backend. Make sure it\'s running on port 4000.');

        // Show fallback data for testing
        setFeaturedProducts([
          {
            id: 999,
            name: "Test Featured Product",
            description: "This is a test featured product",
            price: 99.99,
            stock: 10,
            image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000",
            featured: true,
            category: "Electronics",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  // Add debug logging
  useEffect(() => {
    console.log('📦 Current featured products:', featuredProducts);
    console.log('📊 Count:', featuredProducts.length);
  }, [featuredProducts]);

  const categories = [
    { name: 'Electronic Devices', image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=1000&auto=format&fit=crop', link: '/products?category=Electronic Devices' },
    { name: 'Electronic Accessories', image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=1000&auto=format&fit=crop', link: '/products?category=Electronic Accessories' },
    { name: 'TV & Home Appliances', image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?q=80&w=1000&auto=format&fit=crop', link: '/products?category=TV & Home Appliances' },
    { name: 'Health & Beauty', image: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=1000&auto=format&fit=crop', link: '/products?category=Health & Beauty' },
    { name: 'Babies & Toys', image: 'https://images.unsplash.com/photo-1532330393533-443990a51d10?q=80&w=1000&auto=format&fit=crop', link: '/products?category=Babies & Toys' },
  ];

  return (
    <div className="min-h-screen bg-white font-plus-jakarta-sans overflow-x-hidden">
      {/* Hero Watch Animation Section */}
      <WatchHero />

      {/* Feature Icons Section - Luxury Emerald Accents */}
      <motion.section
        {...fadeInUp}
        className="py-20 border-b border-gray-100 bg-[#0a0a0a]"
      >
        <div className="max-w-[1440px] mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16">
          {[
            { icon: <Truck size={36} />, title: 'Free Shipping', desc: 'On all orders over $150' },
            { icon: <ShieldCheck size={36} />, title: 'Secure Payment', desc: '100% secure payment processing' },
            { icon: <RefreshCcw size={36} />, title: 'Easy Returns', desc: '30-day money back guarantee' },
            { icon: <Headset size={36} />, title: '24/7 Support', desc: 'Dedicated support team' },
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-4 group">
              <div className="text-white group-hover:scale-110 group-hover:text-emerald-500 transition-all duration-500 transform drop-shadow-[0_0_15px_rgba(16,185,129,0)] group-hover:drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                {item.icon}
              </div>
              <div className="space-y-1">
                <h4 className="font-black uppercase tracking-[0.2em] text-[12px] text-white/90">{item.title}</h4>
                <p className="text-gray-500 text-sm font-medium">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Shop by Category - Elite Editorial Layout */}
      <section className="py-24 bg-white overflow-hidden border-b border-gray-50">
        <div className="container mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-10">
            <div className="relative">
              <span className="absolute -top-10 left-0 text-[10px] font-black uppercase tracking-[0.6em] text-emerald-600/40">Our Categories</span>
              <div className="flex items-end gap-3">
                <h2 className="text-4xl md:text-5xl font-black font-plus-jakarta-sans tracking-tighter text-black leading-tight">
                  Shop<br />
                  <span className="font-light text-emerald-500">By</span> Category
                </h2>
                <div className="w-12 h-0.5 bg-emerald-500 mb-2.5 hidden md:block"></div>
              </div>
            </div>

            <div className="max-w-md md:text-right">
              <p className="text-gray-400 text-xs md:text-sm font-medium leading-relaxed mb-6 md:ml-auto">
                Discover our handpicked collections, ranging from luxury watches to the latest tech essentials.
              </p>
              <Link href="/products" className="group inline-flex items-center text-[10px] font-black uppercase tracking-[0.3em] text-black border-b-2 border-black/10 pb-1 hover:border-emerald-500 transition-all">
                View All Products <ArrowRight size={14} className="ml-2 group-hover:translate-x-2 transition-transform" />
              </Link>
            </div>
          </div>

          <div
            id="category-slider"
            className="flex space-x-4 md:space-x-8 overflow-x-auto pb-8 scrollbar-hide snap-x snap-mandatory cursor-grab active:cursor-grabbing"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {categories.map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="flex-none w-[160px] md:w-[200px] lg:w-[220px] snap-start"
              >
                <Link href={category.link} className="group block relative aspect-[10/13] rounded-xl overflow-hidden bg-gray-50 border border-gray-100 transition-all duration-700 hover:border-emerald-500/20">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                  {/* Subtle Gradient Veil */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-40 group-hover:opacity-60 transition-opacity duration-500"></div>

                  <div className="absolute inset-x-0 bottom-0 p-5 text-center flex flex-col items-center justify-end h-1/2">
                    <span className="text-[7px] font-black uppercase tracking-[0.4em] text-emerald-400 mb-2 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-3 group-hover:translate-y-0">Explore</span>
                    <h3 className="text-[14px] md:text-[16px] font-black text-white uppercase tracking-widest leading-none drop-shadow-md">
                      {category.name}
                    </h3>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section - Elite Curated Layout */}
      <section className="py-24 bg-white relative overflow-hidden">
        {/* Cinematic Background - Layered Emerald Mists */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent opacity-50"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[1200px] h-[800px] bg-emerald-100/10 rounded-full blur-[140px] pointer-events-none z-0"></div>
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-50/20 rounded-full blur-[100px] pointer-events-none z-0"></div>

        <div className="max-w-[1440px] mx-auto px-6 md:px-12 relative z-10">
          {/* Section Header - Editorial Style */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 gap-10">
            <div className="relative">
              <span className="absolute -top-10 left-0 text-[10px] font-black uppercase tracking-[0.6em] text-emerald-600/40">Featured Items</span>
              <div className="flex items-end gap-3">
                <h2 className="text-4xl md:text-5xl font-black font-plus-jakarta-sans tracking-tighter text-black leading-tight">
                  Featured<br />
                  Collections
                </h2>
                <div className="w-12 h-0.5 bg-emerald-500 mb-2.5 hidden md:block"></div>
              </div>
            </div>

            <div className="max-w-md md:text-right">
              <p className="text-gray-400 text-xs md:text-sm font-medium leading-relaxed mb-6 md:ml-auto">
                Explore our top choice of exceptional products, chosen for their quality and timeless design.
              </p>
              <Link href="/products" className="group inline-flex items-center text-[10px] font-black uppercase tracking-[0.3em] text-black border-b-2 border-black/10 pb-1 hover:border-emerald-500 transition-all font-bold">
                Show All Products <ArrowRight size={14} className="ml-2 group-hover:translate-x-2 transition-transform" />
              </Link>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[4/5] bg-gray-200 rounded-[2.5rem] mb-6"></div>
                  <div className="h-6 bg-gray-200 rounded w-2/3 mb-2"></div>
                  <div className="h-5 bg-gray-200 rounded w-1/3 mb-3"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <div className="text-red-500 mb-4 font-medium">{error}</div>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-black text-white rounded-full text-sm font-bold hover:bg-gray-800 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="text-center py-24 bg-white/50 backdrop-blur-sm rounded-3xl border border-gray-100">
              <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-black mb-2">No Featured Products</h3>
              <p className="text-gray-500 mb-6">Mark products as "Featured" in the admin panel.</p>
              <Link
                href="/products"
                className="inline-flex items-center text-sm font-bold text-emerald-600 hover:text-emerald-800"
              >
                Browse Store <ArrowRight className="ml-2" size={16} />
              </Link>
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12"
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1
                  }
                }
              }}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-100px" }}
            >
              {featuredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  variants={{
                    hidden: { opacity: 0, y: 30 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
                  }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <motion.section
        {...fadeInUp}
        className="py-32 bg-white relative overflow-hidden"
      >
        <div className="max-w-[1440px] mx-auto px-6 relative z-10 text-center">
          <div className="max-w-3xl mx-auto">
            <span className="text-emerald-600 font-black uppercase tracking-[0.4em] text-[10px] mb-6 block">Need Help?</span>
            <h2 className="text-4xl md:text-[4.5rem] font-extrabold font-plus-jakarta-sans tracking-tighter mb-8 text-black leading-[0.9]">Get in Touch</h2>
            <p className="text-gray-500 text-lg mb-14 font-medium leading-relaxed">Have questions about our products or need technical support? Our team is here to help you find the perfect luxury timepiece.</p>

            <div className="flex justify-center group">
              <Link
                href="/contact"
                className="relative inline-flex items-center px-16 py-7 bg-black text-white rounded-full font-black uppercase tracking-[0.3em] text-[13px] overflow-hidden transition-all duration-500 hover:scale-110 active:scale-95 shadow-2xl group/btn"
              >
                <span className="relative z-10 flex items-center">
                  Contact Us <ArrowRight className="ml-4 group-hover/btn:translate-x-3 transition-transform duration-500" size={20} />
                </span>
                <div className="absolute inset-0 bg-emerald-600 -translate-x-full group-hover/btn:translate-x-0 transition-transform duration-500 ease-in-out"></div>
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-emerald-50/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-950/10 rounded-full blur-[120px]"></div>
      </motion.section>
    </div>
  );
}