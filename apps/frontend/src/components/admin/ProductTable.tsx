'use client';

import { useState } from 'react';
import { Edit2, Trash2, Eye, Star, AlertTriangle, CheckCircle, Package } from 'lucide-react';
import Link from 'next/link';
import { Product } from '@/types/product';
import { resolveProductImage } from '@/lib/image';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductTableProps {
  products: Product[];
  loading?: boolean;
  onDelete: (id: number) => void;
}

export default function ProductTable({ products, loading = false, onDelete }: ProductTableProps) {
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const formatPrice = (price: any) => {
    const numPrice = Number(price);
    if (isNaN(numPrice)) return '$0.00';
    return `$${numPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatStock = (stock: any) => {
    const numStock = Number(stock);
    if (isNaN(numStock)) return 0;
    return numStock;
  };

  const getStockConfig = (stock: number) => {
    if (stock === 0) return { color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-100', text: 'Depleted' };
    if (stock < 10) return { color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-100', text: 'Low Reserve' };
    return { color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'In Selection' };
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="h-10 w-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full"
        />
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Synchronizing Ledger...</span>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-6 text-center">
        <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center text-gray-200">
          <PackageSearch size={40} className="opacity-50" />
        </div>
        <div>
          <h3 className="text-xl font-black text-black tracking-tighter mb-2">Ledger is Empty</h3>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">No inventory records detected in this sector.</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-50">
          <thead>
            <tr className="bg-gray-50/20">
              <th className="px-6 py-5 text-left text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">
                Asset Name
              </th>
              <th className="px-6 py-5 text-left text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">
                Classification
              </th>
              <th className="px-6 py-5 text-left text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">
                Valuation
              </th>
              <th className="px-6 py-5 text-left text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">
                Reserve
              </th>
              <th className="px-6 py-5 text-left text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">
                Status
              </th>
              <th className="px-6 py-5 text-right text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">
                Operations
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50/50">
            <AnimatePresence>
              {products.map((product, index) => {
                const stock = formatStock(product.stock);
                const stockConfig = getStockConfig(stock);
                return (
                  <motion.tr
                    key={product.id}
                    className="hover:bg-gray-50/30 transition-all duration-300 group"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 relative rounded-lg overflow-hidden border border-gray-100 group-hover:scale-105 transition-transform duration-500 shadow-sm bg-gray-50">
                          {product.images && product.images.length > 0 ? (
                            <img
                              className="h-full w-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                              src={resolveProductImage(product.images)}
                              alt={product.name}
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <Package className="text-gray-200" size={14} />
                            </div>
                          )}
                        </div>
                        <div className="ml-4 min-w-0">
                          <div className="text-[13px] font-bold text-black tracking-tight truncate max-w-[200px] group-hover:text-emerald-600 transition-colors">
                            {product.name}
                          </div>
                          <div className="text-[9px] text-gray-400 font-bold uppercase tracking-widest truncate max-w-[200px]">
                            {product.id.toString().padStart(6, '0')} • {product.description?.replace(/<[^>]*>/g, '').substring(0, 30)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest bg-gray-50 text-gray-400 border border-gray-100 group-hover:text-black transition-colors">
                        {typeof product.category === 'object' ? product.category.name : (product.category || 'N/A')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-black text-black tracking-tight">
                      {formatPrice(product.price)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className={`text-[11px] font-black tracking-tighter ${stockConfig.color}`}>
                          {stock} Units
                        </span>
                        <span className={`text-[8px] font-bold uppercase tracking-widest pl-0 ${stockConfig.color} opacity-40`}>
                          {stockConfig.text}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {product.featured ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest bg-emerald-600 text-white shadow-lg shadow-emerald-100">
                          Spotlight
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">General</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                        <Link
                          href={`/products/${product.id}`}
                          className="p-2 rounded-lg bg-white text-gray-400 hover:bg-black hover:text-white border border-gray-50 shadow-sm transition-all duration-300"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/admin/products/edit/${product.id}`}
                          className="p-2 rounded-lg bg-white text-gray-400 hover:bg-emerald-600 hover:text-white border border-gray-50 shadow-sm transition-all duration-300"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => setConfirmDelete(product.id)}
                          className="p-2 rounded-lg bg-white text-gray-400 hover:bg-red-600 hover:text-white border border-gray-50 shadow-sm transition-all duration-300"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4 px-4 pb-10">
        <AnimatePresence>
          {products.map((product, index) => {
            const stock = formatStock(product.stock);
            const stockConfig = getStockConfig(stock);
            return (
              <motion.div
                key={product.id}
                className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm relative overflow-hidden group"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="flex items-start gap-5">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0">
                    {product.images && product.images.length > 0 ? (
                      <img
                        className="h-full w-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                        src={resolveProductImage(product.images)}
                        alt={product.name}
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <Package className="text-gray-200" size={20} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 pt-1">
                    <div className="flex justify-between items-start mb-1.5">
                      <h3 className="text-sm font-black text-black tracking-tight leading-tight uppercase">{product.name}</h3>
                      {product.featured && (
                        <div className="ml-2 flex-shrink-0 bg-emerald-50 px-2 py-0.5 rounded text-[8px] font-black text-emerald-600 uppercase tracking-widest">
                          Spotlight
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5 pt-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[14px] font-black text-black tracking-tighter">{formatPrice(product.price)}</span>
                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">• ID: {product.id}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="px-2 py-0.5 rounded bg-gray-50 text-gray-400 text-[8px] font-black uppercase tracking-widest border border-gray-100">
                          {typeof product.category === 'object' ? product.category.name : (product.category || 'N/A')}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${stockConfig.border} ${stockConfig.bg} ${stockConfig.color}`}>
                          {stock} UNITS
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 mt-5 pt-5 border-t border-gray-50">
                  <Link
                    href={`/products/${product.id}`}
                    className="flex-1 max-w-[40px] h-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-400 active:bg-black active:text-white transition-all"
                  >
                    <Eye size={16} />
                  </Link>
                  <Link
                    href={`/admin/products/edit/${product.id}`}
                    className="flex-1 h-10 flex items-center justify-center gap-2 rounded-xl bg-gray-50 text-[9px] font-black uppercase text-gray-500 hover:text-emerald-600 transition-all"
                  >
                    <Edit2 size={12} /> Edit Asset
                  </Link>
                  <button
                    onClick={() => setConfirmDelete(product.id)}
                    className="flex-1 max-w-[40px] h-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-400 active:bg-red-600 active:text-white transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-[100] p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-8 rounded-[2rem] shadow-3xl max-w-sm w-full border border-gray-100"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-6 text-red-500">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-xl font-black text-black tracking-tight mb-3">Confirm Deletion</h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed mb-8">
                This asset will be permanently expunged from the registry. This action cannot be rescinded.
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 bg-gray-50 rounded-xl transition-all"
                >
                  Abort
                </button>
                <button
                  onClick={() => {
                    onDelete(confirmDelete);
                    setConfirmDelete(null);
                  }}
                  className="flex-1 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-white bg-red-600 rounded-xl hover:bg-black transition-all shadow-xl shadow-red-100"
                >
                  Expunge
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}

// Helper icon component
function PackageSearch({ size, className }: { size: number, className: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14" />
      <path d="m7.5 4.27 9 5.15" />
      <polyline points="3.29 7 12 12 20.71 7" />
      <line x1="12" x2="12" y1="22" y2="12" />
      <circle cx="18.5" cy="15.5" r="2.5" />
      <path d="M20.27 17.27 22 19" />
    </svg>
  )
}