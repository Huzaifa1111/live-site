// apps/frontend/src/components/forms/ProductForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import productService, { CreateProductData } from '@/services/product.service';
import { Upload, X, Layers, Plus, Sparkles, Search } from 'lucide-react';
import RichTextEditor from '../admin/RichTextEditor';
import AttributeSelector from '../admin/AttributeSelector';
import VariationEditor from '../admin/VariationEditor';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';

interface ProductFormProps {
  initialData?: CreateProductData & { id?: number; featured?: boolean };
  isEditing?: boolean;
}

interface Category {
  id: number;
  name: string;
}

export default function ProductForm({ initialData, isEditing = false }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/categories/public`);
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const [formData, setFormData] = useState<CreateProductData & { featured?: boolean; categoryId?: string | number }>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    longDescription: initialData?.longDescription || '',
    price: initialData?.price || 0,
    stock: initialData?.stock || 0,
    categoryId: (initialData as any)?.categoryId || '',
    featured: initialData?.featured || false,
    shippingPolicy: initialData?.shippingPolicy || '',
    returnPolicy: initialData?.returnPolicy || '',
    variations: initialData?.variations || [],
  });

  const [isVariable, setIsVariable] = useState(initialData?.variations && initialData.variations.length > 0);
  const [attributes, setAttributes] = useState<{ name: string; values: { id: number; value: string }[] }[]>([
    { name: 'Size', values: [] },
    { name: 'Color', values: [] }
  ]);
  const [newAttributeInput, setNewAttributeInput] = useState('');
  const [newAttributeValues, setNewAttributeValues] = useState('');
  const [globalAttributes, setGlobalAttributes] = useState<{ id: number; name: string }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [focusedSuggestionIndex, setFocusedSuggestionIndex] = useState(-1);

  const filteredSuggestions = globalAttributes.filter(attr =>
    newAttributeInput &&
    attr.name.toLowerCase().includes(newAttributeInput.toLowerCase()) &&
    !attributes.find(a => a.name.toLowerCase() === attr.name.toLowerCase()) &&
    attr.name.toLowerCase() !== newAttributeInput.toLowerCase()
  );

  useEffect(() => {
    const fetchGlobalAttributes = async () => {
      try {
        const res = await api.get('/attributes');
        setGlobalAttributes(res.data);
      } catch (err) {
        console.error('Failed to fetch global attributes', err);
      }
    };
    fetchGlobalAttributes();
  }, []);

  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox'
        ? (e.target as HTMLInputElement).checked
        : type === 'number'
          ? parseFloat(value) || 0
          : value,
    }));
  };

  const handleRichTextChange = (name: string, content: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: content
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    setImageFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const productData: CreateProductData & { featured?: boolean } = {
        ...formData,
        image: imageFile || undefined,
      };

      if (isEditing && initialData?.id) {
        await productService.updateProduct(initialData.id, productData);
      } else {
        await productService.createProduct(productData);
      }

      router.push('/admin/products');
      router.refresh();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAttribute = (index: number, values: { id: number; value: string }[]) => {
    const newAttrs = [...attributes];
    newAttrs[index].values = values;
    setAttributes(newAttrs);
  };

  const handleAddAttribute = () => {
    if (!newAttributeInput.trim()) return;
    const trimmedName = newAttributeInput.trim();
    if (attributes.find(a => a.name.toLowerCase() === trimmedName.toLowerCase())) {
      alert('Attribute already exists');
      return;
    }

    // Process initial values if any
    const initialValues = newAttributeValues.split(',')
      .map(v => v.trim())
      .filter(Boolean)
      .map((v, i) => ({ id: -(Date.now() + i), value: v }));

    setAttributes([...attributes, { name: trimmedName, values: initialValues }]);
    setNewAttributeInput('');
    setNewAttributeValues('');
  };

  const handleRemoveAttribute = (index: number) => {
    if (confirm('Are you sure you want to remove this attribute?')) {
      setAttributes(attributes.filter((_, i) => i !== index));
    }
  };

  const generateCombinations = () => {
    const activeAttributes = attributes.filter(a => a.values.length > 0);
    if (activeAttributes.length === 0) return;

    let combos: any[][] = [[]];
    activeAttributes.forEach(attr => {
      const nextCombos: any[][] = [];
      combos.forEach(combo => {
        attr.values.forEach(val => {
          nextCombos.push([...combo, { id: val.id, value: val.value, attribute: { name: attr.name } }]);
        });
      });
      combos = nextCombos;
    });

    const newVariations = combos.map(combo => ({
      sku: `${formData.name.substring(0, 3).toUpperCase()}-${combo.map(c => c.value.substring(0, 3).toUpperCase()).join('-')}`,
      price: formData.price,
      stock: formData.stock,
      inStock: true,
      images: [],
      isDefault: false,
      attributeValues: combo,
      attributeValueIds: combo.map(c => c.id)
    }));

    setFormData(prev => ({
      ...prev,
      variations: [...(prev.variations || []), ...newVariations]
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {/* Image Upload Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Product Image
        </label>
        <div className="space-y-4">
          {imagePreview ? (
            <div className="relative w-48 h-48">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-full object-cover rounded-lg border border-gray-300"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-48 h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-sm text-gray-500">
                  Click to upload image
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  PNG, JPG, GIF up to 5MB
                </p>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
              />
            </label>
          )}
        </div>
      </div>

      {/* Product Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Product Name *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          value={formData.name}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Enter product name"
        />
      </div>

      {/* Short Description */}
      <div>
        <RichTextEditor
          label="Short Summary (Highlights) *"
          placeholder="Brief summary for highlights..."
          value={formData.description}
          onChange={(content) => handleRichTextChange('description', content)}
        />
      </div>

      {/* Long Description */}
      <div>
        <RichTextEditor
          label="Extended Narrative (Includes Images)"
          placeholder="Detailed description, specifications, and images..."
          value={formData.longDescription || ''}
          onChange={(content) => handleRichTextChange('longDescription', content)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RichTextEditor
          label="Shipping Policy"
          placeholder="Custom shipping details..."
          value={formData.shippingPolicy || ''}
          onChange={(content) => handleRichTextChange('shippingPolicy', content)}
        />
        <RichTextEditor
          label="Return Policy"
          placeholder="Custom return details..."
          value={formData.returnPolicy || ''}
          onChange={(content) => handleRichTextChange('returnPolicy', content)}
        />
      </div>

      {/* Price and Stock */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">
            Price ($) *
          </label>
          <input
            type="number"
            id="price"
            name="price"
            required
            min="0"
            step="0.01"
            value={formData.price}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="0.00"
          />
        </div>

        <div>
          <label htmlFor="stock" className="block text-sm font-medium text-gray-700">
            Stock Quantity *
          </label>
          <input
            type="number"
            id="stock"
            name="stock"
            required
            min="0"
            value={formData.stock}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="0"
          />
        </div>
      </div>

      {/* Category */}
      <div>
        <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">
          Category
        </label>
        <select
          id="categoryId"
          name="categoryId"
          value={formData.categoryId || ''}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">Select a category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Featured Checkbox - ADD THIS SECTION */}
      <div className="flex items-start space-x-2 p-4 border border-gray-200 rounded-lg">
        <input
          type="checkbox"
          id="featured"
          name="featured"
          checked={formData.featured || false}
          onChange={handleInputChange}
          className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <div>
          <label htmlFor="featured" className="block text-sm font-medium text-gray-700">
            Featured Product
          </label>
          <p className="text-sm text-gray-500 mt-1">
            Featured products will be prominently displayed on the homepage.
            Check this box to make this product appear in the featured section.
          </p>
        </div>
      </div>

      {/* Variable Product Toggle */}
      <div className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-sm space-y-8 mt-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Layers size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 leading-tight">Product Attributes</h3>
              <p className="text-sm text-gray-500 font-medium mt-1">Enable attributes like size, color, etc.</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer group">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={isVariable}
              onChange={(e) => setIsVariable(e.target.checked)}
            />
            <div className="w-14 h-8 bg-gray-100 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all after:shadow-sm peer-checked:bg-indigo-600 transition-colors"></div>
          </label>
        </div>

        <AnimatePresence>
          {isVariable && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-8 pt-6 border-t border-gray-50 overflow-hidden"
            >
              {/* Define Attributes */}
              <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm relative group/card">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-500">
                      <Search size={24} />
                    </div>
                    <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">Define Attributes</h3>
                  </div>
                  <span className="text-sm font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-full">{attributes.length} attributes</span>
                </div>

                {/* Main Search/Add Section from Screenshot */}
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row items-center gap-3">
                    <div className="flex-1 relative group/search w-full">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within/search:text-indigo-400 transition-colors pointer-events-none">
                        <Search size={22} />
                      </div>
                      <input
                        type="text"
                        value={newAttributeInput}
                        onChange={(e) => {
                          setNewAttributeInput(e.target.value);
                          setShowSuggestions(true);
                          setFocusedSuggestionIndex(-1);
                        }}
                        onFocus={() => setShowSuggestions(true)}
                        placeholder="Add new attribute (e.g. Material, Storage...)"
                        className="w-full pl-12 pr-4 py-4 bg-white border-2 border-dashed border-gray-100 rounded-[1.5rem] focus:border-indigo-100 focus:ring-4 focus:ring-indigo-50/20 shadow-sm transition-all text-sm font-medium text-gray-900 placeholder:text-gray-300"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            if (focusedSuggestionIndex >= 0) {
                              setNewAttributeInput(filteredSuggestions[focusedSuggestionIndex].name);
                              setShowSuggestions(false);
                            } else {
                              handleAddAttribute();
                            }
                          } else if (e.key === 'ArrowDown') {
                            setFocusedSuggestionIndex(prev => Math.min(prev + 1, filteredSuggestions.length - 1));
                          } else if (e.key === 'ArrowUp') {
                            setFocusedSuggestionIndex(prev => Math.max(prev - 1, -1));
                          } else if (e.key === 'Escape') {
                            setShowSuggestions(false);
                          }
                        }}
                      />

                      {showSuggestions && filteredSuggestions.length > 0 && (
                        <div className="absolute top-full left-0 w-full mt-3 bg-white border border-gray-100 shadow-2xl rounded-2xl overflow-hidden z-[100] py-2 ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2 duration-300">
                          <div className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 mb-1">
                            Existing Attributes
                          </div>
                          {filteredSuggestions.map((suggestion, idx) => (
                            <button
                              key={suggestion.id}
                              type="button"
                              onClick={() => {
                                setNewAttributeInput(suggestion.name);
                                setShowSuggestions(false);
                              }}
                              className={`w-full text-left px-4 py-3 text-sm font-bold transition-colors flex items-center justify-between ${focusedSuggestionIndex === idx ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                              {suggestion.name}
                              <span className="text-[10px] text-gray-400 font-medium">From database</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleAddAttribute}
                      disabled={!newAttributeInput.trim()}
                      className="w-full md:w-auto flex items-center justify-center gap-2 px-10 py-4 bg-[#F8FAFF] text-indigo-300 rounded-[1.5rem] font-bold text-sm hover:bg-indigo-50 hover:text-indigo-600 active:scale-95 transition-all disabled:opacity-30 whitespace-nowrap"
                    >
                      <Plus size={24} />
                      Add
                    </button>
                  </div>

                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={generateCombinations}
                      className="group flex items-center gap-3 px-10 py-4 bg-white border border-indigo-100 text-indigo-600 rounded-[1.5rem] font-bold text-sm hover:bg-indigo-50/50 active:scale-95 transition-all shadow-sm shadow-indigo-100/10"
                    >
                      <Sparkles size={22} className="text-indigo-400 group-hover:rotate-12 transition-transform" />
                      Generate Combinations
                    </button>
                  </div>
                </div>

                {/* List of Added Attributes displayed below the main add bar */}
                <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                  {attributes.map((attr, idx) => (
                    <div key={idx} className="bg-white border border-gray-100 rounded-[2rem] p-6 group/attr hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-50/10 transition-all duration-300 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-sm" />
                          <span className="font-bold text-gray-900 text-lg tracking-tight">{attr.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveAttribute(idx)}
                          className="text-gray-300 hover:text-red-500 p-2 opacity-0 group-hover/attr:opacity-100 hover:bg-red-50 rounded-full transition-all"
                        >
                          <X size={18} />
                        </button>
                      </div>
                      <AttributeSelector
                        attributeName={attr.name}
                        selectedValues={attr.values}
                        onChange={(vals) => handleUpdateAttribute(idx, vals)}
                      />
                    </div>
                  ))}
                </div>

                {showSuggestions && (
                  <div className="fixed inset-0 z-[90]" onClick={() => setShowSuggestions(false)} />
                )}
              </div>

              {/* Variations List */}
              <div className="space-y-4 mt-12">
                <div className="flex items-center justify-between px-2">
                  <h4 className="font-bold text-gray-900">Attributes ({formData.variations?.length || 0})</h4>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      variations: [...(prev.variations || []), { sku: '', price: prev.price, stock: 0, inStock: true, images: [], isDefault: false, attributeValues: [] }]
                    }))}
                    className="text-indigo-600 font-bold text-sm flex items-center gap-1 hover:text-indigo-700 transition-colors"
                  >
                    <Plus size={16} /> Add Manually
                  </button>
                </div>

                <div className="space-y-4">
                  {formData.variations?.map((v, idx) => (
                    <VariationEditor
                      key={idx}
                      variation={v}
                      isSingle={formData.variations?.length === 1}
                      onUpdate={(updated) => {
                        const newVars = [...(formData.variations || [])];
                        newVars[idx] = updated;
                        setFormData(prev => ({ ...prev, variations: newVars }));
                      }}
                      onRemove={() => {
                        setFormData(prev => ({
                          ...prev,
                          variations: prev.variations?.filter((_, i) => i !== idx)
                        }));
                      }}
                    />
                  ))}

                  {(!formData.variations || formData.variations.length === 0) && (
                    <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-[2rem] bg-gray-50/30">
                      <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm mb-4">
                        <Layers className="text-gray-200" size={32} />
                      </div>
                      <p className="text-gray-400 font-medium">No attributes defined yet</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end space-x-4 pt-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? 'Saving...' : isEditing ? 'Update Product' : 'Create Product'}
        </button>
      </div>
    </form>
  );
}