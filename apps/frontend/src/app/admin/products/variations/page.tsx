'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Plus, Search, Tag, Trash2, Edit2, Check, X, Loader2, Settings2 } from 'lucide-react';
import api from '@/lib/api';

interface AttributeValue {
    id: number;
    value: string;
}

interface Attribute {
    id: number;
    name: string;
    values: AttributeValue[];
}

export default function VariationsPage() {
    const [attributes, setAttributes] = useState<Attribute[]>([]);
    const [loading, setLoading] = useState(true);
    const [newAttributeName, setNewAttributeName] = useState('');
    const [initialValues, setInitialValues] = useState('');
    const [adding, setAdding] = useState(false);
    const [newValueInputs, setNewValueInputs] = useState<{ [key: number]: string }>({});
    const [addingValue, setAddingValue] = useState<{ [key: number]: boolean }>({});
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [focusedSuggestionIndex, setFocusedSuggestionIndex] = useState(-1);

    const filteredSuggestions = attributes.filter(attr =>
        newAttributeName &&
        attr.name.toLowerCase().includes(newAttributeName.toLowerCase()) &&
        attr.name.toLowerCase() !== newAttributeName.toLowerCase()
    );

    const fetchAttributes = async () => {
        try {
            const res = await api.get('/attributes');
            setAttributes(res.data);
        } catch (err) {
            console.error('Failed to fetch attributes', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAttributes();
    }, []);

    const handleAddAttribute = async () => {
        if (!newAttributeName.trim()) return;
        setAdding(true);
        const attrName = newAttributeName.trim();

        try {
            // Try to create, ignore if already exists (handled by proceeding to values)
            try {
                await api.post('/attributes', { name: attrName });
            } catch (err) {
                console.log('Attribute might already exist, proceeding to add values');
            }

            if (initialValues.trim()) {
                const values = initialValues.split(',').map(v => v.trim()).filter(Boolean);
                for (const val of values) {
                    await api.post('/attributes/values', {
                        attribute: attrName,
                        value: val
                    });
                }
            }

            setNewAttributeName('');
            setInitialValues('');
            setShowSuggestions(false);
            fetchAttributes();
        } catch (err) {
            console.error('Failed to process attribute/values', err);
        } finally {
            setAdding(false);
        }
    };

    const handleDeleteAttribute = async (id: number) => {
        if (!confirm('Are you sure? This will delete all values and variations associated with this attribute.')) return;
        try {
            await api.delete(`/attributes/${id}`);
            fetchAttributes();
        } catch (err) {
            console.error('Failed to delete attribute', err);
        }
    };

    const handleAddValue = async (attrId: number, attrName: string) => {
        const val = newValueInputs[attrId];
        if (!val?.trim()) return;

        setAddingValue(prev => ({ ...prev, [attrId]: true }));
        try {
            await api.post('/attributes/values', {
                attribute: attrName,
                value: val.trim()
            });
            setNewValueInputs(prev => ({ ...prev, [attrId]: '' }));
            fetchAttributes();
        } catch (err) {
            console.error('Failed to add attribute value', err);
        } finally {
            setAddingValue(prev => ({ ...prev, [attrId]: false }));
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 flex flex-col xl:flex-row xl:items-center justify-between gap-6 relative group">
                {/* Visual Accent Wrapper */}
                <div className="absolute inset-0 rounded-[2rem] overflow-hidden pointer-events-none">
                    <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-50/30 rounded-full blur-3xl group-hover:bg-indigo-100/40 transition-colors" />
                </div>
                <div className="relative z-10">
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Product Attributes</h1>
                    <p className="text-gray-400 mt-1 font-medium text-sm">Manage global product attributes and their values</p>
                </div>
                <div className="relative z-20 flex flex-col md:flex-row items-stretch gap-2 bg-[#F9FAFB] p-1.5 rounded-[1.5rem] border border-gray-100 w-full xl:w-auto xl:min-w-[500px]">
                    <div className="flex flex-1 items-center relative">
                        <input
                            type="text"
                            value={newAttributeName}
                            onChange={(e) => {
                                setNewAttributeName(e.target.value);
                                setShowSuggestions(true);
                                setFocusedSuggestionIndex(-1);
                            }}
                            onFocus={() => setShowSuggestions(true)}
                            placeholder="Attribute Name"
                            className="w-full bg-transparent border-none focus:ring-0 text-gray-900 px-4 py-2 text-xs font-bold placeholder:text-gray-300"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    if (focusedSuggestionIndex >= 0) {
                                        setNewAttributeName(filteredSuggestions[focusedSuggestionIndex].name);
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
                            <div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-100 shadow-xl rounded-2xl overflow-hidden z-50 py-2">
                                <div className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 mb-1">
                                    Existing Attributes
                                </div>
                                {filteredSuggestions.map((suggestion, idx) => (
                                    <button
                                        key={suggestion.id}
                                        onClick={() => {
                                            setNewAttributeName(suggestion.name);
                                            setShowSuggestions(false);
                                        }}
                                        className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-colors flex items-center justify-between ${focusedSuggestionIndex === idx ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        {suggestion.name}
                                        <span className="text-[10px] text-gray-400 font-medium">Already exists</span>
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="hidden sm:block w-px h-6 bg-gray-200" />
                        <input
                            type="text"
                            value={initialValues}
                            onChange={(e) => setInitialValues(e.target.value)}
                            placeholder="Values (e.g. Red, Blue, Green)"
                            className="w-full bg-transparent border-none focus:ring-0 text-gray-900 px-4 py-2 text-xs font-bold placeholder:text-gray-300"
                            onKeyDown={(e) => e.key === 'Enter' && handleAddAttribute()}
                        />
                    </div>
                    <button
                        onClick={handleAddAttribute}
                        disabled={adding || !newAttributeName.trim()}
                        className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#747474] text-white rounded-[1.25rem] font-bold text-xs hover:bg-[#5a5a5a] transition-all disabled:opacity-50 shadow-sm"
                    >
                        {adding ? <Loader2 className="animate-spin" size={14} /> : <Plus size={14} />}
                        Add
                    </button>

                    {showSuggestions && (
                        <div className="fixed inset-0 z-40" onClick={() => setShowSuggestions(false)} />
                    )}
                </div>
                {/* Visual Accent - REMOVED from direct position as it's now in wrapper */}
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-gray-100">
                    <Loader2 className="animate-spin text-indigo-600 mb-4" size={40} />
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Loading Attributes...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {attributes.map((attr) => (
                        <Card key={attr.id} className="rounded-[2.5rem] border-gray-100 overflow-hidden group hover:shadow-xl hover:shadow-gray-100/50 transition-all duration-500 hover:-translate-y-1">
                            <CardHeader className="bg-gray-50/50 border-b border-gray-50 p-8">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-black shadow-sm group-hover:bg-black group-hover:text-white transition-all duration-500">
                                            <Tag size={20} />
                                        </div>
                                        <CardTitle className="text-xl font-extrabold">{attr.name}</CardTitle>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteAttribute(attr.id)}
                                        className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-8 space-y-6">
                                <div className="space-y-4">
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input
                                            type="text"
                                            value={newValueInputs[attr.id] || ''}
                                            onChange={(e) => setNewValueInputs(prev => ({ ...prev, [attr.id]: e.target.value }))}
                                            placeholder={`Search or add ${attr.name.toLowerCase()}...`}
                                            className="w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
                                            onKeyDown={(e) => e.key === 'Enter' && handleAddValue(attr.id, attr.name)}
                                        />
                                        <button
                                            onClick={() => handleAddValue(attr.id, attr.name)}
                                            disabled={addingValue[attr.id] || !newValueInputs[attr.id]?.trim()}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all disabled:opacity-0"
                                        >
                                            {addingValue[attr.id] ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                                        </button>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {attr.values.map((val) => (
                                            <span key={val.id} className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-bold border border-indigo-100 group/tag">
                                                {val.value}
                                                <button
                                                    onClick={async () => {
                                                        if (confirm('Delete this value?')) {
                                                            await api.delete(`/attributes/values/${val.id}`);
                                                            fetchAttributes();
                                                        }
                                                    }}
                                                    className="opacity-0 group-hover/tag:opacity-100 hover:text-red-500 transition-all"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </span>
                                        ))}
                                        {attr.values.length === 0 && (
                                            <p className="text-xs text-gray-400 font-bold italic">No values defined yet</p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {attributes.length === 0 && (
                        <div className="col-span-full py-20 flex flex-col items-center justify-center bg-white rounded-[2.5rem] border-2 border-dashed border-gray-100">
                            <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mb-6">
                                <Tag className="text-gray-200" size={40} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">No Attributes Found</h3>
                            <p className="text-gray-400 mt-2">Start by adding your first attribute like "Size" or "Color"</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
