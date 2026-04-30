// apps/frontend/src/app/admin/edit/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { ArrowLeft, Loader2, X, Upload, Tag, DollarSign, Package, Check, Sparkles, Image as ImageIcon, UploadCloud, Trash2, Info } from 'lucide-react';
import Link from 'next/link';
import productService, { Product, UpdateProductData } from '@/services/product.service';
import { resolveProductImage } from '@/lib/image';
import RichTextEditor from '@/components/admin/RichTextEditor';
import { motion, AnimatePresence } from 'framer-motion';

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

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState<UpdateProductData>({
    name: '',
    description: '',
    longDescription: '',
    price: 0,
    stock: 0,
    category: '',
    featured: false,
  });

  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [descriptionImageUrls, setDescriptionImageUrls] = useState<string[]>([]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await productService.getProductById(productId);
        setProduct(data);
        setFormData({
          name: data.name,
          description: data.description,
          longDescription: data.longDescription || '',
          price: data.price,
          stock: data.stock,
          category: typeof data.category === 'object' ? data.category.name : (data.category || ''),
          featured: data.featured || false,
        });

        if (data.images && data.images.length > 0) {
          setImagePreviews(data.images.map((img: string) => resolveProductImage(img)));
        } else if (data.image) {
          setImagePreviews([resolveProductImage(data.image)]);
        }

        if (data.descriptionImages && data.descriptionImages.length > 0) {
          setDescriptionImageUrls(data.descriptionImages.map((img: string) => resolveProductImage(img)));
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        alert('Failed to load product');
        router.push('/admin/products');
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId, router]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox'
        ? (e.target as HTMLInputElement).checked
        : type === 'number'
          ? parseFloat(value) || 0
          : value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setImages(prev => [...prev, ...files]);

      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    // Note: This logic for keeping track of new vs old images 
    // would normally be more complex in a real production app
    setImages(prev => prev.filter((_, i) => i !== (index - (imagePreviews.length - images.length))));
  };

  const handleDescriptionImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const fd = new FormData();
        fd.append('image', file);
        console.log('Uploading image:', file.name);

        const token = localStorage.getItem('token');
        const headers: HeadersInit = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/uploads/image`, {
          method: 'POST',
          body: fd,
          credentials: 'include',
          headers,
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Upload failed:', response.status, errorText);
          throw new Error(`Upload failed: ${response.status}`);
        }

        const data = await response.json();
        console.log('Upload successful:', data.url);
        return data.url;
      });

      const urls = await Promise.all(uploadPromises);
      setDescriptionImageUrls(prev => [...prev, ...urls]);
      console.log('All images uploaded successfully');
    } catch (error) {
      console.error('Failed to upload description images:', error);
      alert(`Failed to upload one or more images. Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const removeDescriptionImage = (index: number) => {
    setDescriptionImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const dataToUpdate: UpdateProductData = {
        ...formData,
        image: images[0], // Service handles taking first image as main if needed
        descriptionImages: descriptionImageUrls
      };

      await productService.updateProduct(productId, dataToUpdate);
      router.push('/admin/products');
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Failed to update product.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">Syncing Selection Data</p>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="space-y-12 max-w-5xl mx-auto pb-32"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/admin/products" className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100 text-gray-400 hover:text-emerald-600 hover:shadow-xl transition-all duration-500 hover:-translate-x-1">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Edit Product</h1>
            <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.3em] mt-1">Refine product details & image assets</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-12">
        <Card className="rounded-[3rem] border-none shadow-2xl shadow-gray-200/50 overflow-hidden bg-white/50 backdrop-blur-xl">
          <CardContent className="p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              <div className="space-y-10">
                <motion.div variants={itemVariants}>
                  <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4 ml-1">
                    <Tag size={12} className="text-emerald-500" />
                    Designation
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-8 py-5 bg-gray-50/50 border-2 border-transparent rounded-[2rem] focus:bg-white focus:border-emerald-500 transition-all font-bold text-gray-900 text-lg shadow-sm"
                    placeholder="Product name..."
                  />
                </motion.div>

                <div className="grid grid-cols-2 gap-8">
                  <motion.div variants={itemVariants}>
                    <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4 ml-1">
                      <DollarSign size={12} className="text-emerald-500" />
                      Valuation ($)
                    </label>
                    <input
                      type="number"
                      name="price"
                      required
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={handleInputChange}
                      className="w-full px-8 py-5 bg-gray-50/50 border-2 border-transparent rounded-[2rem] focus:bg-white focus:border-emerald-500 transition-all font-black text-gray-900 text-lg shadow-sm"
                    />
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4 ml-1">
                      <Package size={12} className="text-emerald-500" />
                      Availability
                    </label>
                    <input
                      type="number"
                      name="stock"
                      required
                      min="0"
                      value={formData.stock}
                      onChange={handleInputChange}
                      className="w-full px-8 py-5 bg-gray-50/50 border-2 border-transparent rounded-[2rem] focus:bg-white focus:border-emerald-500 transition-all font-black text-gray-900 text-lg shadow-sm"
                    />
                  </motion.div>
                </div>

                <motion.div variants={itemVariants}>
                  <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4 ml-1">
                    Classification
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-8 py-5 bg-gray-50/50 border-2 border-transparent rounded-[2rem] focus:bg-white focus:border-emerald-500 transition-all font-bold text-gray-900 text-lg shadow-sm cursor-pointer appearance-none"
                  >
                    <option value="electronics">Electronics</option>
                    <option value="clothing">Clothing</option>
                    <option value="shoes">Shoes</option>
                    <option value="accessories">Accessories</option>
                  </select>
                </motion.div>

                <motion.div variants={itemVariants} className="flex items-center gap-4 p-6 bg-emerald-50/50 rounded-3xl border border-emerald-100">
                  <input
                    type="checkbox"
                    id="featured"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleInputChange}
                    className="w-6 h-6 rounded-lg border-2 border-emerald-200 text-emerald-600 focus:ring-emerald-500 transition-all cursor-pointer"
                  />
                  <label htmlFor="featured" className="text-sm font-black text-emerald-900 uppercase tracking-widest cursor-pointer">
                    Highlight in Collection
                  </label>
                </motion.div>
              </div>

              <div className="space-y-10">
                <motion.div variants={itemVariants}>
                  <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4 ml-1">
                    Short Briefing
                  </label>
                  <RichTextEditor
                    value={formData.description || ''}
                    onChange={(content) => setFormData(prev => ({ ...prev, description: content }))}
                    placeholder="Succinct product summary..."
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4 ml-1">
                    Extended Dossier
                  </label>
                  <RichTextEditor
                    value={formData.longDescription || ''}
                    onChange={(content) => setFormData(prev => ({ ...prev, longDescription: content }))}
                    placeholder="In-depth details, materials, and technical specifications..."
                  />
                </motion.div>

                {/* Description Images Gallery */}
                <motion.div variants={itemVariants} className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl border border-purple-100">
                  <div className="flex items-center gap-3 mb-4">
                    <ImageIcon className="text-purple-600" size={20} />
                    <div>
                      <h3 className="font-bold text-gray-900">Description Images</h3>
                      <p className="text-xs text-gray-500 font-medium">Upload images to display in the product description section</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                    <AnimatePresence>
                      {descriptionImageUrls.map((url, idx) => (
                        <motion.div
                          key={url}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="relative aspect-square group rounded-2xl overflow-hidden border-4 border-white shadow-lg"
                        >
                          <img src={url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
                          <button
                            type="button"
                            onClick={() => removeDescriptionImage(idx)}
                            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-xl"
                          >
                            <Trash2 size={14} />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    <label className="aspect-square flex flex-col items-center justify-center bg-white border-4 border-dashed border-purple-200 rounded-2xl cursor-pointer hover:border-purple-400 hover:bg-purple-50/50 transition-all duration-500 group relative overflow-hidden">
                      <div className="z-10 flex flex-col items-center gap-3">
                        <div className="p-5 bg-purple-50 rounded-2xl shadow-sm text-purple-300 group-hover:text-purple-600 group-hover:shadow-xl transition-all duration-500 group-hover:scale-110">
                          <UploadCloud size={24} />
                        </div>
                        <span className="text-[10px] font-black text-purple-300 uppercase tracking-widest group-hover:text-purple-600 transition-colors">Upload</span>
                      </div>
                      <input type="file" className="hidden" multiple accept="image/*" onChange={handleDescriptionImageUpload} />
                    </label>
                  </div>

                  <div className="flex items-start gap-2 p-3 bg-white/60 rounded-xl border border-purple-100">
                    <Info size={16} className="text-purple-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-600 font-medium">These images will appear in a gallery within the product description on the frontend.</p>
                  </div>
                </motion.div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[3rem] border-none shadow-2xl shadow-gray-200/50 overflow-hidden bg-white/50 backdrop-blur-xl">
          <CardContent className="p-12">
            <h2 className="text-xl font-black text-black mb-10 flex items-center gap-4">
              <Upload size={24} className="text-emerald-600" /> Global Asset Management
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-6">
              <AnimatePresence>
                {imagePreviews.map((preview, idx) => (
                  <motion.div
                    key={preview}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="relative aspect-square group rounded-[2rem] overflow-hidden border-4 border-white shadow-lg"
                  >
                    <img src={preview} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-xl"
                    >
                      <X size={16} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
              <label className="aspect-square flex flex-col items-center justify-center bg-white border-4 border-dashed border-gray-100 rounded-[2rem] cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/50 transition-all duration-500 group relative overflow-hidden">
                <div className="z-10 flex flex-col items-center gap-3">
                  <div className="p-5 bg-gray-50 rounded-2xl shadow-sm text-gray-300 group-hover:text-emerald-600 group-hover:shadow-xl transition-all duration-500 group-hover:scale-110">
                    <Upload size={24} />
                  </div>
                  <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest group-hover:text-emerald-600 transition-colors">Append Asset</span>
                </div>
                <input type="file" className="hidden" multiple accept="image/*" onChange={handleImageChange} />
              </label>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end items-center gap-10">
          <button type="button" onClick={() => router.back()} className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] hover:text-red-500 transition-all">
            Abort Updates
          </button>
          <button
            type="submit"
            disabled={saving}
            className="group relative px-12 py-6 bg-gray-900 text-white rounded-[2rem] font-black uppercase text-[10px] tracking-[0.3em] shadow-2xl shadow-gray-900/20 hover:bg-emerald-600 transition-all duration-500 disabled:opacity-50 hover:-translate-y-1 overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-3">
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Synchronizing...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Commit Changes
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                </>
              )}
            </span>
          </button>
        </div>
      </form>
    </motion.div>
  );
} 