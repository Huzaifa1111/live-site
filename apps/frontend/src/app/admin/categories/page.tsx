'use client';

import React, { useEffect, useState } from 'react';
import { adminService } from '@/services/admin.service';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Edit2,
    Trash2,
    LayoutGrid,
    Search,
    Loader2,
    X,
    CheckCircle2,
    AlertCircle,
    Package,
    Calendar,
    ArrowRight
} from 'lucide-react';

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

export default function CategoriesPage() {
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<any>(null);
    const [formData, setFormData] = useState({ name: '', description: '', image: '' });
    const [processing, setProcessing] = useState(false);
    const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const data = await adminService.getCategories();
            setCategories(data);
        } catch (err) {
            showNotification('error', 'Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    const showNotification = (type: 'success' | 'error', message: string) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleOpenModal = (category: any = null) => {
        if (category) {
            setEditingCategory(category);
            setFormData({ name: category.name, description: category.description || '', image: category.image || '' });
        } else {
            setEditingCategory(null);
            setFormData({ name: '', description: '', image: '' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setProcessing(true);
            if (editingCategory) {
                await adminService.updateCategory(editingCategory.id, formData);
                showNotification('success', 'Category updated successfully');
            } else {
                await adminService.createCategory(formData);
                showNotification('success', 'Category created successfully');
            }
            setIsModalOpen(false);
            fetchCategories();
        } catch (err) {
            showNotification('error', editingCategory ? 'Failed to update category' : 'Failed to create category');
        } finally {
            setProcessing(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this category? Products in this category will be uncategorized.')) return;
        try {
            await adminService.deleteCategory(id);
            showNotification('success', 'Category deleted successfully');
            fetchCategories();
        } catch (err) {
            showNotification('error', 'Failed to delete category');
        }
    };

    const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
            className="space-y-10 pb-12"
            variants={containerVariants}
            initial="hidden"
            animate="show"
        >
            {/* Category Header */}
            <motion.div variants={itemVariants} className="relative overflow-hidden rounded-[2.5rem] bg-black p-10 md:p-14 text-white shadow-2xl group">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-600/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/20 transition-colors duration-1000"></div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-6 h-[1.5px] bg-emerald-500" />
                            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em]">Category Management</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-none mb-3">Categories</h1>
                        <p className="text-gray-400 font-medium tracking-wide max-w-lg text-sm md:text-base">Manage your product categories, descriptions, and organization.</p>
                    </div>
                    <div className="relative z-10">
                        <button
                            onClick={() => handleOpenModal()}
                            className="flex items-center space-x-3 px-8 py-4 rounded-xl bg-white text-black hover:bg-emerald-600 hover:text-white font-black uppercase tracking-widest text-[9px] shadow-2xl transition-all duration-500 active:scale-95"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Add New Category</span>
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Notifications */}
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`p-4 rounded-2xl flex items-center gap-4 border shadow-sm ${notification.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'}`}
                    >
                        {notification.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                        <p className="text-[10px] font-black uppercase tracking-widest">{notification.message}</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Operations Panel */}
            <motion.div variants={itemVariants} className="space-y-6">
                {/* Search Bar */}
                <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-emerald-500/30 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search categories..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-6 h-14 bg-gray-50/50 border border-gray-100 rounded-xl focus:bg-white focus:border-emerald-100 focus:outline-none transition-all font-medium text-sm tracking-wide placeholder:text-gray-300"
                        />
                    </div>
                </div>

                {/* Category List */}
                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden p-2">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-50">
                            <thead>
                                <tr className="bg-gray-50/20">
                                    <th className="px-6 py-5 text-left text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Category Name</th>
                                    <th className="px-6 py-5 text-left text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Product Count</th>
                                    <th className="px-6 py-5 text-left text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Created On</th>
                                    <th className="px-6 py-5 text-right text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50/50">
                                {filteredCategories.length > 0 ? filteredCategories.map((category, index) => (
                                    <motion.tr
                                        key={category.id}
                                        className="hover:bg-gray-50/30 transition-all duration-300 group"
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.02 }}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-lg bg-gray-50 border border-gray-100 overflow-hidden flex items-center justify-center text-gray-300 group-hover:bg-black group-hover:text-emerald-500 transition-all duration-500 grayscale group-hover:grayscale-0">
                                                    {category.image ? (
                                                        <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <LayoutGrid size={20} />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-[13px] font-bold text-black tracking-tight uppercase group-hover:text-emerald-600 transition-colors">{category.name}</p>
                                                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest line-clamp-1 max-w-[200px]">{category.description || 'No description'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 rounded-md bg-emerald-50 text-emerald-600">
                                                    <Package size={12} />
                                                </div>
                                                <span className="text-[10px] font-black text-black uppercase tracking-widest">{category.products?.length || 0} Products</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-gray-400">
                                                <Calendar size={12} className="text-emerald-500/30" />
                                                <span className="text-[9px] font-black uppercase tracking-widest">
                                                    {new Date(category.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                                                <button
                                                    onClick={() => handleOpenModal(category)}
                                                    className="p-2 text-gray-400 hover:bg-black hover:text-white rounded-lg border border-gray-50 bg-white shadow-sm transition-all"
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(category.id)}
                                                    className="p-2 text-red-400 hover:bg-red-600 hover:text-white rounded-lg border border-gray-50 bg-white shadow-sm transition-all"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                )) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-20 text-center">
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest italic">No categories found matching your search.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </motion.div>

            {/* Entry Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl relative z-10 overflow-hidden border border-gray-100"
                        >
                            <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-8 h-8 rounded-lg bg-black text-emerald-500 flex items-center justify-center">
                                            <LayoutGrid size={16} />
                                        </div>
                                        <span className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.2em]">Category Details</span>
                                    </div>
                                    <h2 className="text-2xl font-black text-black tracking-tighter uppercase">{editingCategory ? 'Edit Category' : 'New Category'}</h2>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-black hover:text-white rounded-xl transition-all text-gray-400 active:scale-95">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Category Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-xl focus:bg-white focus:border-emerald-100 focus:outline-none transition-all font-medium text-sm tracking-wide"
                                        placeholder="e.g. Electronics"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Description</label>
                                    <textarea
                                        rows={3}
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-xl focus:bg-white focus:border-emerald-100 focus:outline-none transition-all font-medium text-sm tracking-wide resize-none"
                                        placeholder="Give this category a short description..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Image URL</label>
                                    <input
                                        type="text"
                                        value={formData.image}
                                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                        className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-xl focus:bg-white focus:border-emerald-100 focus:outline-none transition-all font-medium text-sm tracking-wide"
                                        placeholder="https://example.com/image.jpg"
                                    />
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 px-6 py-4 bg-gray-50 text-gray-400 font-black uppercase tracking-widest text-[9px] rounded-xl hover:bg-black hover:text-white transition-all active:scale-95"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="flex-1 px-6 py-4 bg-emerald-600 text-white font-black uppercase tracking-widest text-[9px] rounded-xl hover:bg-black transition-all shadow-xl shadow-emerald-600/10 flex items-center justify-center gap-3 active:scale-95 disabled:grayscale"
                                    >
                                        {processing && <Loader2 size={14} className="animate-spin" />}
                                        {processing ? 'Processing...' : (editingCategory ? 'Save Changes' : 'Create Category')}
                                        <ArrowRight size={14} />
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
