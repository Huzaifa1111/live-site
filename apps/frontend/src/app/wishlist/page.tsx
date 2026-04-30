'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Heart, ShoppingBag, Trash2, ArrowRight, Star } from 'lucide-react';
import { useWishlist } from '@/lib/WishlistContext';
import ProductCard from '@/components/products/ProductCard';

export default function WishlistPage() {
    const { items, removeFromWishlist } = useWishlist();

    return (
        <div className="min-h-screen bg-gray-50 font-jost text-gray-900 selection:bg-emerald-100 relative overflow-hidden">
            {/* Cinematic Background Elements */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-50/40 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 -z-0" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-50/40 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 -z-0" />

            {/* Header / Hero Section */}
            <div className="relative z-10 max-w-[1440px] mx-auto px-6 pt-32 pb-16 md:pt-40 md:pb-24">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12"
                >
                    <div className="max-w-2xl">
                        <div className="flex items-center gap-2 mb-4 text-emerald-600">
                            <Star size={14} className="fill-current" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.4em]">My Favorites</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 text-gray-900 leading-[0.9]">
                            Your <span className="text-emerald-600">Wishlist</span>
                        </h1>
                        <p className="text-gray-500 text-lg font-medium max-w-md leading-relaxed">
                             A selection of items you've saved for later. Your favorite pieces are right here.
                        </p>
                    </div>

                    <div className="flex items-center gap-6 pb-2">
                        <div className="text-right hidden sm:block">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Items</p>
                            <p className="text-2xl font-black text-gray-900 tracking-tighter">{items.length} <span className="text-xs text-gray-400 uppercase tracking-widest ml-1">Items</span></p>
                        </div>
                        <Link href="/products" className="group flex items-center gap-2 bg-black text-white px-8 py-4 rounded-2xl font-bold uppercase tracking-widest text-[11px] hover:bg-emerald-900 transition-all hover:scale-[1.02] shadow-xl shadow-black/10">
                            <span>Browse New</span>
                            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </motion.div>

                {/* Main Content */}
                <AnimatePresence mode="wait">
                    {items.length === 0 ? (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-[3rem] p-12 md:p-24 text-center border border-gray-100 shadow-[0_30px_100px_rgba(0,0,0,0.02)] relative overflow-hidden"
                        >
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.02] pointer-events-none">
                                <Heart size={400} />
                            </div>

                            <div className="relative z-10 max-w-md mx-auto">
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8 text-gray-200">
                                    <Heart size={40} />
                                </div>
                                <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Your Wishlist is Empty</h2>
                                <p className="text-gray-500 font-medium mb-12 leading-relaxed">
                                    You haven't saved any items yet. Explore our latest products to find something you love.
                                </p>
                                <Link href="/products" className="inline-flex items-center gap-3 bg-emerald-600 text-white px-10 py-5 rounded-2xl font-bold uppercase tracking-widest text-[11px] hover:bg-black transition-all hover:shadow-2xl hover:shadow-emerald-500/20 active:scale-95">
                                    <ShoppingBag size={16} />
                                    <span>Back to Store</span>
                                </Link>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="list"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-12"
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                                <AnimatePresence mode="popLayout">
                                    {items.map((product) => (
                                        <motion.div
                                            key={product.id}
                                            layout
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
                                            transition={{ type: "spring", stiffness: 200, damping: 25 }}
                                            className="relative group"
                                        >
                                            <ProductCard product={product as any} />

                                            {/* Luxury Remove Action Overlay */}
                                            <div className="absolute top-4 right-4 z-30 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                                <button
                                                    onClick={() => removeFromWishlist(product.id)}
                                                    className="w-10 h-10 bg-white shadow-xl rounded-full flex items-center justify-center text-red-500 hover:bg-black hover:text-white transition-all transform hover:scale-110 active:scale-90"
                                                    title="Remove from curated list"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>

                            {/* Refined Footer Action */}
                            <div className="flex flex-col items-center pt-12">
                                <div className="h-20 w-[1px] bg-gradient-to-b from-emerald-500/50 to-transparent mb-8" />
                                <Link href="/products" className="text-[11px] font-black uppercase tracking-[0.5em] text-gray-400 hover:text-emerald-600 transition-colors">
                                    Keep Shopping
                                </Link>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
