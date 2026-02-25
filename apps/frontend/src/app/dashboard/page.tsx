// /apps/frontend/src/app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { motion } from 'framer-motion';
import {
  ShoppingBag,
  MapPin,
  User,
  LogOut,
  ChevronRight,
  Package,
  DollarSign,
  Clock,
  Loader2,
  Shield
} from 'lucide-react';
import Link from 'next/link';
import { ordersService } from '@/services/orders.service';

interface Order {
  id: number;
  orderNumber?: string;
  total: number;
  status: string;
  createdAt: string;
  items?: any[];
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

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const [greeting, setGreeting] = useState('Welcome back');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }

    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');

    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated, authLoading, router]);

  const fetchOrders = async () => {
    try {
      const data = await ordersService.getUserOrders();
      setOrders(data);
    } catch (error) {
      console.error('Failed to fetch orders', error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const totalSpent = orders.reduce((sum, order) => sum + Number(order.total), 0);
  const activeOrders = orders.filter(o => ['pending', 'processing', 'shipped'].includes(o.status)).length;
  const recentOrder = orders.length > 0 ? orders[0] : null;

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
      {/* Cinematic Hero */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden rounded-[3rem] bg-black p-10 md:p-16 text-white shadow-3xl group"
      >
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-600/30 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/40 transition-colors duration-1000" />
        <div className="relative z-10 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 mb-6"
          >
            <span className="w-8 h-[2px] bg-emerald-500" />
            <span className="text-emerald-400 font-bold uppercase tracking-[0.3em] text-xs">Customer Space</span>
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter leading-[0.9] text-white">
            {greeting}, <br />
            <span className="text-emerald-400 italic font-serif">
              {user?.name?.split(' ')[0] || 'User'}
            </span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl font-medium tracking-wide max-w-lg leading-relaxed">
            Your personal hub for tracking orders, managing style preferences, and exploring exclusive drops.
          </p>
        </div>
      </motion.div>

      {/* Boutique Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { icon: Package, label: 'Total Orders', value: orders.length, color: 'emerald' },
          { icon: DollarSign, label: 'Lifetime Spent', value: `$${totalSpent.toLocaleString()}`, color: 'blue' },
          { icon: Clock, label: 'Active In-transit', value: activeOrders, color: 'amber' }
        ].map((stat, i) => (
          <motion.div
            key={i}
            variants={itemVariants}
            whileHover={{ y: -8, scale: 1.02 }}
            className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 group"
          >
            <div className="flex justify-between items-start mb-6">
              <div className={`p-4 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 group-hover:scale-110 transition-transform duration-500`}>
                <stat.icon size={28} />
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-emerald-500 transition-colors" />
            </div>
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">{stat.label}</p>
            <h3 className="text-4xl font-black text-black tracking-tighter">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Recent Activity Card */}
        <motion.div variants={itemVariants} className="lg:col-span-2 bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-3xl font-black text-black tracking-tighter mb-1">Latest Order</h2>
              <p className="text-gray-400 text-sm font-medium tracking-wide">Most recent acquisition</p>
            </div>
            {orders.length > 0 && (
              <Link href="/dashboard/orders" className="p-3 bg-gray-50 rounded-full hover:bg-emerald-50 text-gray-400 hover:text-emerald-600 transition-all">
                <ChevronRight size={24} />
              </Link>
            )}
          </div>

          {recentOrder ? (
            <div className="group relative bg-gray-50/50 rounded-[2rem] p-8 transition-all hover:bg-white hover:shadow-xl border border-transparent hover:border-gray-50">
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-500">
                  <Package size={40} className="text-emerald-500/30" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <span className="inline-block px-3 py-1 bg-white rounded-full text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 shadow-sm">
                    {recentOrder.orderNumber || 'PREMIUM ORDER'}
                  </span>
                  <p className="text-gray-400 text-sm font-medium mb-1">Acquired on</p>
                  <h3 className="font-bold text-gray-900 text-xl tracking-tight">
                    {new Date(recentOrder.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </h3>
                </div>
                <div className="text-center md:text-right">
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Total Value</p>
                  <span className="block text-3xl font-black text-black tracking-tighter mb-3">${Number(recentOrder.total).toFixed(2)}</span>
                  <span className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest
                        ${recentOrder.status === 'delivered' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' :
                      recentOrder.status === 'cancelled' ? 'bg-red-50 text-red-600' :
                        'bg-black text-white shadow-xl shadow-gray-200'}`}>
                    {recentOrder.status}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-100">
              <ShoppingBag className="mx-auto h-16 w-16 text-gray-200 mb-6" />
              <h3 className="text-2xl font-black text-black mb-2">Portfolio Empty</h3>
              <p className="text-gray-400 mb-8 max-w-xs mx-auto">Enhance your collection by exploring our latest drops.</p>
              <Link href="/products">
                <button className="px-10 py-4 bg-emerald-600 text-white rounded-full font-black uppercase tracking-widest text-xs hover:bg-emerald-700 shadow-xl shadow-emerald-200 transition-all">
                  Shop Drop
                </button>
              </Link>
            </div>
          )}
        </motion.div>

        {/* Dynamic Actions Card */}
        <motion.div variants={itemVariants} className="space-y-6">
          <h2 className="text-2xl font-black text-black tracking-tighter mb-4 px-2">Portfolio Tools</h2>
          <div className="grid grid-cols-1 gap-4">
            {[
              { label: 'My Profile', desc: 'Secure configuration', icon: User, href: '/dashboard/profile' },
              { label: 'Addresses', desc: 'Logistic control', icon: MapPin, href: '/dashboard/addresses' },
              { label: 'Security', desc: 'Privacy protection', icon: Shield, href: '/dashboard/settings' }
            ].map((action, i) => (
              <Link key={i} href={action.href} className="group">
                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 flex items-center gap-6">
                  <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-2xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500 shadow-inner group-hover:scale-105">
                    <action.icon size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-black group-hover:text-emerald-600 transition-colors uppercase tracking-tight text-sm mb-1">{action.label}</h3>
                    <p className="text-xs text-gray-400 font-medium">{action.desc}</p>
                  </div>
                  <ChevronRight size={16} className="ml-auto text-gray-300 group-hover:text-emerald-500 transition-all opacity-0 group-hover:opacity-100 group-hover:translate-x-2" />
                </div>
              </Link>
            ))}

            <button onClick={() => logout()} className="group w-full">
              <div className="bg-red-50/50 p-6 rounded-[2rem] border border-red-50 shadow-sm hover:bg-red-50 transition-all duration-500 flex items-center gap-6 group-hover:shadow-red-100/50 shadow-xl shadow-transparent">
                <div className="w-16 h-16 bg-white text-red-500 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-500">
                  <LogOut size={24} />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-red-700 uppercase tracking-tight text-sm mb-1">Exit Session</h3>
                  <p className="text-xs text-red-400 font-medium">Safe disconnection</p>
                </div>
              </div>
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
