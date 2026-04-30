'use client';

import { useState } from 'react';
import { ordersService } from '@/services/orders.service';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Package, MapPin, CreditCard, Clock, CheckCircle2, Truck, Box, ArrowRight, HelpCircle, AlertCircle, XCircle } from 'lucide-react';
import Image from 'next/image';
import { resolveProductImage } from '@/lib/image';

const ORDER_STATUS_STEPS = [
    { key: 'pending', label: 'Ordered', icon: Clock, color: 'text-orange-500', bg: 'bg-orange-50' },
    { key: 'processing', label: 'Processing', icon: Package, color: 'text-blue-500', bg: 'bg-blue-50' },
    { key: 'shipped', label: 'On the Way', icon: Truck, color: 'text-purple-500', bg: 'bg-purple-50' },
    { key: 'delivered', label: 'Delivered', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' }
];

export default function TrackOrderPage() {
    const [orderNumber, setOrderNumber] = useState('');
    const [order, setOrder] = useState<any>(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleTrack = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!orderNumber.trim()) return;

        setIsLoading(true);
        setError('');
        setOrder(null);

        try {
            const data = await ordersService.trackOrder(orderNumber.trim());
            setOrder(data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'We couldn\'t find an order with that identifier. Please verify and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusIndex = (status: string) => {
        return ORDER_STATUS_STEPS.findIndex(step => step.key === status.toLowerCase());
    };

    const isCancelled = order?.status.toLowerCase() === 'cancelled';
    const currentStatusIndex = order ? getStatusIndex(order.status) : -1;

    return (
        <div className="min-h-screen bg-gray-50 font-jost text-gray-900 selection:bg-emerald-100 relative overflow-hidden">
            {/* Cinematic Background */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-50/40 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 -z-10" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-50/40 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 -z-10" />

            <div className="relative z-10 max-w-5xl mx-auto px-6 py-16 md:py-24">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <div className="flex items-center justify-center gap-2 mb-4 text-emerald-600">
                        <Truck size={16} />
                        <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Order Tracking</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 text-gray-900">
                        Track Your <span className="text-emerald-600">Order</span>
                    </h1>
                    <p className="text-gray-500 text-sm md:text-base max-w-xl mx-auto font-medium leading-relaxed">
                        Stay updated on your order's status from our warehouse to your doorstep.
                    </p>
                </motion.div>

                {/* Search Interface */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="max-w-2xl mx-auto mb-16"
                >
                    <div className="bg-white p-2 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-gray-100 box-content">
                        <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-2">
                            <div className="relative flex-1 group">
                                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors">
                                    <Search size={18} />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Order Identifier (e.g. ORD-12345)"
                                    value={orderNumber}
                                    onChange={(e) => setOrderNumber(e.target.value)}
                                    className="w-full bg-gray-50/50 border-none px-14 py-4 rounded-2xl outline-none text-sm font-semibold placeholder-gray-400 focus:bg-white transition-all"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="bg-black text-white px-10 py-4 rounded-2xl font-bold text-[11px] uppercase tracking-widest hover:bg-emerald-900 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center min-w-[160px] shadow-lg shadow-black/5"
                            >
                                {isLoading ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    'Track Order'
                                )}
                            </button>
                        </form>
                    </div>

                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-6 overflow-hidden"
                            >
                                <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl flex items-center gap-3 text-xs font-bold">
                                    <AlertCircle size={16} />
                                    {error}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Tracking Content */}
                <AnimatePresence mode="wait">
                    {order && (
                        <motion.div
                            key={order.orderNumber}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -30 }}
                            className="space-y-8"
                        >
                            {/* Cancellation Banner */}
                            {isCancelled && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-red-500 text-white p-8 rounded-[2.5rem] shadow-xl shadow-red-500/10 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden"
                                >
                                    <div className="absolute right-0 top-0 p-8 opacity-10">
                                        <XCircle size={140} />
                                    </div>
                                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                                        <AlertCircle size={32} />
                                    </div>
                                    <div className="text-center md:text-left relative z-10">
                                        <h3 className="text-2xl font-black tracking-tight mb-1 uppercase">Order Cancelled</h3>
                                        <p className="text-red-50 text-xs font-bold uppercase tracking-widest opacity-80">This order has been cancelled by the store</p>
                                    </div>
                                    <div className="md:ml-auto">
                                        <Link href="/contact" className="px-6 py-3 bg-white text-red-600 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-red-50 transition-colors">
                                            Ask Why
                                        </Link>
                                    </div>
                                </motion.div>
                            )}

                            {/* Status Timeline Card */}
                            <div className={`bg-white p-8 md:p-12 rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.03)] border border-gray-100 ${isCancelled ? 'opacity-50 grayscale' : ''}`}>
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                                    <div>
                                        <p className="text-emerald-600 text-[10px] font-bold uppercase tracking-[0.3em] mb-2">Order Number</p>
                                        <h2 className="text-3xl font-black text-gray-900 tracking-tighter">{order.orderNumber}</h2>
                                    </div>
                                    <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                                        <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-gray-400">
                                            <Clock size={18} />
                                        </div>
                                        <div>
                                            <p className="text-gray-400 text-[9px] font-bold uppercase tracking-widest mb-0.5">Placed On</p>
                                            <p className="text-xs font-bold text-gray-900">{new Date(order.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Modern Timeline */}
                                <div className="relative py-8">
                                    {/* Line */}
                                    <div className="absolute top-[52px] left-8 right-8 h-[2px] bg-gray-100 hidden md:block">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: isCancelled ? 0 : `${(Math.max(0, currentStatusIndex) / (ORDER_STATUS_STEPS.length - 1)) * 100}%` }}
                                            transition={{ duration: 1.5, ease: "easeInOut" }}
                                            className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                                        />
                                    </div>

                                    <div className="flex flex-col md:flex-row justify-between gap-10 md:gap-0 relative">
                                        {ORDER_STATUS_STEPS.map((step, index) => {
                                            const isCompleted = !isCancelled && index <= currentStatusIndex;
                                            const isActive = !isCancelled && index === currentStatusIndex;
                                            const StepIcon = step.icon;

                                            return (
                                                <div key={step.key} className="flex md:flex-col items-center gap-5 md:gap-6 flex-1 group">
                                                    <motion.div
                                                        initial={{ scale: 0.8, opacity: 0 }}
                                                        animate={{ scale: isCompleted ? 1.1 : 1, opacity: 1 }}
                                                        transition={{ delay: 0.2 + (index * 0.1) }}
                                                        className={`
                                                            w-14 h-14 rounded-2xl flex items-center justify-center z-10 transition-all duration-500
                                                            ${isCompleted ? `${step.bg} ${step.color} shadow-lg shadow-gray-100 border border-gray-50` : 'bg-gray-50 text-gray-300 border border-transparent'}
                                                            ${isActive ? 'ring-4 ring-emerald-500/10' : ''}
                                                        `}
                                                    >
                                                        <StepIcon size={22} strokeWidth={isCompleted ? 2.5 : 2} />
                                                    </motion.div>

                                                    <div className="text-left md:text-center">
                                                        <p className={`text-[11px] font-bold uppercase tracking-[0.15em] mb-1 ${isCompleted ? 'text-gray-900' : 'text-gray-300'}`}>
                                                            {step.label}
                                                        </p>
                                                        {isActive ? (
                                                            <span className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase tracking-widest rounded-md border border-emerald-100 animate-pulse">
                                                                Live Update
                                                            </span>
                                                        ) : isCompleted ? (
                                                            <span className="text-[9px] text-gray-400 font-medium">Completed</span>
                                                        ) : (
                                                            <span className="text-[9px] text-gray-200 font-medium italic">
                                                                {isCancelled ? 'Discontinued' : 'Pending'}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                {/* Items Panel */}
                                <div className="lg:col-span-7 bg-white p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-gray-100">
                                    <h3 className="text-lg font-bold mb-8 flex items-center gap-3">
                                        <div className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center">
                                            <Box size={16} />
                                        </div>
                                        Items in Order
                                    </h3>

                                    <div className="space-y-4 max-h-[480px] overflow-y-auto pr-2 custom-scrollbar">
                                        {order.items.map((item: any) => (
                                            <div key={item.id} className="group bg-gray-50/50 p-4 rounded-3xl border border-transparent hover:border-emerald-100 hover:bg-white transition-all duration-300 flex gap-5">
                                                <div className="w-24 h-24 bg-white rounded-2xl overflow-hidden flex-shrink-0 border border-gray-100 shadow-sm transition-transform group-hover:scale-105 relative">
                                                    <Image
                                                        src={resolveProductImage(item.product?.images || item.product?.image || null) || 'https://via.placeholder.com/300'}
                                                        alt={item.product?.name || 'Product'}
                                                        fill
                                                        sizes="96px"
                                                        className="object-cover"
                                                    />
                                                </div>
                                                <div className="flex-1 py-1">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <h4 className="font-bold text-gray-900 line-clamp-1 text-sm">{item.product?.name}</h4>
                                                        <span className="text-[10px] font-bold bg-white px-2 py-1 rounded-lg border border-gray-100 text-gray-500">×{item.quantity}</span>
                                                    </div>
                                                    <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest mb-3">{item.product?.brand?.name || 'Exclusive Line'}</p>
                                                    <p className="text-sm font-black text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-8 pt-6 border-t border-gray-50 flex justify-between items-end px-2">
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Order Total</p>
                                            <p className="text-[10px] text-gray-400 font-medium italic">Total amount (tax included)</p>
                                        </div>
                                        <span className="text-3xl font-black text-gray-900 leading-none">${order.total}</span>
                                    </div>
                                </div>

                                {/* Info Sidebar */}
                                <div className="lg:col-span-5 space-y-8">
                                    <div className="bg-white p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-gray-100">
                                        <h3 className="text-base font-bold mb-6 flex items-center gap-3">
                                            <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                                                <MapPin size={16} />
                                            </div>
                                            Shipping Address
                                        </h3>
                                        <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-100">
                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2">Shipping Address</p>
                                            <p className="font-semibold text-sm leading-relaxed text-gray-700">{order.shippingAddress}</p>
                                        </div>
                                    </div>

                                    <div className="bg-white p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-gray-100">
                                        <h3 className="text-base font-bold mb-6 flex items-center gap-3">
                                            <div className="w-8 h-8 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center">
                                                <CreditCard size={16} />
                                            </div>
                                            Payment Info
                                        </h3>
                                        <div className="flex items-center gap-4 bg-gray-50/50 p-5 rounded-2xl border border-gray-100">
                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-400 shadow-sm">
                                                {order.paymentMethod === 'cod' ? <ArrowRight size={18} /> : <CheckCircle2 size={18} />}
                                            </div>
                                            <div>
                                                <p className="text-gray-400 text-[9px] font-bold uppercase tracking-widest mb-0.5 text-ellipsis">Method</p>
                                                <p className="font-bold uppercase text-xs text-gray-900 tracking-wider">
                                                    {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Stripe Secure'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Box */}
                                    <div className="bg-black p-8 rounded-[2.5rem] text-white shadow-xl shadow-black/5 relative overflow-hidden group">
                                        <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                                            <HelpCircle size={120} />
                                        </div>
                                        <h4 className="text-lg font-bold mb-2 relative z-10">Need Help?</h4>
                                        <p className="text-gray-400 text-[11px] mb-6 leading-relaxed relative z-10">Our support team is available for any questions regarding your delivery.</p>
                                        <Link href="/contact" className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-[9px] hover:bg-emerald-500 hover:text-white transition-all relative z-10">
                                            <span>Contact Support</span>
                                            <ArrowRight size={12} />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Footer Insight */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-20 text-center"
                >
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em]">
                        Precision Engineering • Trusted Logistics
                    </p>
                </motion.div>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 3px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #10b981; }
            `}</style>
        </div>
    );
}
