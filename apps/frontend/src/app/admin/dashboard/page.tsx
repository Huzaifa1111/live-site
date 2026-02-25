'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  Package,
  Users,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  TrendingDown,
  PlusCircle,
  Loader2,
  ArrowRight,
  Mail,
  Star
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { motion } from 'framer-motion';

interface DashboardData {
  userCount: number;
  productCount: number;
  orderCount: number;
  messageCount: number;
  reviewCount: number;
  totalRevenue: number;
  activities: any[];
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

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/stats');
        setData(response.data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

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

  const stats = [
    { title: 'Inventory Volume', value: data?.productCount || 0, change: '+12%', icon: Package },
    { title: 'Client Registry', value: data?.userCount || 0, change: '+5%', icon: Users },
    { title: 'Acquisition Flow', value: data?.orderCount || 0, change: '+18%', icon: ShoppingCart },
    { title: 'Gross Valuation', value: `$${Number(data?.totalRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 0 })}`, change: '+8%', icon: DollarSign }
  ];

  return (
    <motion.div
      className="space-y-10"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Executive Header */}
      <motion.div variants={itemVariants} className="relative overflow-hidden rounded-2xl bg-black px-7 py-5 text-white shadow-xl group">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-emerald-600/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/20 transition-colors duration-1000"></div>

        <div className="relative z-10 flex flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2.5">
              <span className="w-4 h-[1.5px] bg-emerald-500 flex-shrink-0" />
              <span className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.3em] whitespace-nowrap">Operational Oversight</span>
            </div>
            <div className="w-px h-6 bg-white/10 flex-shrink-0" />
            <h1 className="text-lg md:text-xl font-black tracking-tighter leading-none">Executive Terminal</h1>
            <p className="hidden md:block text-gray-500 font-medium text-[11px] max-w-sm">Real-time governance of system dynamics, logistics, and client relations.</p>
          </div>
          <div className="flex-shrink-0">
            <div className="px-4 py-2 bg-white/5 backdrop-blur-md rounded-lg text-[8px] font-black text-emerald-400 uppercase tracking-widest border border-white/10 whitespace-nowrap">
              Live Link: Operational
            </div>
          </div>
        </div>
      </motion.div>

      {/* Primary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div key={index} variants={itemVariants} whileHover={{ y: -5 }}>
            <div className="bg-white rounded-[2rem] p-7 border border-gray-100 shadow-sm relative overflow-hidden group">
              <div className="flex justify-between items-start mb-5">
                <div className="p-3.5 rounded-xl bg-black text-emerald-500 shadow-xl transition-all duration-500 group-hover:bg-emerald-600 group-hover:text-white">
                  <stat.icon size={20} />
                </div>
                <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 uppercase tracking-wider">
                  {stat.change}
                </span>
              </div>
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1.5">{stat.title}</p>
              <h3 className="text-3xl font-black text-black tracking-tighter">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Logistics Feed & Controls */}
        <div className="lg:col-span-8 space-y-10">
          <motion.div variants={itemVariants} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8 group">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black text-black tracking-tighter uppercase tracking-widest flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500" /> Operational Control
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { href: '/admin/products/create', label: 'New Asset', desc: 'Secure entry', icon: Package },
                { href: '/admin/orders', label: 'Logistic Flow', desc: 'Dispatches', icon: ShoppingCart },
                { href: '/admin/users', label: 'Identity Hub', desc: 'Client ledger', icon: Users },
              ].map((action) => (
                <Link key={action.label} href={action.href} className="group/action">
                  <div className="p-5 rounded-2xl bg-gray-50/50 border border-transparent hover:bg-white hover:border-emerald-100 hover:shadow-xl transition-all duration-500">
                    <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-emerald-500 mb-4 shadow-sm group-hover/action:scale-105 transition-transform">
                      <action.icon size={18} />
                    </div>
                    <h3 className="font-black text-black text-[11px] uppercase tracking-widest mb-1">{action.label}</h3>
                    <p className="text-[9px] text-gray-400 font-medium uppercase tracking-wide">{action.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { title: 'Inbound Comms', value: data?.messageCount || 0, icon: Mail },
              { title: 'Sentiment Analysis', value: data?.reviewCount || 0, icon: Star }
            ].map((stat, index) => (
              <motion.div key={index} variants={itemVariants} className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm flex items-center gap-5 group">
                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-emerald-500/40 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500">
                  <stat.icon size={20} />
                </div>
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{stat.title}</p>
                  <p className="text-2xl font-black text-black tracking-tighter">{stat.value}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* System Ledger Feed */}
        <motion.div variants={itemVariants} className="lg:col-span-4 flex flex-col h-full">
          <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm flex-1 flex flex-col">
            <h2 className="text-xl font-black text-black tracking-tighter mb-8 flex items-center gap-3">
              <TrendingUp className="text-emerald-500" size={20} /> Activity Ledger
            </h2>
            <div className="space-y-1.5 flex-1 overflow-y-auto custom-scrollbar pr-1 max-h-[400px]">
              {data?.activities && data.activities.length > 0 ? (
                data.activities.map((activity, index) => (
                  <div key={index} className="group/item flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-all duration-300">
                    <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center text-emerald-500 flex-shrink-0 group-hover/item:bg-emerald-600 group-hover/item:text-white transition-colors duration-300">
                      {activity.type === 'order' ? <ShoppingCart size={14} /> : <Users size={14} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between items-start mb-0.5">
                        <p className="font-black text-[10px] text-black uppercase tracking-widest truncate">{activity.title}</p>
                        <span className="text-[8px] font-bold text-gray-300 uppercase flex-shrink-0 ml-2">
                          {new Date(activity.time).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <p className="text-[9px] text-gray-400 font-medium truncate uppercase tracking-wide">{activity.subtitle}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-20 opacity-30">
                  <p className="text-gray-400 text-[9px] font-black uppercase tracking-widest italic">Ledger Null</p>
                </div>
              )}
            </div>

            <Link href="/admin/analytics" className="mt-8">
              <button className="w-full py-3.5 bg-black text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-emerald-600 transition-all duration-300 shadow-lg shadow-gray-100">
                Full Analytics Engine
              </button>
            </Link>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
