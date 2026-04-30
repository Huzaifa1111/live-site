'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, CreditCard, Gift, Send, Sparkles, Star, ArrowRight, Zap } from 'lucide-react';

const cardTiers: Record<number, {
    name: string;
    gradient: string;
    text: string;
    discount: string;
    shadow: string;
    accent: string;
    description: string;
}> = {
    50: {
        name: 'SILVER',
        gradient: 'from-[#E2E8F0] via-[#F8FAFC] to-[#CBD5E1]',
        text: 'text-slate-800',
        discount: '2% Store Credit Bonus',
        shadow: 'shadow-slate-200/50',
        accent: 'bg-slate-400',
        description: 'Perfect for thoughtful gestures and small appreciations.'
    },
    100: {
        name: 'GOLD',
        gradient: 'from-[#FDE68A] via-[#FBBF24] to-[#B45309]',
        text: 'text-amber-950',
        discount: '5% Store Credit Bonus',
        shadow: 'shadow-amber-200/50',
        accent: 'bg-amber-500',
        description: 'The standard of excellence for curated gift giving.'
    },
    200: {
        name: 'PLATINUM',
        gradient: 'from-[#94A3B8] via-[#E2E8F0] to-[#475569]',
        text: 'text-slate-900',
        discount: '10% Store Credit Bonus',
        shadow: 'shadow-blue-200/50',
        accent: 'bg-indigo-400',
        description: 'Elevated prestige for those who appreciate the finer details.'
    },
    500: {
        name: 'DIAMOND',
        gradient: 'from-[#1E293B] via-[#0F172A] to-[#000000]',
        text: 'text-white',
        discount: '15% Store Credit Bonus + VIP',
        shadow: 'shadow-emerald-500/20',
        accent: 'bg-emerald-500',
        description: 'The pinnacle of luxury. Includes lifetime VIP benefits.'
    }
};

const cardValues = Object.keys(cardTiers).map(Number).sort((a, b) => a - b);

export default function GiftCardsPage() {
    const [selectedValue, setSelectedValue] = useState(100);
    const [formState, setFormState] = useState({
        recipientName: '',
        recipientEmail: '',
        message: ''
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormState({ ...formState, [e.target.name]: e.target.value });
    };

    const currentTier = cardTiers[selectedValue];

    return (
        <div className="min-h-screen bg-[#FDFDFD] font-jost text-gray-900 selection:bg-emerald-100 relative overflow-hidden pb-24">
            {/* Masterpiece Background Elements */}
            <div className="fixed top-0 right-0 w-[1000px] h-[1000px] bg-emerald-50/50 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2 -z-0 pointer-events-none" />
            <div className="fixed bottom-0 left-0 w-[800px] h-[800px] bg-blue-50/50 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2 -z-0 pointer-events-none" />

            {/* Hero Section */}
            <section className="relative pt-24 pb-12 md:pt-32 md:pb-20 overflow-hidden">
                <div className="container mx-auto px-6 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="flex items-center justify-center gap-2 mb-4 text-emerald-600">
                            <Star size={12} className="fill-current animate-pulse" />
                            <span className="text-[9px] font-bold uppercase tracking-[0.4em]">The Perfect Gift</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-6 leading-[1.1] text-gray-900">
                            Digital <span className="text-emerald-600">Gift Cards.</span>
                        </h1>
                        <p className="text-lg text-gray-500 max-w-xl mx-auto font-medium leading-relaxed">
                            Give the gift of choice with our digital gift cards. Instant delivery to any email address.
                        </p>
                    </motion.div>
                </div>
            </section>

            <div className="container mx-auto px-6 relative z-20">
                <div className="grid lg:grid-cols-12 gap-10 items-start">

                    {/* Left Column: Visual Card Preview - Spans 7 cols */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1 }}
                        className="lg:col-span-7 sticky top-32"
                    >
                        <div className="relative group">
                            {/* Card Glow Effect */}
                            <motion.div
                                animate={{
                                    opacity: [0.3, 0.5, 0.3],
                                    scale: [1, 1.02, 1]
                                }}
                                transition={{ duration: 4, repeat: Infinity }}
                                className={`absolute inset-0 blur-[60px] opacity-30 rounded-3xl -z-10 transition-colors duration-700 bg-gradient-to-br ${currentTier.gradient}`}
                            />

                            <motion.div
                                layout
                                className={`relative aspect-[1.586/1] w-full max-w-sm mx-auto rounded-2xl overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.1)] border border-white/20 transition-all duration-700`}
                            >
                                {/* Metallic Gradient Layers */}
                                <motion.div
                                    className={`absolute inset-0 bg-gradient-to-br ${currentTier.gradient} transition-all duration-1000 z-0`}
                                />

                                {/* Realistic Texture / Grain */}
                                <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>

                                {/* Dynamic Interactive Shine */}
                                <motion.div
                                    animate={{
                                        x: ['-100%', '200%'],
                                        opacity: [0, 0.5, 0]
                                    }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12 z-0"
                                />

                                {/* Glassmorphism Card Overlay */}
                                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/10 to-transparent pointer-events-none"></div>

                                {/* Content Container */}
                                <div className={`relative z-10 p-6 h-full flex flex-col justify-between ${currentTier.text} transition-colors duration-700`}>
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-0.5">
                                            <div className="text-[8px] font-black tracking-[0.3em] opacity-80 uppercase">Estore Digital</div>
                                            <h3 className="text-base font-black tracking-tighter leading-none">GIFT CARD</h3>
                                        </div>
                                        <div className="w-10 h-7 bg-white/10 backdrop-blur-md rounded-lg flex items-center justify-center border border-white/20 shadow-inner">
                                            <Zap size={14} className="opacity-80" />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-end justify-between">
                                            <div>
                                                <p className="text-[8px] font-bold uppercase tracking-[0.4em] mb-2 opacity-50">Card Value</p>
                                                <AnimatePresence mode="wait">
                                                    <motion.div
                                                        key={selectedValue}
                                                        initial={{ opacity: 0, x: -15 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: 15 }}
                                                        className="text-4xl font-black tracking-tight leading-none"
                                                    >
                                                        ${selectedValue}
                                                    </motion.div>
                                                </AnimatePresence>
                                            </div>
                                            <div className="text-right">
                                                <div className="w-8 h-8 rounded-full border-2 border-current/20 flex items-center justify-center">
                                                    <Gift size={14} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center pt-3 border-t border-current/10">
                                            <div className="font-mono text-[8px] tracking-[0.2em] opacity-40 uppercase">
                                                E-Store Gift Card • {currentTier.name} TIER
                                            </div>
                                            <div className="flex -space-x-1">
                                                {[1, 2, 3, 4].map(i => (
                                                    <div key={i} className="w-2 h-2 rounded-full border border-current/20" />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Feature Grid Below Card */}
                        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
                            {[
                                { icon: <Send size={18} />, title: "Instant Delivery", desc: "Sent directly to the recipient's email." },
                                { icon: <Sparkles size={18} />, title: "No Expiration", desc: "This card never expires." },
                                { icon: <CreditCard size={18} />, title: "Safe & Secure", desc: "100% secure payment and delivery." },
                            ].map((item, i) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 + (i * 0.1) }}
                                    key={i}
                                    className="bg-white/40 backdrop-blur-md p-6 rounded-[1.5rem] border border-gray-100/50 shadow-sm group hover:bg-white transition-all duration-500"
                                >
                                    <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4 border border-emerald-100 group-hover:scale-110 transition-transform">
                                        {item.icon}
                                    </div>
                                    <h4 className="font-bold text-sm text-gray-900 mb-1.5">{item.title}</h4>
                                    <p className="text-[13px] text-gray-500 leading-relaxed font-medium">{item.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Right Column: Configuration Form - Spans 5 cols */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="lg:col-span-5 space-y-6"
                    >
                        <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-[0_30px_80px_rgba(0,0,0,0.03)] border border-gray-100 relative overflow-hidden">
                            <h2 className="text-2xl font-black mb-8 tracking-tight text-gray-900">Gift Details</h2>

                            {/* Value Grid */}
                            <div className="mb-10">
                                <label className="text-[9px] font-bold uppercase tracking-[0.4em] text-gray-400 mb-4 block leading-none">Select Amount</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {cardValues.map((value) => (
                                        <button
                                            key={value}
                                            onClick={() => setSelectedValue(value)}
                                            className={`relative py-4 rounded-xl border-2 transition-all duration-500 group overflow-hidden ${selectedValue === value
                                                ? 'border-emerald-600 bg-emerald-600 text-white scale-[1.02] shadow-lg shadow-emerald-500/10'
                                                : 'border-gray-50 bg-gray-50 text-gray-400 hover:border-emerald-200 hover:bg-white hover:text-gray-900'
                                                }`}
                                        >
                                            <span className="relative z-10 text-lg font-black tracking-tighter">${value}</span>
                                            {selectedValue === value && (
                                                <motion.div
                                                    layoutId="active-bg"
                                                    className="absolute inset-0 bg-emerald-600 -z-1"
                                                />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Tier Info Box */}
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={selectedValue}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="bg-emerald-50/50 rounded-2xl p-5 border border-emerald-100 mb-10 flex items-start gap-4"
                                >
                                    <div className={`w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center text-white shadow-md ${currentTier.accent}`}>
                                        <Sparkles size={16} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700 mb-0.5">{currentTier.name} DETAILS</p>
                                        <p className="text-sm font-bold text-gray-700 mb-0.5">{currentTier.discount}</p>
                                        <p className="text-[11px] text-emerald-600/60 font-medium leading-tight">{currentTier.description}</p>
                                    </div>
                                </motion.div>
                            </AnimatePresence>

                            {/* Form Fields */}
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <div className="relative group">
                                        <input
                                            type="text"
                                            name="recipientName"
                                            placeholder="Recipient's Name"
                                            className="w-full bg-[#FAFAFA] border border-gray-100 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 rounded-xl px-6 py-4 outline-none transition-all font-bold text-sm text-gray-900 placeholder:text-gray-300"
                                            value={formState.recipientName}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <div className="relative group">
                                        <input
                                            type="email"
                                            name="recipientEmail"
                                            placeholder="Recipient's Email"
                                            className="w-full bg-[#FAFAFA] border border-gray-100 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 rounded-xl px-6 py-4 outline-none transition-all font-bold text-sm text-gray-900 placeholder:text-gray-300"
                                            value={formState.recipientEmail}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <div className="relative group">
                                        <textarea
                                            name="message"
                                            rows={3}
                                            placeholder="Write a message..."
                                            className="w-full bg-[#FAFAFA] border border-gray-100 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 rounded-xl px-6 py-4 outline-none transition-all font-bold text-sm text-gray-900 placeholder:text-gray-300 resize-none min-h-[100px]"
                                            value={formState.message}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>

                                {/* Total & CTA */}
                                <div className="pt-8 border-t border-gray-50 space-y-5">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-gray-400 mb-0.5 block">Total Price</span>
                                            <span className="text-3xl font-black text-gray-900">${selectedValue}.00</span>
                                        </div>
                                        <div className="text-[9px] font-black uppercase text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full tracking-widest">Digital Ready</div>
                                    </div>

                                    <motion.button
                                        whileHover="hover"
                                        whileTap="tap"
                                        variants={{
                                            hover: { scale: 1.02 },
                                            tap: { scale: 0.98 }
                                        }}
                                        className="relative w-full py-4.5 bg-black text-white rounded-[1.2rem] font-bold uppercase tracking-[0.3em] text-[11px] shadow-xl shadow-black/5 hover:bg-emerald-900 transition-all overflow-hidden group"
                                    >
                                        <span className="relative z-10 flex items-center justify-center gap-3 py-1">
                                            <span>Buy Gift Card</span>
                                            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                        </span>
                                        <motion.div
                                            variants={{
                                                hover: { x: ["-100%", "200%"], transition: { repeat: Infinity, duration: 2, ease: "linear" } }
                                            }}
                                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent z-0 w-full h-full -translate-x-full"
                                        />
                                    </motion.button>
                                </div>
                            </div>
                        </div>

                        {/* Extra Assurance */}
                        <div className="px-8 flex items-center justify-between text-[9px] font-bold uppercase tracking-widest text-gray-400">
                            <div className="flex items-center gap-2">
                                <Check size={10} className="text-emerald-500" />
                                <span>Encrypted</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Check size={10} className="text-emerald-500" />
                                <span>Instant</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Check size={10} className="text-emerald-500" />
                                <span>No Expiry</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            <style jsx global>{`
                @keyframes float-slow {
                    0% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-15px) rotate(0.5deg); }
                    100% { transform: translateY(0px) rotate(0deg); }
                }
                .float-slow {
                    animation: float-slow 8s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}
