'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Calendar,
    Package,
    Truck,
    CheckCircle,
    Clock,
    XCircle,
    DollarSign,
    MapPin,
    CreditCard,
    ShoppingBag,
    Loader2,
    FileText,
    Download,
    Shield,
    AlertTriangle
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { ordersService } from '@/services/orders.service';
import { generateInvoice } from '@/utils/InvoiceGenerator';

interface OrderItem {
    id: number;
    quantity: number;
    price: number;
    product: {
        id: number;
        name: string;
        images: string[];
        price: number;
    };
}

interface Order {
    id: number;
    orderNumber: string;
    subtotal: number;
    shippingFee: number;
    tax: number;
    total: number;
    status: string;
    createdAt: string;
    items: OrderItem[];
    paymentMethod?: string;
    shippingAddress?: string;
}

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
    const { id } = useParams();
    const router = useRouter();
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(false);
    const [confirming, setConfirming] = useState(false);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/auth/login');
        }

        if (isAuthenticated && id) {
            fetchOrder();
        }
    }, [isAuthenticated, authLoading, id, router]);

    const fetchOrder = async () => {
        try {
            const data = await ordersService.getOrderById(Number(id));
            setOrder(data);
        } catch (error) {
            console.error('Failed to fetch order details', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusConfig = (status: string) => {
        const s = status?.toLowerCase() || '';
        switch (s) {
            case 'delivered':
            case 'completed':
                return { icon: CheckCircle, color: 'text-white', bg: 'bg-emerald-600 shadow-lg shadow-emerald-200', text: 'Delivered' };
            case 'shipped':
                return { icon: Truck, color: 'text-white', bg: 'bg-black shadow-lg shadow-gray-200', text: 'Shipped' };
            case 'cancelled':
                return { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', text: 'Cancelled' };
            case 'processing':
                return { icon: Clock, color: 'text-white', bg: 'bg-gray-700 shadow-lg shadow-gray-200', text: 'Processing' };
            case 'pending':
                return { icon: Clock, color: 'text-amber-700', bg: 'bg-amber-50', text: 'Pending' };
            default:
                return { icon: Package, color: 'text-gray-500', bg: 'bg-gray-50', text: status };
        }
    };

    const canCancel = (status: string) => ['pending', 'processing'].includes(status?.toLowerCase());

    const handleCancel = async () => {
        if (!order) return;
        if (!confirming) { setConfirming(true); return; }
        try {
            setCancelling(true);
            setConfirming(false);
            await ordersService.cancelOrder(order.id);
            await fetchOrder();
        } catch (err) {
            console.error('Cancel failed', err);
        } finally {
            setCancelling(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="flex flex-col items-center justify-center py-24 bg-gray-50/50 rounded-[3rem] border-2 border-dashed border-gray-100 text-center px-4">
                <ShoppingBag className="mx-auto h-20 w-20 text-gray-200 mb-8" />
                <h2 className="text-3xl font-black text-black tracking-tighter mb-4">Acquisition Not Found</h2>
                <p className="text-gray-400 font-medium max-w-sm mb-10 leading-relaxed">The requested order details could not be retrieved. Please verify the ID or return to your portfolio.</p>
                <Link href="/dashboard/orders">
                    <button className="px-12 py-5 bg-black text-white rounded-full font-black uppercase tracking-widest text-xs hover:bg-emerald-600 hover:shadow-2xl hover:shadow-emerald-200 transition-all duration-500">
                        Back to Portfolio
                    </button>
                </Link>
            </div>
        );
    }

    const statusConfig = getStatusConfig(order.status);
    const StatusIcon = statusConfig.icon;

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-12 pb-20"
        >
            {/* Header */}
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-gray-100 pb-10">
                <div>
                    <Link href="/dashboard/orders" className="group inline-flex items-center text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-emerald-600 mb-6 transition-colors">
                        <ArrowLeft size={14} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Portfolio
                    </Link>
                    <div className="flex flex-wrap items-center gap-6">
                        <h1 className="text-5xl font-black text-black tracking-tighter leading-none">{order.orderNumber || `#${order.id}`}</h1>
                        <span className={`inline-flex items-center px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${statusConfig.color} ${statusConfig.bg}`}>
                            <StatusIcon size={14} className="mr-2" />
                            {statusConfig.text}
                        </span>
                    </div>
                    <p className="text-gray-400 mt-6 font-medium tracking-wide flex items-center">
                        <Calendar size={16} className="mr-2 text-emerald-500" />
                        Acquired on {new Date(order.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Invoice download */}
                    <button
                        onClick={() => order && generateInvoice(order)}
                        className="group flex items-center gap-3 px-6 py-3 bg-white border border-gray-100 rounded-xl font-black text-[10px] uppercase tracking-widest text-black hover:bg-black hover:text-white active:scale-95 transition-all duration-300 shadow-sm"
                    >
                        <FileText size={16} className="text-emerald-500" />
                        Invoice
                        <Download size={12} className="opacity-30 group-hover:opacity-100 transition-opacity" />
                    </button>

                    {/* Cancel order — only pending / processing */}
                    {order && canCancel(order.status) && (
                        <button
                            onClick={handleCancel}
                            disabled={cancelling}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all duration-300 shadow-sm ${cancelling
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : confirming
                                        ? 'bg-red-600 text-white hover:bg-red-700 animate-pulse'
                                        : 'bg-red-50 text-red-500 hover:bg-red-100 border border-red-100'
                                }`}
                        >
                            {cancelling ? (
                                <Loader2 size={14} className="animate-spin" />
                            ) : confirming ? (
                                <><AlertTriangle size={14} /> Confirm Cancel</>
                            ) : (
                                <><XCircle size={14} /> Cancel Order</>
                            )}
                        </button>
                    )}
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Left Column: Order Items */}
                <div className="lg:col-span-2 space-y-8">
                    <motion.div variants={itemVariants} className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-10 py-8 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
                            <h2 className="text-2xl font-black text-black tracking-tighter flex items-center">
                                <ShoppingBag size={24} className="mr-4 text-emerald-500/40" />
                                Selected Items
                            </h2>
                            <span className="px-4 py-1.5 bg-white rounded-full text-[9px] font-black text-gray-400 uppercase tracking-widest border border-gray-100 shadow-inner">
                                {order.items.length} Items
                            </span>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {order.items.map((item) => (
                                <div key={item.id} className="p-10 flex flex-col sm:flex-row gap-10 group hover:bg-gray-50/30 transition-all duration-500">
                                    <div className="relative w-full sm:w-40 h-40 rounded-[2.5rem] overflow-hidden bg-white flex-shrink-0 shadow-inner border border-gray-50 group-hover:shadow-2xl transition-all duration-700">
                                        <Image
                                            src={item.product?.images?.[0] || '/placeholder-product.png'}
                                            alt={item.product?.name || 'Product'}
                                            fill
                                            className="object-cover group-hover:scale-110 transition-transform duration-1000"
                                        />
                                    </div>
                                    <div className="flex-1 flex flex-col justify-between py-2">
                                        <div>
                                            <span className="inline-block px-3 py-1 bg-gray-50 rounded-full text-[8px] font-black uppercase tracking-widest text-emerald-600 mb-4 tracking-[0.2em] border border-emerald-100">
                                                Collection Item
                                            </span>
                                            <h3 className="text-2xl font-bold text-black tracking-tight group-hover:text-emerald-600 transition-colors duration-500">
                                                {item.product?.name}
                                            </h3>
                                            <p className="text-gray-400 font-bold text-xs mt-2 uppercase tracking-widest">Quantity: <span className="text-black">{item.quantity}</span></p>
                                        </div>
                                        <div className="flex items-end justify-between border-t border-gray-50 mt-6 pt-6">
                                            <div>
                                                <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mb-1">Unit Value</p>
                                                <p className="text-2xl font-black text-black tracking-tighter">${Number(item.price).toFixed(2)}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mb-1">Total Value</p>
                                                <p className="text-2xl font-black text-emerald-600 tracking-tighter">${(item.price * item.quantity).toFixed(2)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Right Column: Order Summary & Info */}
                <div className="space-y-8">
                    {/* Summary Card */}
                    <motion.div
                        variants={itemVariants}
                        className="bg-black text-white rounded-[3rem] p-10 shadow-3xl relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-600/20 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/30 transition-colors duration-700" />
                        <h2 className="text-3xl font-black tracking-tighter mb-8">Financial Summary</h2>
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400 font-black uppercase tracking-[0.2em] text-[10px]">Subtotal Acquired</span>
                                <span className="font-bold text-lg tracking-tight">${Number(order.total).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400 font-black uppercase tracking-[0.2em] text-[10px]">Logistics Privilege</span>
                                <span className="text-emerald-400 font-black uppercase tracking-widest text-xs">Complimentary</span>
                            </div>
                            <div className="pt-8 border-t border-white/5 flex flex-col items-end gap-2">
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Total Investment</span>
                                <span className="text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-emerald-400">${Number(order.total).toFixed(2)}</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Shipping & Payment Info */}
                    <motion.div variants={itemVariants} className="bg-white rounded-[3rem] border border-gray-100 p-10 shadow-sm space-y-10 group">
                        <section>
                            <h3 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] mb-6 flex items-center">
                                <CreditCard size={18} className="mr-3 text-emerald-500/40" />
                                Payment Mode
                            </h3>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-black shadow-inner">
                                    <Shield size={20} />
                                </div>
                                <p className="text-black font-black uppercase tracking-widest text-xs">{order.paymentMethod || 'SECURED CREDIT CARD'}</p>
                            </div>
                        </section>

                        <section className="pt-10 border-t border-gray-50">
                            <h3 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] mb-6 flex items-center">
                                <MapPin size={18} className="mr-3 text-emerald-500/40" />
                                Logistic Destination
                            </h3>
                            <div className="bg-gray-50/50 p-6 rounded-[2rem] border border-gray-50 group-hover:bg-white group-hover:shadow-xl transition-all duration-700">
                                <p className="text-gray-900 font-bold leading-relaxed text-sm tracking-wide">
                                    {order.shippingAddress || 'Acquisition pending destination assignment.'}
                                </p>
                            </div>
                        </section>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}
