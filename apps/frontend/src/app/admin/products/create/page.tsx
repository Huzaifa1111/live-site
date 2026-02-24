// apps/frontend/src/app/admin/products/create/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, UploadCloud, Image as ImageIcon, Check, Loader2, DollarSign, Package, Tag, Layers, Star, Plus, Trash2, Search, Link as LinkIcon, Sparkles, Scissors, Info, X } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import RichTextEditor from '@/components/admin/RichTextEditor';
import AttributeSelector from '@/components/admin/AttributeSelector';
import VariationEditor from '@/components/admin/VariationEditor';
import ProductSearchSelect from '@/components/admin/ProductSearchSelect';

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

interface AttributeValue {
  id: number;
  value: string;
}

interface Variation {
  sku: string;
  price: number;
  salePrice?: number;
  saleStartDate?: string;
  saleEndDate?: string;
  stock: number;
  inStock: boolean;
  images: string[];
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  isDefault: boolean;
  attributeValues: AttributeValue[];
  attributeValueIds: number[];
}

export default function CreateProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [brands, setBrands] = useState<{ id: number, name: string }[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    longDescription: '',
    price: 0,
    stock: 0,
    categoryId: '',
    brandId: '',
    sku: '',
    featured: false,
    upsellIds: [] as number[],
    crossSellIds: [] as number[],
    shippingPolicy: '',
    returnPolicy: '',
  });

  const [variations, setVariations] = useState<Variation[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [descriptionImageUrls, setDescriptionImageUrls] = useState<string[]>([]);
  const [categories, setCategories] = useState<{ id: number, name: string }[]>([]);

  // Attribute Management State
  const [useVariations, setUseVariations] = useState(false);
  const [attributes, setAttributes] = useState<{ name: string; values: AttributeValue[] }[]>([]);
  const [newAttributeName, setNewAttributeName] = useState('');
  const [attributeOptions, setAttributeOptions] = useState<{ id: number, name: string }[]>([]);
  const [attributeLoading, setAttributeLoading] = useState(false);
  const [showAttributeOptions, setShowAttributeOptions] = useState(false);

  useEffect(() => {
    const fetchAttributeOptions = async () => {
      if (!showAttributeOptions && newAttributeName === '') return;
      setAttributeLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/attributes?q=${newAttributeName}`);
        if (res.ok) {
          const data = await res.json();
          setAttributeOptions(data);
        }
      } catch (err) {
        console.error('Failed to fetch attributes', err);
      } finally {
        setAttributeLoading(false);
      }
    };

    const timer = setTimeout(fetchAttributeOptions, 300);
    return () => clearTimeout(timer);
  }, [newAttributeName, showAttributeOptions]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const brandsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/brands`);
        if (brandsRes.ok) setBrands(await brandsRes.json());

        const categoriesRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/categories/public`);
        if (categoriesRes.ok) setCategories(await categoriesRes.json());
      } catch (err) {
        console.error('Failed to fetch data', err);
      }
    };
    fetchData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox'
        ? (e.target as HTMLInputElement).checked
        : name === 'price' || name === 'stock'
          ? parseFloat(value) || 0
          : value
    }));
  };

  const handleRichTextChange = (name: string, content: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: content
    }));
  };

  const generateSku = () => {
    if (!formData.name) return;
    const prefix = formData.name.slice(0, 3).toUpperCase().replace(/[^A-Z]/g, 'X');
    const random = Math.floor(1000 + Math.random() * 9000);
    const generated = `${prefix}-${random}`;
    setFormData(prev => ({ ...prev, sku: generated }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const filesArray = Array.from(files);
      setImages(prev => [...prev, ...filesArray]);

      const newPreviews = filesArray.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
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

  // Attribute Management
  const addAttribute = () => {
    const name = newAttributeName.trim();
    if (!name) return;
    if (attributes.find(a => a.name.toLowerCase() === name.toLowerCase())) return;
    setAttributes(prev => [...prev, { name, values: [] }]);
    setNewAttributeName('');
  };

  const removeAttribute = (index: number) => {
    setAttributes(prev => prev.filter((_, i) => i !== index));
  };

  const updateAttributeValues = (index: number, values: AttributeValue[]) => {
    setAttributes(prev => prev.map((a, i) => i === index ? { ...a, values } : a));
  };

  // Variation Logic
  const generateVariations = () => {
    const activeAttrs = attributes.filter(a => a.values.length > 0);
    if (activeAttrs.length === 0) return;

    const combinations: AttributeValue[][] = [[]];
    for (const attr of activeAttrs) {
      const values = attr.values;
      const newCombinations: AttributeValue[][] = [];
      for (const combo of combinations) {
        for (const val of values) {
          newCombinations.push([...combo, val]);
        }
      }
      combinations.length = 0;
      combinations.push(...newCombinations);
    }

    const newVariations: Variation[] = combinations.map((combo, idx) => ({
      sku: `${formData.sku}-${combo.map(v => v.value.slice(0, 2).toUpperCase()).join('-')}-${idx}`,
      price: formData.price,
      stock: 0,
      inStock: true,
      images: [],
      isDefault: idx === 0,
      attributeValues: combo,
      attributeValueIds: combo.map(v => v.id)
    }));

    setVariations(newVariations);
  };

  const addManualVariation = () => {
    setVariations([...variations, {
      sku: `${formData.sku}-VAR-${variations.length + 1}`,
      price: formData.price,
      stock: 0,
      inStock: true,
      images: [],
      isDefault: variations.length === 0,
      attributeValues: [],
      attributeValueIds: []
    }]);
  };

  const updateVariation = (index: number, updated: Variation) => {
    const newVariations = [...variations];
    // Ensure only one default
    if (updated.isDefault) {
      newVariations.forEach((v, i) => { if (i !== index) v.isDefault = false; });
    }
    newVariations[index] = updated;
    setVariations(newVariations);
  };

  const removeVariation = (index: number) => {
    setVariations(variations.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach(v => formDataToSend.append(key, v.toString()));
        } else {
          formDataToSend.append(key, value.toString());
        }
      });

      if (useVariations && variations.length > 0) {
        formDataToSend.append('variations', JSON.stringify(variations));
      }

      if (images.length > 0) {
        images.forEach(img => formDataToSend.append('images', img));
      }

      if (descriptionImageUrls.length > 0) {
        formDataToSend.append('descriptionImages', JSON.stringify(descriptionImageUrls));
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/products`, {
        method: 'POST',
        body: formDataToSend,
        credentials: 'include',
      });

      if (response.ok) {
        router.push('/admin/products');
        router.refresh();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create product');
      }
    } catch (error: any) {
      console.error('Error creating product:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="space-y-8 pb-12"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 opacity-70 pointer-events-none"></div>

        <div className="relative z-10 flex items-center gap-4">
          <Link href="/admin/products" className="p-3 bg-white rounded-xl shadow-sm border border-gray-100 text-gray-500 hover:text-black hover:shadow-md transition-all">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Add New Product</h1>
            <p className="text-gray-500 font-medium">Create a new item for your inventory</p>
          </div>
        </div>

        <div className="relative z-10 flex gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 rounded-xl border border-gray-200 font-bold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-8 py-3 rounded-xl bg-black text-white font-bold shadow-lg shadow-gray-200 hover:bg-gray-800 transition-all flex items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />}
            Create Product
          </button>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column - Main Info */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-8">
          {/* Basic Details Card */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Tag className="text-blue-600" /> Basic Information
            </h2>

            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-2">Product Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-5 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium text-gray-900 placeholder:text-gray-400"
                  placeholder="e.g. Wireless Noise Cancelling Headphones"
                />
              </div>

              <div>
                <label htmlFor="sku" className="block text-sm font-bold text-gray-700 mb-2">Base SKU</label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    id="sku"
                    name="sku"
                    value={formData.sku}
                    onChange={handleInputChange}
                    className="flex-1 px-5 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium text-gray-900 placeholder:text-gray-400"
                    placeholder="e.g. HN-1000-W"
                  />
                  <button
                    type="button"
                    onClick={generateSku}
                    className="px-5 py-2 bg-blue-50 text-blue-600 rounded-2xl font-bold hover:bg-blue-100 transition-colors flex items-center gap-2"
                    title="Auto-generate SKU"
                  >
                    <Sparkles size={18} /> Generate
                  </button>
                </div>
              </div>

              <div>
                <RichTextEditor
                  label="Short Description"
                  placeholder="A brief overview of the product..."
                  value={formData.description}
                  onChange={(content) => handleRichTextChange('description', content)}
                />
              </div>

              <div>
                <RichTextEditor
                  label="Long Description"
                  placeholder="Detailed product features, specifications, and benefits..."
                  value={formData.longDescription}
                  onChange={(content) => handleRichTextChange('longDescription', content)}
                />
              </div>

              {/* Description Images Gallery */}
              <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl border border-purple-100">
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <RichTextEditor
                  label="Shipping Policy"
                  placeholder="Custom shipping details for this product..."
                  value={formData.shippingPolicy}
                  onChange={(content) => handleRichTextChange('shippingPolicy', content)}
                />
                <RichTextEditor
                  label="Return Policy"
                  placeholder="Custom return details for this product..."
                  value={formData.returnPolicy}
                  onChange={(content) => handleRichTextChange('returnPolicy', content)}
                />
              </div>
            </div>
          </div>

          {/* Pricing & Inventory Card */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <DollarSign className="text-green-600" /> Pricing & Inventory
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label htmlFor="price" className="block text-sm font-bold text-gray-700 mb-2">Base Price</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-400 font-bold">$</span>
                  </div>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    required
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full pl-8 pr-5 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-green-100 focus:border-green-500 transition-all font-medium text-gray-900"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="stock" className="block text-sm font-bold text-gray-700 mb-2">Base Stock Quantity</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-400"><Package size={16} /></span>
                  </div>
                  <input
                    type="number"
                    id="stock"
                    name="stock"
                    required
                    min="0"
                    value={formData.stock}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-5 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-purple-100 focus:border-purple-500 transition-all font-medium text-gray-900"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Variable Product Settings */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Layers className="text-indigo-600" /> Variable Product
                </h2>
                <p className="text-sm text-gray-500 font-medium">Enable variations like size, color, etc.</p>
              </div>
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-14 h-7 rounded-full transition-all relative ${useVariations ? 'bg-indigo-600' : 'bg-gray-200'}`}>
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={useVariations}
                    onChange={(e) => setUseVariations(e.target.checked)}
                  />
                  <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${useVariations ? 'left-8' : 'left-1'}`} />
                </div>
              </label>
            </div>

            {useVariations && (
              <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
                {/* Attribute Selection */}
                <div className="p-6 bg-gray-50/50 rounded-2xl border border-gray-100 space-y-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Scissors className="text-indigo-500" size={18} />
                      <h3 className="font-bold text-gray-900">Define Attributes</h3>
                    </div>
                    <span className="text-xs text-gray-400 font-medium">{attributes.length} attribute{attributes.length !== 1 ? 's' : ''}</span>
                  </div>

                  {/* Attribute Search Bar (The new way to add attributes) */}
                  <div className="relative mb-6">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        value={newAttributeName}
                        onChange={(e) => {
                          setNewAttributeName(e.target.value);
                          setShowAttributeOptions(true);
                        }}
                        onFocus={() => setShowAttributeOptions(true)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (newAttributeName.trim() && !attributeLoading) addAttribute();
                          }
                        }}
                        placeholder="Search or add an attribute (e.g. Color, Size, Material...)"
                        className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all text-sm font-medium shadow-sm"
                      />
                      {newAttributeName.trim() && !attributeOptions.find(o => o.name.toLowerCase() === newAttributeName.toLowerCase().trim()) && (
                        <button
                          type="button"
                          onClick={addAttribute}
                          className="absolute right-3 top-1/2 -translate-y-1/2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-bold hover:bg-indigo-100 transition-colors flex items-center gap-2 text-xs"
                        >
                          <Plus size={14} /> Add "{newAttributeName}"
                        </button>
                      )}
                    </div>

                    {/* Attribute Search Results Dropdown */}
                    <AnimatePresence>
                      {showAttributeOptions && (attributeOptions.length > 0 || attributeLoading) && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute z-30 w-full mt-2 bg-white border border-gray-100 shadow-2xl rounded-[2rem] overflow-hidden max-h-60 overflow-y-auto"
                        >
                          {attributeLoading && <div className="p-6 text-center"><Loader2 className="animate-spin mx-auto text-indigo-500" /></div>}
                          {!attributeLoading && attributeOptions.map(opt => (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => {
                                if (!attributes.find(a => a.name.toLowerCase() === opt.name.toLowerCase())) {
                                  setAttributes(prev => [...prev, { name: opt.name, values: [] }]);
                                }
                                setNewAttributeName('');
                                setShowAttributeOptions(false);
                              }}
                              className="w-full text-left px-6 py-4 hover:bg-indigo-50 flex items-center justify-between transition-colors border-b border-gray-50 last:border-0 group"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-white group-hover:text-indigo-600 transition-colors">
                                  <Tag size={14} />
                                </div>
                                <span className="text-sm font-bold text-gray-700 group-hover:text-indigo-700">{opt.name}</span>
                              </div>
                              {attributes.find(a => a.name.toLowerCase() === opt.name.toLowerCase()) ? (
                                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Added</span>
                              ) : (
                                <Plus size={16} className="text-gray-300 group-hover:text-indigo-500" />
                              )}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {showAttributeOptions && (
                      <div className="fixed inset-0 z-20" onClick={() => setShowAttributeOptions(false)} />
                    )}
                  </div>

                  {/* Attribute boxes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {attributes.map((attr, idx) => (
                      <div key={idx} className="p-5 bg-white rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                              <Tag size={16} />
                            </div>
                            <span className="text-sm font-black text-gray-900 uppercase tracking-tight">
                              {attr.name}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeAttribute(idx)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                            title={`Remove ${attr.name}`}
                          >
                            <X size={16} />
                          </button>
                        </div>

                        <div className="mt-2">
                          <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-3">Attribute Values</p>
                          <AttributeSelector
                            attributeName={attr.name}
                            selectedValues={attr.values}
                            onChange={(vals) => updateAttributeValues(idx, vals)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {attributes.length > 0 && (
                    <div className="flex justify-end pt-4">
                      <button
                        type="button"
                        onClick={generateVariations}
                        className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-100 hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <Sparkles size={20} /> Generate Combinations
                      </button>
                    </div>
                  )}

                  {attributes.length === 0 && (
                    <div className="text-center py-10 border-2 border-dashed border-indigo-50 rounded-3xl bg-indigo-50/10">
                      <p className="text-indigo-400 text-sm font-medium">No attributes added yet. Use the search bar above to define attributes for this product.</p>
                    </div>
                  )}
                </div>

                {/* Variations List */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                      Variations ({variations.length})
                    </h3>
                    <button
                      type="button"
                      onClick={addManualVariation}
                      className="px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-xl font-bold transition-all text-sm flex items-center gap-2"
                    >
                      <Plus size={16} /> Add Manually
                    </button>
                  </div>

                  {variations.map((v, idx) => (
                    <VariationEditor
                      key={idx}
                      variation={v}
                      onUpdate={(updated) => updateVariation(idx, updated)}
                      onRemove={() => removeVariation(idx)}
                      isSingle={variations.length === 1}
                    />
                  ))}

                  {variations.length === 0 && (
                    <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-[2.5rem] bg-gray-50/30">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Layers size={24} className="text-gray-400" />
                      </div>
                      <p className="text-gray-500 font-bold mb-1">No Variations Yet</p>
                      <p className="text-sm text-gray-400 max-w-xs mx-auto">Select attributes above and generate combinations or add them manually.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Related Products Card */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <LinkIcon className="text-blue-500" /> Related Products
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <ProductSearchSelect
                label="Upsells"
                selectedIds={formData.upsellIds}
                onChange={(ids) => setFormData({ ...formData, upsellIds: ids })}
              />
              <ProductSearchSelect
                label="Cross-sells"
                selectedIds={formData.crossSellIds}
                onChange={(ids) => setFormData({ ...formData, crossSellIds: ids })}
              />
            </div>
          </div>
        </motion.div>

        {/* Right Column - Organization & Media */}
        <motion.div variants={itemVariants} className="space-y-8">
          {/* Media Card */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <ImageIcon className="text-purple-600" /> Media
            </h2>

            <div className="space-y-4">
              <label className="block text-sm font-bold text-gray-700">Product Images</label>

              <div className="grid grid-cols-2 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-gray-100 group">
                    <img src={preview} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}

                <label htmlFor="image-upload" className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 transition-all group">
                  <Plus className="w-6 h-6 text-gray-400 group-hover:text-blue-500" />
                  <span className="text-[10px] font-bold text-gray-400 mt-1 uppercase">Add Image</span>
                </label>
                <input
                  id="image-upload"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                />
              </div>
            </div>
          </div>

          {/* Organization Card */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Layers className="text-orange-600" /> Organization
            </h2>

            <div className="space-y-6">
              <div>
                <label htmlFor="categoryId" className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                <select
                  id="categoryId"
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-100 focus:border-orange-500 transition-all font-medium text-gray-900 appearance-none"
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="brandId" className="block text-sm font-bold text-gray-700 mb-2">Brand</label>
                <select
                  id="brandId"
                  name="brandId"
                  value={formData.brandId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-100 focus:border-orange-500 transition-all font-medium text-gray-900 appearance-none"
                >
                  <option value="">Select a brand</option>
                  {brands.map(brand => (
                    <option key={brand.id} value={brand.id}>{brand.name}</option>
                  ))}
                </select>
              </div>

              <div className="p-4 bg-yellow-50/50 rounded-2xl border border-yellow-100">
                <div className="flex items-start space-x-3">
                  <div className="flex items-center h-5 mt-1">
                    <input
                      type="checkbox"
                      id="featured"
                      name="featured"
                      checked={formData.featured}
                      onChange={handleInputChange}
                      className="h-5 w-5 text-yellow-500 focus:ring-yellow-400 border-gray-300 rounded-md"
                    />
                  </div>
                  <div className="flex-1">
                    <label htmlFor="featured" className="block text-sm font-bold text-gray-900 flex items-center gap-2">
                      Featured Product <Star size={14} className="fill-yellow-500 text-yellow-500" />
                    </label>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                      Featured products are pushed to the homepage.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </form>
    </motion.div>
  );
}