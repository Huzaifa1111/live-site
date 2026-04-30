// apps/frontend/src/app/admin/orders/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { ordersService } from '@/services/orders.service';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  Clock,
  CheckCircle,
  AlertTriangle,
  Truck,
  Search,
  Filter,
  DollarSign,
  Calendar,
  User,
  Loader2,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';

interface Order {
  id: string;
  orderNumber: string;
  userId: number;
  total: number;
  status: string;
  paymentMethod: string;
  shippingAddress: string;
  createdAt: string;
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

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await ordersService.getAllOrders();
      setOrders(data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await ordersService.updateOrderStatus(id, status);
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    } catch (error) {
      console.error('Failed to update status:', error);
      fetchOrders();
    }
  };

  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total), 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const completedOrders = orders.filter(o => o.status === 'delivered').length;

  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesSearch =
      (order.orderNumber && order.orderNumber.toString().toLowerCase().includes(searchTerm.toLowerCase())) ||
      order.id.toString().includes(searchTerm) ||
      order.userId.toString().includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

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

  if (isLoading) {
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

  return (
    <motion.div
      className="space-y-10 pb-20"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Logistics Header */}
      <motion.div variants={itemVariants} className="relative overflow-hidden rounded-[2.5rem] bg-black p-10 md:p-14 text-white shadow-2xl group">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-600/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/20 transition-colors duration-1000"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-6 h-[1.5px] bg-emerald-500" />
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em]">Order Management</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-none mb-3">Order History</h1>
          <p className="text-gray-400 font-medium tracking-wide max-w-lg text-sm md:text-base">Manage your store's orders, payments, and shipping status.</p>
        </div>
      </motion.div>

      {/* Metrics Ledger */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Total Orders', value: orders.length, icon: ShoppingBag, desc: 'All store orders' },
          { title: 'Total Sales', value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, desc: 'Total revenue' },
          { title: 'Pending Orders', value: pendingOrders, icon: Clock, desc: 'Not yet shipped' },
          { title: 'Delivered', value: completedOrders, icon: CheckCircle, desc: 'Completed orders' },
        ].map((stat, index) => (
          <motion.div key={index} variants={itemVariants} whileHover={{ y: -5 }}>
            <div className="bg-white rounded-[2rem] p-7 border border-gray-100 shadow-sm relative overflow-hidden group">
              <div className="flex justify-between items-start mb-5">
                <div className="p-3.5 rounded-xl bg-black text-emerald-500 shadow-xl transition-all duration-500 group-hover:bg-emerald-600 group-hover:text-white">
                  <stat.icon size={20} />
                </div>
              </div>
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1.5">{stat.title}</p>
              <h3 className="text-3xl font-black text-black tracking-tighter mb-1.5">{stat.value}</h3>
              <p className="text-[9px] text-gray-400 font-medium uppercase tracking-widest">{stat.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Operations Panel */}
      <motion.div variants={itemVariants} className="space-y-6">
        {/* Search & Filters */}
        <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-emerald-500/30 w-4 h-4" />
            <input
              type="text"
              placeholder="Search orders by ID or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 h-14 bg-gray-50/50 border border-gray-100 rounded-xl focus:bg-white focus:border-emerald-100 focus:outline-none transition-all font-medium text-sm tracking-wide placeholder:text-gray-300"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="h-14 px-6 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-emerald-100 focus:outline-none font-black text-[9px] uppercase tracking-widest text-black cursor-pointer w-full sm:w-[180px]"
            >
              <option value="all">Role: All Orders</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">In Transit</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Order List */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden p-2">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-50">
              <thead>
                <tr className="bg-gray-50/20">
                  <th className="px-6 py-5 text-left text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Order ID</th>
                  <th className="px-6 py-5 text-left text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Customer</th>
                  <th className="px-6 py-5 text-left text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Order Date</th>
                  <th className="px-6 py-5 text-left text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Total Price</th>
                  <th className="px-6 py-5 text-left text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Status</th>
                  <th className="px-6 py-5 text-right text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50/50">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest italic text-center">No orders found.</p>
                    </td>
                  </tr>
                ) : (
                  <AnimatePresence>
                    {filteredOrders.map((order, index) => {
                      const statusConfig = getStatusConfig(order.status);
                      const StatusIcon = statusConfig.icon;
                      return (
                        <motion.tr
                          key={order.id}
                          className="hover:bg-gray-50/30 transition-all duration-300 group"
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.02 }}
                        >
                          <td className="px-6 py-4">
                            <span className="text-[13px] font-bold text-black tracking-tight group-hover:text-emerald-600 transition-colors">#{order.orderNumber || order.id.toString().padStart(6, '0')}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-black group-hover:text-white transition-colors duration-500">
                                <User size={14} />
                              </div>
                              <span className="text-[9px] font-black text-black uppercase tracking-widest">User {order.userId}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                              {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs font-black text-black tracking-tight">${Number(order.total).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${statusConfig.border} ${statusConfig.bg} ${statusConfig.color}`}>
                              {statusConfig.text}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                              <Link
                                href={`/admin/orders/${order.id}`}
                                className="p-2 rounded-lg bg-white text-gray-400 hover:bg-black hover:text-white border border-gray-100 shadow-sm transition-all duration-300"
                                title="View Details"
                              >
                                <ExternalLink size={14} />
                              </Link>
                              <select
                                value={order.status}
                                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                className="text-[8px] font-black uppercase tracking-widest px-2 py-2 bg-gray-50 border border-gray-100 rounded-lg focus:border-emerald-100 outline-none cursor-pointer hover:bg-white transition-all w-[100px]"
                              >
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
