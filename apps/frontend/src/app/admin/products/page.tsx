// apps/frontend/src/app/admin/products/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Plus, Search, Package, Star, AlertTriangle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import productService, { Product } from '@/services/product.service';
import ProductTable from '@/components/admin/ProductTable';
import { motion } from 'framer-motion';

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

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getAllProducts();
      setProducts(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      setDeletingId(id);
      await productService.deleteProduct(id);
      setProducts(products.filter(product => product.id !== id));
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredProducts = search
    ? products.filter(product =>
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.description.toLowerCase().includes(search.toLowerCase()) ||
      ((typeof product.category === 'object' ? product.category.name : product.category)?.toLowerCase().includes(search.toLowerCase()))
    )
    : products;

  const featuredProductsCount = products.filter(p => p.featured).length;
  const lowStockCount = products.filter(p => p.stock <= 10 && p.stock > 0).length;

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

  return (
    <motion.div
      className="space-y-10"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Inventory Header */}
      <motion.div variants={itemVariants} className="relative overflow-hidden rounded-[2.5rem] bg-black p-10 md:p-14 text-white shadow-2xl group">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-600/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/20 transition-colors duration-1000"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="w-6 h-[1.5px] bg-emerald-500" />
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em]">Lifecycle Management</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-none mb-3">Portfolio Registry</h1>
            <p className="text-gray-400 font-medium tracking-wide max-w-lg text-sm md:text-base">Governing the curated catalog, valuations, and availability parameters.</p>
          </div>
          <div className="relative z-10">
            <Link href="/admin/products/create">
              <button className="flex items-center space-x-3 px-8 py-4 rounded-xl bg-white text-black hover:bg-emerald-600 hover:text-white font-black uppercase tracking-widest text-[9px] shadow-2xl transition-all duration-500 active:scale-95">
                <Plus className="w-4 h-4" />
                <span>New Asset Entry</span>
              </button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Metrics Ledger */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { title: 'Inventory Volume', value: products.length, icon: Package, desc: 'Total items in ledger' },
          { title: 'Spotlight Selection', value: featuredProductsCount, icon: Star, desc: 'Featured boutique items' },
          { title: 'Logistics Alert', value: lowStockCount, icon: AlertTriangle, desc: 'Below safety threshold', highlight: lowStockCount > 0 },
        ].map((stat, index) => (
          <motion.div key={index} variants={itemVariants} whileHover={{ y: -5 }}>
            <div className="bg-white rounded-[2rem] p-7 border border-gray-100 shadow-sm relative overflow-hidden group">
              <div className="flex justify-between items-start mb-5">
                <div className={`p-3.5 rounded-xl ${stat.highlight ? 'bg-red-50 text-red-600' : 'bg-black text-emerald-500'} shadow-xl transition-all duration-500`}>
                  <stat.icon size={20} />
                </div>
              </div>
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1.5">{stat.title}</p>
              <h3 className={`text-3xl font-black ${stat.highlight ? 'text-red-600' : 'text-black'} tracking-tighter mb-1.5`}>{stat.value}</h3>
              <p className="text-[9px] text-gray-400 font-medium uppercase tracking-widest">{stat.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Operations Panel */}
      <motion.div variants={itemVariants} className="space-y-6">
        {/* Navigation & Search */}
        <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-emerald-500/30 w-4 h-4" />
            <input
              type="text"
              placeholder="Filter by name, category, or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 w-full border border-gray-100 bg-gray-50/50 rounded-xl focus:bg-white focus:border-emerald-100 transition-all h-14 text-sm font-medium tracking-wide outline-none placeholder:text-gray-300"
            />
          </div>
          <button
            onClick={() => {
              setSearch('');
              fetchProducts();
            }}
            className="h-14 px-8 rounded-xl font-black text-[9px] uppercase tracking-widest border border-gray-100 text-gray-400 hover:bg-black hover:text-white transition-all duration-300"
          >
            Reset Ledger
          </button>
        </div>

        {/* Ledger Table Container */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden p-2">
          {error ? (
            <div className="text-center py-20 bg-red-50/20 rounded-[2rem]">
              <AlertTriangle className="w-10 h-10 text-red-300 mx-auto mb-4" />
              <p className="text-red-600 font-black uppercase tracking-widest text-[10px] mb-6">{error}</p>
              <button
                onClick={fetchProducts}
                className="px-6 py-3 bg-black text-white rounded-lg font-black text-[9px] uppercase tracking-widest hover:bg-red-600 transition-colors"
              >
                Reconnect Terminal
              </button>
            </div>
          ) : (
            <ProductTable
              products={filteredProducts}
              loading={loading}
              onDelete={handleDelete}
            />
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
