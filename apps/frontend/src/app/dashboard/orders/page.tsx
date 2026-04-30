'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Package,
    Calendar,
    DollarSign,
    ChevronRight,
    ArrowLeft,
    Clock,
    CheckCircle,
    Truck,
    XCircle,
    ShoppingBag,
    Loader2,
    FileText,
    AlertTriangle
} from 'lucide-react';
import Link from 'next/link';
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
    id: string;
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

export default function MyOrdersPage() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [cancellingId, setCancellingId] = useState<string | null>(null);
    const [confirmingId, setConfirmingId] = useState<string | null>(null);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/auth/login');
        }

        if (isAuthenticated) {
            fetchOrders();
        }
    }, [isAuthenticated, authLoading, router]);

    const fetchOrders = async () => {
        try {
            const data = await ordersService.getUserOrders();
            const sorted = Array.isArray(data) ? data.sort((a: Order, b: Order) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) : [];
            setOrders(sorted);
        } catch (error) {
            console.error('Failed to fetch orders', error);
        } finally {
            setLoadingOrders(false);
        }
    };

    const canCancel = (status: string) => ['pending', 'processing'].includes(status.toLowerCase());

    const handleCancel = async (e: React.MouseEvent, orderId: string) => {
        e.preventDefault();
        e.stopPropagation();
        if (confirmingId !== orderId) {
            setConfirmingId(orderId);
            return;
        }
        try {
            setCancellingId(orderId);
            setConfirmingId(null);
            await ordersService.cancelOrder(orderId);
            await fetchOrders();
        } catch (err: any) {
            console.error('Cancel failed', err);
        } finally {
            setCancellingId(null);
        }
    };

    const getStatusConfig = (status: string) => {
        const s = status.toLowerCase();
        switch (s) {
            case 'delivered':
            case 'completed':
                return { icon: CheckCircle, color: 'text-white', bg: 'bg-emerald-600 shadow-lg shadow-emerald-200', text: 'Delivered' };
            case 'shipped':
                return { icon: Truck, color: 'text-white', bg: 'bg-black shadow-lg shadow-gray-200', text: 'Shipped' };
            case 'processing':
                return { icon: Clock, color: 'text-white', bg: 'bg-gray-700 shadow-lg shadow-gray-200', text: 'Processing' };
            case 'pending':
                return { icon: Clock, color: 'text-amber-700', bg: 'bg-amber-50', text: 'Pending' };
            case 'cancelled':
                return { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', text: 'Cancelled' };
            default:
                return { icon: Clock, color: 'text-black', bg: 'bg-gray-100', text: s };
        }
    };

    if (authLoading || loadingOrders) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
            </div>
        );
    }

    if (!isAuthenticated) return null;

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-12"
        >
            {/* Header */}
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-gray-100 pb-10">
                <div>
                    <Link href="/dashboard" className="group inline-flex items-center text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-emerald-600 mb-6 transition-colors">
                        <ArrowLeft size={14} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Dashboard
                    </Link>
                    <h1 className="text-5xl font-black text-black tracking-tighter leading-none mb-4">My Orders</h1>
                    <p className="text-gray-400 font-medium tracking-wide">A history of all your recent orders.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="px-6 py-3 bg-gray-50 rounded-full text-[10px] font-black text-gray-500 uppercase tracking-widest border border-gray-100 shadow-inner">
                        {orders.length} Orders
                    </div>
                </div>
            </motion.div>

            {/* Orders List */}
            <motion.div variants={itemVariants} className="space-y-8">
                {orders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 bg-gray-50/50 rounded-[3rem] border-2 border-dashed border-gray-100 text-center px-4">
                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform duration-500">
                            <ShoppingBag size={48} className="text-gray-200" />
                        </div>
                        <h2 className="text-3xl font-black text-black tracking-tighter mb-4">You have no orders yet</h2>
                        <p className="text-gray-400 font-medium max-w-sm mb-10 leading-relaxed">Your order history will appear here once you make your first purchase. Browse our shop to get started.</p>
                        <Link href="/products">
                            <button className="px-12 py-5 bg-black text-white rounded-full font-black uppercase tracking-widest text-xs hover:bg-emerald-600 hover:shadow-2xl hover:shadow-emerald-200 transition-all duration-500 hover:scale-105 active:scale-95">
                                Start Shopping
                            </button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        <AnimatePresence>
                            {orders.map((order, index) => {
                                const statusConfig = getStatusConfig(order.status);
                                const StatusIcon = statusConfig.icon;

                                return (
                                    <Link
                                        key={order.id}
                                        href={`/dashboard/orders/${order.id}`}
                                        className="block group"
                                    >
                                        <motion.div
                                            variants={itemVariants}
                                            whileHover={{ y: -5, scale: 1.01 }}
                                            className="bg-white rounded-[2.5rem] p-8 sm:p-10 border border-gray-100 shadow-sm hover:shadow-3xl transition-all duration-500"
                                        >
                                            <div className="flex flex-col lg:flex-row gap-10 lg:items-center justify-between">
                                                {/* Order Info */}
                                                <div className="flex items-center gap-8">
                                                    <div className="w-20 h-20 bg-gray-50 rounded-[1.8rem] flex items-center justify-center flex-shrink-0 text-emerald-500/30 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500 shadow-inner border border-transparent group-hover:border-emerald-500">
                                                        <Package size={32} />
                                                    </div>
                                                    <div>
                                                        <span className="inline-block px-3 py-1 bg-gray-50 rounded-full text-[9px] font-black uppercase tracking-widest text-gray-400 mb-3 group-hover:bg-emerald-50 transition-colors">
                                                            {order.orderNumber || 'PREMIUM ORDER'}
                                                        </span>
                                                        <h3 className="text-2xl font-bold text-black tracking-tight group-hover:text-emerald-600 transition-colors">
                                                            {new Date(order.createdAt).toLocaleDateString('en-US', {
                                                                month: 'long',
                                                                day: 'numeric',
                                                                year: 'numeric'
                                                            })}
                                                        </h3>
                                                        <p className="text-gray-400 text-xs font-semibold mt-1">
                                                            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Status & Price */}
                                                <div className="flex flex-wrap items-center justify-between lg:justify-end gap-10 flex-1 lg:border-l lg:border-gray-50 lg:pl-10">
                                                    <div className={`flex items-center px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${statusConfig.color} ${statusConfig.bg}`}>
                                                        <StatusIcon size={14} className="mr-2" />
                                                        {statusConfig.text || order.status}
                                                    </div>

                                                    <div className="text-right">
                                                        <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Total Price</p>
                                                        <p className="text-3xl font-black text-black tracking-tighter">
                                                            ${Number(order.total).toFixed(2)}
                                                        </p>
                                                    </div>

                                                    <div className="flex items-center gap-3">
                                                        {/* Invoice download */}
                                                        <button
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                generateInvoice(order);
                                                            }}
                                                            className="w-12 h-12 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all duration-300 shadow-sm"
                                                            title="Download Invoice"
                                                        >
                                                            <FileText size={18} />
                                                        </button>

                                                        {/* Cancel order — only for pending / processing */}
                                                        {canCancel(order.status) && (
                                                            <button
                                                                onClick={(e) => handleCancel(e, order.id)}
                                                                disabled={cancellingId === order.id}
                                                                className={`h-12 px-4 rounded-xl flex items-center gap-2 font-black uppercase tracking-wider text-[9px] transition-all duration-300 shadow-sm ${cancellingId === order.id
                                                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                                    : confirmingId === order.id
                                                                        ? 'bg-red-600 text-white hover:bg-red-700 animate-pulse'
                                                                        : 'bg-red-50 text-red-500 hover:bg-red-100'
                                                                    }`}
                                                                title="Cancel Order"
                                                            >
                                                                {cancellingId === order.id ? (
                                                                    <Loader2 size={14} className="animate-spin" />
                                                                ) : confirmingId === order.id ? (
                                                                    <><AlertTriangle size={14} /> Confirm Cancel</>
                                                                ) : (
                                                                    <><XCircle size={14} /> Cancel</>
                                                                )}
                                                            </button>
                                                        )}

                                                        {/* Chevron */}
                                                        <div className="hidden sm:block">
                                                            <div className="w-12 h-12 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-300 group-hover:border-emerald-500 group-hover:text-emerald-500 transition-all duration-300 shadow-sm">
                                                                <ChevronRight size={20} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    </Link>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
}
