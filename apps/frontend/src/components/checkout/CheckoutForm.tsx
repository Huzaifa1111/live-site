// apps/frontend/src/components/checkout/CheckoutForm.tsx
'use client';

import { useState, useEffect } from 'react';
import {
    PaymentElement,
    useStripe,
    useElements,
} from '@stripe/react-stripe-js';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { addressesService, Address as SavedAddress } from '@/services/addresses.service';
import { Home, Briefcase, MapPin, Loader2, Check, CreditCard, Banknote, Landmark, ShieldCheck, ArrowRight, Package } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/lib/auth';
import { useCart } from '@/hooks/useCart';
import { resolveProductImage } from '@/lib/image';
import { motion, AnimatePresence } from 'framer-motion';

export default function CheckoutForm({ clientSecret }: { clientSecret: string }) {
    const stripe = useStripe();
    const elements = useElements();
    const router = useRouter();
    const { items, total } = useCart();

    const [email, setEmail] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [zipCode, setZipCode] = useState('');
    const [country, setCountry] = useState('Pakistan');
    const [paymentMethod, setPaymentMethod] = useState('stripe');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<number | 'new'>('new');
    const [isFetchingAddresses, setIsFetchingAddresses] = useState(false);
    const { user } = useAuth();

    // Dynamic settings from backend
    const [shippingFee, setShippingFee] = useState(0);
    const [taxRate, setTaxRate] = useState(0);
    const [settingsLoaded, setSettingsLoaded] = useState(false);

    useEffect(() => {
        if (user?.email) {
            setEmail(user.email);
        }
    }, [user]);

    const tax = parseFloat((total * (taxRate / 100)).toFixed(2));
    const grandTotal = parseFloat((total + shippingFee + tax).toFixed(2));

    useEffect(() => {
        // Fetch public settings (tax rate + shipping fee)
        const fetchSettings = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/admin/settings/public`);
                if (res.ok) {
                    const data = await res.json();
                    setShippingFee(Number(data.shippingFee) || 0);
                    setTaxRate(Number(data.taxRate) || 0);
                }
            } catch (err) {
                console.error('Failed to fetch settings:', err);
            } finally {
                setSettingsLoaded(true);
            }
        };

        const fetchAddresses = async () => {
            setIsFetchingAddresses(true);
            try {
                const data = await addressesService.getAll();
                setSavedAddresses(data);
                const defaultAddr = data.find(a => a.isDefault);
                if (defaultAddr) {
                    setSelectedAddressId(defaultAddr.id);
                    setAddress(defaultAddr.street);
                    setCity(defaultAddr.city);
                }
            } catch (error) {
                console.error('Failed to fetch addresses:', error);
            } finally {
                setIsFetchingAddresses(false);
            }
        };

        fetchSettings();
        fetchAddresses();
    }, []);

    const handleAddressSelect = (id: number | 'new') => {
        setSelectedAddressId(id);
        if (id === 'new') {
            setAddress('');
            setCity('');
            setState('');
            setZipCode('');
            setCountry('Pakistan');
        } else {
            const addr = savedAddresses.find(a => a.id === id);
            if (addr) {
                setAddress(addr.street);
                setCity(addr.city);
                setState(addr.state || '');
                setZipCode(addr.zipCode);
                setCountry(addr.country);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsLoading(true);
        setErrorMessage(null);

        const shippingAddress = `${address}, ${city}, ${state}, ${zipCode}, ${country}`;
        localStorage.setItem('shippingAddress', shippingAddress);

        if (paymentMethod === 'stripe') {
            const { error } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: `${window.location.origin}/checkout/success`,
                },
            });

            if (error) {
                setErrorMessage(error.message || 'An error occurred');
                setIsLoading(false);
            }
        } else {
            // COD or Bank Transfer Flow
            try {
                const token = localStorage.getItem('token');
                const response = await axios.post(
                    'http://localhost:3001/orders',
                    {
                        shippingAddress,
                        paymentMethod: paymentMethod,
                    },
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                router.push(`/checkout/success?payment_intent=cod_success&orderNumber=${response.data.orderNumber}`);
            } catch (err: any) {
                setErrorMessage(err.response?.data?.message || 'Failed to place order');
                setIsLoading(false);
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* LEFT COLUMN: Shipping & Payment */}
            <div className="lg:col-span-7 space-y-8">

                {/* Shipping Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-gray-100 shadow-sm"
                >
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                            <MapPin size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Shipping Details</h2>
                            <p className="text-gray-500 text-sm">Where should we create magic?</p>
                        </div>
                    </div>

                    {isFetchingAddresses ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="animate-spin text-emerald-600" />
                        </div>
                    ) : savedAddresses.length > 0 ? (
                        <div className="mb-8">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Saved Addresses</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {savedAddresses.map((addr) => (
                                    <button
                                        key={addr.id}
                                        type="button"
                                        onClick={() => handleAddressSelect(addr.id)}
                                        className={`relative p-4 rounded-xl border text-left transition-all duration-300 group ${selectedAddressId === addr.id ? 'border-emerald-500 bg-emerald-50/50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
                                    >
                                        {selectedAddressId === addr.id && (
                                            <div className="absolute top-3 right-3 w-5 h-5 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-md">
                                                <Check size={12} strokeWidth={3} />
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2 mb-1">
                                            {addr.type === 'home' ? <Home size={14} className={selectedAddressId === addr.id ? 'text-emerald-600' : 'text-gray-400'} /> : <Briefcase size={14} className={selectedAddressId === addr.id ? 'text-emerald-600' : 'text-gray-400'} />}
                                            <span className={`text-[10px] font-bold uppercase tracking-widest ${selectedAddressId === addr.id ? 'text-emerald-700' : 'text-gray-500'}`}>{addr.type}</span>
                                        </div>
                                        <p className="text-sm font-semibold text-gray-900 truncate mb-0.5">{addr.street}</p>
                                        <p className="text-[11px] text-gray-500 font-medium">{addr.city}, {addr.zipCode}</p>
                                    </button>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => handleAddressSelect('new')}
                                    className={`p-4 rounded-xl border border-dashed flex flex-col items-center justify-center gap-2 transition-all ${selectedAddressId === 'new' ? 'border-emerald-500 bg-emerald-50/30 text-emerald-600' : 'border-gray-300 text-gray-400 hover:border-gray-400 hover:text-gray-600'}`}
                                >
                                    <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center">
                                        <MapPin size={16} />
                                    </div>
                                    <span className="text-[11px] font-bold">New Address</span>
                                </button>
                            </div>
                        </div>
                    ) : null}

                    <div className={`space-y-4 transition-all duration-300 ${savedAddresses.length > 0 && selectedAddressId !== 'new' ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Email Address</label>
                            <input
                                type="email"
                                required
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 font-medium focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-gray-400"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="your@email.com"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Street Address</label>
                            <input
                                type="text"
                                required
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 font-medium focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-gray-400"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="123 Luxury Blvd"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">City</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 font-medium focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-gray-400"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    placeholder="New York"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Zip / Postal Code</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 font-medium focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-gray-400"
                                    value={zipCode}
                                    onChange={(e) => setZipCode(e.target.value)}
                                    placeholder="10001"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">State / Province</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 font-medium focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-gray-400"
                                    value={state}
                                    onChange={(e) => setState(e.target.value)}
                                    placeholder="NY"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Country</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 font-medium focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-gray-400"
                                    value={country}
                                    onChange={(e) => setCountry(e.target.value)}
                                    placeholder="Pakistan"
                                />
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Payment Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                            <CreditCard size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Payment Method</h2>
                            <p className="text-gray-500 text-xs">Secure transaction.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                        <label className={`relative cursor-pointer p-4 rounded-xl border transition-all duration-300 ${paymentMethod === 'stripe' ? 'border-emerald-500 bg-emerald-50/20' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                            <input
                                type="radio"
                                name="paymentMethod"
                                value="stripe"
                                checked={paymentMethod === 'stripe'}
                                onChange={() => setPaymentMethod('stripe')}
                                className="sr-only"
                            />
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${paymentMethod === 'stripe' ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                    <CreditCard size={18} />
                                </div>
                                <div className="text-left">
                                    <h3 className={`text-sm font-bold ${paymentMethod === 'stripe' ? 'text-gray-900' : 'text-gray-500'}`}>Card Payment</h3>
                                    <p className="text-[10px] text-gray-400 font-medium">Powered by Stripe</p>
                                </div>
                            </div>
                        </label>

                        <label className={`relative cursor-pointer p-4 rounded-xl border transition-all duration-300 ${paymentMethod === 'cod' ? 'border-emerald-500 bg-emerald-50/20' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                            <input
                                type="radio"
                                name="paymentMethod"
                                value="cod"
                                checked={paymentMethod === 'cod'}
                                onChange={() => setPaymentMethod('cod')}
                                className="sr-only"
                            />
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${paymentMethod === 'cod' ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                    <Banknote size={18} />
                                </div>
                                <div className="text-left">
                                    <h3 className={`text-sm font-bold ${paymentMethod === 'cod' ? 'text-gray-900' : 'text-gray-500'}`}>Cash on Delivery</h3>
                                    <p className="text-[10px] text-gray-400 font-medium">Pay upon receipt</p>
                                </div>
                            </div>
                        </label>

                        <label className={`relative cursor-pointer p-4 rounded-xl border transition-all duration-300 ${paymentMethod === 'bank_transfer' ? 'border-emerald-500 bg-emerald-50/20' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                            <input
                                type="radio"
                                name="paymentMethod"
                                value="bank_transfer"
                                checked={paymentMethod === 'bank_transfer'}
                                onChange={() => setPaymentMethod('bank_transfer')}
                                className="sr-only"
                            />
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${paymentMethod === 'bank_transfer' ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                    <Landmark size={18} />
                                </div>
                                <div className="text-left">
                                    <h3 className={`text-sm font-bold ${paymentMethod === 'bank_transfer' ? 'text-gray-900' : 'text-gray-500'}`}>Bank Transfer</h3>
                                    <p className="text-[10px] text-gray-400 font-medium">Direct deposit</p>
                                </div>
                            </div>
                        </label>
                    </div>

                    <AnimatePresence mode='wait'>
                        {paymentMethod === 'stripe' && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-gray-50 p-6 rounded-2xl border border-gray-100"
                            >
                                <PaymentElement />
                            </motion.div>
                        )}
                        {paymentMethod === 'bank_transfer' && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-emerald-50/30 p-6 rounded-2xl border border-emerald-100 text-center overflow-hidden"
                            >
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-sm border border-emerald-100 mb-4">
                                    <Landmark size={24} />
                                </div>
                                <h4 className="text-lg font-black text-gray-900 tracking-tight">Direct Bank Transfer</h4>
                                <p className="text-[11px] text-gray-500 mt-1 mb-6 max-w-sm mx-auto font-medium">Please transfer your total amount to the following bank account. Your order will not ship until the funds have cleared.</p>
                                
                                <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-100 shadow-sm inline-block text-left w-full sm:w-auto">
                                    <div className="space-y-3">
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-6 border-b border-gray-50 pb-3">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Account Name</span>
                                            <span className="text-sm font-bold text-gray-900">MUHAMMAD HUZAIFA</span>
                                        </div>
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-6 border-b border-gray-50 pb-3">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Account No.</span>
                                            <span className="text-sm font-black text-gray-900 tracking-wider">3006589137</span>
                                        </div>
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-6 pt-1">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">IBAN</span>
                                            <span className="text-xs sm:text-sm font-black text-emerald-600 tracking-widest break-all">PK72KHYB5074003006589137</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>

            {/* RIGHT COLUMN: Order Summary */}
            <div className="lg:col-span-5 relative">
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 sticky top-8"
                >
                    <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3">
                        <span className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                        Order Summary
                    </h2>

                    <div className="space-y-4 mb-8 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                        {items.map((item) => (
                            <div key={item.id} className="flex gap-4 items-center">
                                <div className="w-16 h-16 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 shrink-0 relative">
                                    <Image
                                        src={resolveProductImage(item.product?.images || item.product?.image || null) || 'https://placehold.co/600x600/000000/ffffff?text=No+Image'}
                                        alt={item.product?.name || 'Product'}
                                        fill
                                        sizes="64px"
                                        className="object-cover"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-bold text-gray-900 truncate">{item.product?.name}</h4>
                                    <p className="text-xs text-gray-400 mb-1">{(item.product as any)?.brand?.name || 'Collection'}</p>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-bold bg-gray-100 px-2 py-0.5 rounded text-gray-600">Qty: {item.quantity}</span>
                                        <span className="text-sm font-bold text-gray-900">${(Number(item.price) * item.quantity).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-dashed border-gray-200 py-6 space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500 font-medium">Subtotal</span>
                            <span className="font-bold text-gray-900">${total.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500 font-medium">Shipping</span>
                            {settingsLoaded ? (
                                <span className="font-bold text-gray-900">${shippingFee.toFixed(2)}</span>
                            ) : (
                                <span className="font-bold text-gray-400 animate-pulse">Loading...</span>
                            )}
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500 font-medium">Tax ({taxRate}%)</span>
                            {settingsLoaded ? (
                                <span className="font-bold text-gray-900">${tax.toFixed(2)}</span>
                            ) : (
                                <span className="font-bold text-gray-400 animate-pulse">Loading...</span>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-between items-end mb-8 pt-4 border-t border-gray-100">
                        <span className="text-lg font-bold text-gray-900">Total</span>
                        <div className="text-right">
                            <span className="block text-3xl font-black text-gray-900 leading-none">${grandTotal.toFixed(2)}</span>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">USD</span>
                        </div>
                    </div>

                    {errorMessage && (
                        <div className="bg-red-50 p-4 rounded-xl border border-red-100 mb-6 flex gap-3 text-red-600 text-sm font-medium">
                            <ShieldCheck size={20} className="shrink-0" />
                            <p>{errorMessage}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading || (!stripe && paymentMethod === 'stripe')}
                        className="group w-full py-4 px-6 bg-black text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-emerald-900 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-lg shadow-black/10 disabled:opacity-50 disabled:pointer-events-none"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="animate-spin" size={18} />
                                <span>Processing...</span>
                            </>
                        ) : (
                            <>
                                <span>Pay {paymentMethod === 'cod' ? 'Cash on Delivery' : paymentMethod === 'bank_transfer' ? 'via Bank Transfer' : 'Now'}</span>
                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>

                    <div className="mt-6 flex items-center justify-center gap-2 text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                        <ShieldCheck size={14} />
                        <span>Secure SSL Encryption</span>
                    </div>
                </motion.div>
            </div>
        </form>
    );
}
