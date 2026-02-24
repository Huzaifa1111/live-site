'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Loader2, Package, Layers, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import productService, { Product } from '@/services/product.service';
import Link from 'next/link';

interface Category {
    id: number;
    name: string;
}

export default function SearchBar() {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [results, setResults] = useState<{ products: Product[], categories: Category[] }>({ products: [], categories: [] });
    const [loading, setLoading] = useState(false);
    const [allCategories, setAllCategories] = useState<Category[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    // Fetch all categories once for client-side filtering
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await productService.getCategories();
                setAllCategories(data);
            } catch (err) {
                console.error('Failed to fetch categories', err);
            }
        };
        fetchCategories();
    }, []);

    // Handle outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Search logic
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (!query.trim()) {
                setResults({ products: [], categories: [] });
                return;
            }

            setLoading(true);
            try {
                // Filter categories locally
                const filteredCategories = allCategories.filter(cat =>
                    cat.name.toLowerCase().includes(query.toLowerCase())
                ).slice(0, 3);

                // Fetch products from backend
                const filteredProducts = await productService.getAllProducts({
                    search: query,
                    limit: 5
                });

                setResults({
                    products: filteredProducts,
                    categories: filteredCategories
                });
            } catch (err) {
                console.error('Search failed', err);
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(timer);
    }, [query, allCategories]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/products?search=${encodeURIComponent(query.trim())}`);
            setIsOpen(false);
        }
    };

    return (
        <div className="relative" ref={containerRef}>
            <div
                className={`flex items-center bg-gray-50 border border-gray-100 rounded-full transition-all duration-300 ${isOpen ? 'w-64 md:w-80 ring-2 ring-emerald-100 border-emerald-400 bg-white shadow-lg' : 'w-10 h-10 md:w-48 overflow-hidden'
                    }`}
            >
                <button
                    onClick={() => setIsOpen(true)}
                    className="p-2.5 text-gray-400 hover:text-emerald-600 transition-colors flex-shrink-0"
                >
                    <Search size={20} />
                </button>

                <form onSubmit={handleSearch} className="flex-1 flex items-center pr-2">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setIsOpen(true);
                        }}
                        onFocus={() => setIsOpen(true)}
                        placeholder="Search products or categories..."
                        className={`w-full bg-transparent border-none outline-none text-sm font-medium text-black placeholder:text-gray-400 p-0 ${!isOpen && 'pointer-events-none opacity-0'
                            }`}
                    />
                    {query && isOpen && (
                        <button
                            type="button"
                            onClick={() => setQuery('')}
                            className="p-1 text-gray-300 hover:text-gray-500"
                        >
                            <X size={14} />
                        </button>
                    )}
                </form>
            </div>

            <AnimatePresence>
                {isOpen && (query.trim()) && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-full mt-3 right-0 w-[300px] md:w-[400px] bg-white border border-gray-100 shadow-2xl rounded-3xl overflow-hidden z-[110] p-2"
                    >
                        {loading && (
                            <div className="p-8 text-center">
                                <Loader2 className="animate-spin mx-auto text-emerald-500 mb-2" size={24} />
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Searching...</p>
                            </div>
                        )}

                        {!loading && results.products.length === 0 && results.categories.length === 0 && (
                            <div className="p-8 text-center text-gray-400">
                                <Search className="mx-auto mb-3 opacity-20" size={32} />
                                <p className="text-sm font-medium">No results found for "{query}"</p>
                            </div>
                        )}

                        {!loading && (results.categories.length > 0 || results.products.length > 0) && (
                            <div className="max-h-[70vh] overflow-y-auto custom-scrollbar p-2">
                                {/* Categories Section */}
                                {results.categories.length > 0 && (
                                    <div className="mb-4">
                                        <p className="px-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 flex items-center">
                                            <Layers size={12} className="mr-2" /> Categories
                                        </p>
                                        <div className="space-y-1">
                                            {results.categories.map(cat => (
                                                <Link
                                                    key={cat.id}
                                                    href={`/products?category=${cat.id}`}
                                                    onClick={() => setIsOpen(false)}
                                                    className="flex items-center justify-between p-3 rounded-2xl hover:bg-emerald-50 group transition-all"
                                                >
                                                    <span className="text-sm font-bold text-gray-700 group-hover:text-emerald-700">{cat.name}</span>
                                                    <ArrowRight size={14} className="text-gray-300 group-hover:text-emerald-500 opacity-0 group-hover:opacity-100 transition-all" />
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Products Section */}
                                {results.products.length > 0 && (
                                    <div>
                                        <p className="px-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 flex items-center">
                                            <Package size={12} className="mr-2" /> Products
                                        </p>
                                        <div className="space-y-1">
                                            {results.products.map(product => (
                                                <Link
                                                    key={product.id}
                                                    href={`/products/${product.id}`}
                                                    onClick={() => setIsOpen(false)}
                                                    className="flex items-center gap-3 p-2 rounded-2xl hover:bg-gray-50 group transition-all"
                                                >
                                                    <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                                                        {product.images && product.images[0] ? (
                                                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                                <Package size={20} />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-sm font-bold text-gray-900 truncate group-hover:text-emerald-600 transition-colors">{product.name}</h4>
                                                        <p className="text-xs font-black text-emerald-600 tracking-tight">${product.price}</p>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="mt-4 pt-4 border-t border-gray-50 p-2">
                                    <button
                                        onClick={handleSearch}
                                        className="w-full py-3 bg-black text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                                    >
                                        View All Results <ArrowRight size={14} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
