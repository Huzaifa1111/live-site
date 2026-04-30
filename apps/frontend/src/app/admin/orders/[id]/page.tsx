// apps/frontend/src/app/admin/orders/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ordersService } from '@/services/orders.service';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Package,
    Truck,
    CreditCard,
    User,
    Calendar,
    MapPin,
    CheckCircle,
    Clock,
    AlertTriangle,
    Loader2,
    ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { resolveProductImage } from '@/lib/image';

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

export default function OrderDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const data = await ordersService.getOrderById(params.id as string);
                setOrder(data);
            } catch (error) {
                console.error('Failed to fetch order:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [params.id]);

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'delivered': return { color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'Delivered', icon: CheckCircle };
            case 'shipped': return { color: 'text-black', bg: 'bg-gray-50', border: 'border-gray-200', text: 'In Transit', icon: Truck };
            case 'processing': return { color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-100', text: 'Processing', icon: Clock };
            case 'pending': return { color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-100', text: 'Pending', icon: AlertTriangle };
            case 'cancelled': return { color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-100', text: 'Cancelled', icon: AlertTriangle };
            default: return { color: 'text-gray-400', bg: 'bg-gray-50', border: 'border-gray-100', text: status, icon: Clock };
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    className="h-10 w-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full"
                />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="text-center py-20 bg-white rounded-[2rem] border border-gray-100 shadow-sm">
                <Package size={40} className="mx-auto text-gray-200 mb-4" />
                <h2 className="text-xl font-black text-black tracking-tight">Order not found</h2>
                <Link href="/admin/orders" className="text-emerald-600 font-bold mt-4 inline-block hover:underline text-sm">
                    Back to Orders
                </Link>
            </div>
        );
    }

    const statusConfig = getStatusConfig(order.status);
    const StatusIcon = statusConfig.icon;

    return (
        <motion.div
            className="space-y-8 pb-12"
            variants={containerVariants}
            initial="hidden"
            animate="show"
        >
            {/* Order Header */}
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-black rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-emerald-600/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/20 transition-colors duration-1000"></div>

                <div className="relative z-10 flex items-center gap-6">
                    <Link href="/admin/orders" className="p-3 bg-white/10 rounded-xl border border-white/10 text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all backdrop-blur-md active:scale-95">
                        <ArrowLeft size={18} />
                    </Link>
                    <div>
                        <div className="flex items-center gap-4 mb-2">
                            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter leading-none">#{order.orderNumber || order.id.toString().padStart(6, '0')}</h1>
                            <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${statusConfig.border} ${statusConfig.bg} ${statusConfig.color}`}>
                                {statusConfig.text}
                            </span>
                        </div>
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2">
                            <Calendar size={12} className="text-emerald-500/40" /> Placed on {new Date(order.createdAt).toLocaleString()}
                        </p>
                    </div>
                </div>

                <div className="relative z-10">
                    <button
                        className="px-8 py-4 rounded-xl bg-white text-black font-black uppercase tracking-widest text-[9px] shadow-2xl transition-all duration-500 hover:bg-emerald-600 hover:text-white active:scale-95 flex items-center gap-3"
                        onClick={() => window.print()}
                    >
                        Print Invoice
                    </button>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Order Items */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Ordered Items */}
                    <motion.div variants={itemVariants} className="bg-white rounded-[2rem] p-7 border border-gray-100 shadow-sm relative overflow-hidden">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-sm font-black text-black uppercase tracking-[0.2em] flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-black text-emerald-500">
                                    <Package size={16} />
                                </div>
                                Order Items
                            </h2>
                        </div>

                        <div className="space-y-4">
                            {order.items?.map((item: any) => (
                                <div key={item.id} className="flex gap-5 p-4 rounded-2xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100 group">
                                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0 relative grayscale group-hover:grayscale-0 transition-all duration-500">
                                        <img
                                            src={resolveProductImage(item.product?.images)}
                                            alt={item.product?.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-2">
                                            <Link href={`/admin/products/edit/${item.productId}`} className="font-black text-black hover:text-emerald-600 transition-colors text-[13px] uppercase tracking-tight line-clamp-1 flex items-center gap-2">
                                                {item.product?.name} <ExternalLink size={12} className="opacity-30" />
                                            </Link>
                                            <span className="font-black text-sm text-black tracking-tight">${item.price}</span>
                                        </div>

                                        <div className="flex flex-wrap gap-2 mb-2">
                                            <div className="px-2 py-1 bg-gray-50 border border-gray-100 rounded-md text-[8px] font-black uppercase tracking-widest text-gray-500">
                                                Qty: {item.quantity}
                                            </div>
                                            {item.color && (
                                                <div className="px-2 py-1 bg-gray-50 border border-gray-100 rounded-md text-[8px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-1.5">
                                                    <div className="w-1.5 h-1.5 rounded-full border border-gray-200" style={{ backgroundColor: item.color }}></div>
                                                    Color: {item.color}
                                                </div>
                                            )}
                                            {item.size && (
                                                <div className="px-2 py-1 bg-gray-50 border border-gray-100 rounded-md text-[8px] font-black uppercase tracking-widest text-gray-500">
                                                    Size: {item.size}
                                                </div>
                                            )}
                                            {item.product?.brand && (
                                                <div className="px-2 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-md text-[8px] font-black uppercase tracking-widest">
                                                    {item.product.brand.name}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 pt-8 border-t border-gray-100 flex flex-col items-end gap-1 text-right">
                            <div className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Order Total</div>
                            <div className="text-3xl font-black text-black tracking-tighter">${order.total}</div>
                        </div>
                    </motion.div>
                </div>

                {/* Right Column - Customer & Shipping */}
                <div className="space-y-8">
                    {/* Customer Info */}
                    <motion.div variants={itemVariants} className="bg-white rounded-[2rem] p-7 border border-gray-100 shadow-sm">
                        <h2 className="text-[10px] font-black text-black uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-black text-emerald-500">
                                <User size={16} />
                            </div>
                            Customer Details
                        </h2>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 font-black text-xs">
                                {order.userId}
                            </div>
                            <div>
                                <div className="text-[11px] font-black text-black uppercase tracking-widest">Customer ID #{order.userId}</div>
                                <div className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">User ID: {order.userId.toString().padStart(8, '0')}</div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Shipping Info */}
                    <motion.div variants={itemVariants} className="bg-white rounded-[2rem] p-7 border border-gray-100 shadow-sm">
                        <h2 className="text-[10px] font-black text-black uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-black text-emerald-500">
                                <Truck size={16} />
                            </div>
                            Shipping Address
                        </h2>
                        <div className="flex gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <MapPin className="text-emerald-500/40 flex-shrink-0" size={16} />
                            <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 leading-relaxed">
                                {order.shippingAddress || 'No shipping address provided.'}
                            </div>
                        </div>
                    </motion.div>

                    {/* Payment Info */}
                    <motion.div variants={itemVariants} className="bg-white rounded-[2rem] p-7 border border-gray-100 shadow-sm">
                        <h2 className="text-[10px] font-black text-black uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-black text-emerald-500">
                                <CreditCard size={16} />
                            </div>
                            Payment Information
                        </h2>
                        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-lg border border-gray-100 shadow-sm">
                                    <span className="text-[8px] font-black text-black uppercase tracking-widest">{order.paymentMethod}</span>
                                </div>
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{order.paymentMethod}</span>
                            </div>
                            <div className="text-emerald-500 font-black flex items-center gap-1.5 text-[8px] uppercase tracking-widest">
                                <CheckCircle size={12} /> Paid
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}
