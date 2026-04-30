'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Leaf, Recycle, Heart, Droplets, Sun, Wind, ArrowRight, ShieldCheck, Sparkles, Globe } from 'lucide-react';
import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
};

const staggerContainer = {
    initial: {},
    whileInView: {
        transition: {
            staggerChildren: 0.1
        }
    }
};

export default function SustainabilityPage() {
    const containerRef = useRef(null);
    const router = useRouter();
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

    return (
        <div className="min-h-screen bg-[#fafafa] font-plus-jakarta-sans text-gray-900 overflow-x-hidden relative" ref={containerRef}>
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-50 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 opacity-40 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-100/30 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4 opacity-30 pointer-events-none"></div>

            <div className="max-w-[1440px] mx-auto px-4 md:px-12 py-6 md:py-10 relative z-10">
                <Breadcrumbs />

                <button
                    onClick={() => router.back()}
                    className="group flex items-center text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 hover:text-emerald-600 mb-12 transition-all"
                >
                    <ArrowLeft size={14} className="mr-3 transition-transform group-hover:-translate-x-1" />
                    Back to Shop
                </button>

                {/* Parallax Hero Section */}
                <section className="relative h-[70vh] min-h-[500px] rounded-[3rem] overflow-hidden mb-24 shadow-2xl">
                    <motion.div style={{ y }} className="absolute inset-0 z-0">
                        <Image
                            src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80"
                            alt="Nature Background"
                            fill
                            className="object-cover brightness-[0.85]"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-emerald-900/40"></div>
                    </motion.div>

                    <div className="absolute inset-0 z-10 flex items-center justify-center text-center px-6">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                        >
                            <span className="inline-block py-2 px-5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-black uppercase tracking-[0.3em] text-[10px] mb-8">
                                Our Commitment
                            </span>
                            <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-widest leading-tight md:leading-none mb-6 md:mb-8 drop-shadow-2xl uppercase">
                                ECO <br /> <span className="text-emerald-400">LUXURY</span>
                            </h1>
                            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto font-medium leading-relaxed drop-shadow-md">
                                Setting higher standards for environmental care. Every purchase you make helps build a greener future.
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* Impact Stats */}
                <section className="mb-32">
                    <motion.div
                        variants={staggerContainer}
                        initial="initial"
                        whileInView="whileInView"
                        viewport={{ once: true }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-8"
                    >
                        {[
                            { label: "Carbon Neutral", value: "100%", desc: "Across Our Entire Team", icon: <Globe className="text-emerald-600" size={18} /> },
                            { label: "Eco-Packaging", value: "85%", desc: "Recycled Materials", icon: <Recycle className="text-emerald-600" size={18} /> },
                            { label: "Reforestation", value: "50k+", desc: "Trees Planted", icon: <Leaf className="text-emerald-600" size={18} /> },
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                variants={fadeInUp}
                                className="bg-white/70 backdrop-blur-xl p-8 rounded-[2rem] border border-white/50 shadow-[0_20px_50px_rgba(0,0,0,0.03)] hover:shadow-[0_40px_80px_rgba(0,0,0,0.06)] hover:-translate-y-2 transition-all duration-500 group text-center"
                            >
                                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mx-auto mb-6 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                                    {stat.icon}
                                </div>
                                <h3 className="text-5xl font-black text-gray-900 mb-2 tracking-tighter">{stat.value}</h3>
                                <p className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-600 mb-4">{stat.label}</p>
                                <p className="text-gray-500 font-medium text-sm">{stat.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </section>

                {/* Mission Split Section */}
                <section className="mb-32 relative">
                    <div className="grid lg:grid-cols-2 gap-20 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="space-y-8"
                        >
                            <div className="space-y-4">
                                <span className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.4em]">Our Philosophy</span>
                                <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-gray-900 leading-[0.9]">
                                    The Emerald <br /> Commitment.
                                </h2>
                            </div>
                            <div className="space-y-6 text-sm md:text-base text-gray-600 font-medium leading-relaxed max-w-xl">
                                <p>
                                    Modern shopping needs a change in perspective. We don't just sell products; we build a better world. Our "Emerald Commitment" ensures that every item in our collection is carefully checked for its environmental impact.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                                    <div className="flex gap-4">
                                        <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
                                            <ShieldCheck size={16} className="text-emerald-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-[10px] uppercase tracking-widest mb-1">Fair Work</h4>
                                            <p className="text-[10px] text-gray-500">Fair wages & safety.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
                                            <Sparkles size={16} className="text-emerald-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-[10px] uppercase tracking-widest mb-1">Safe Materials</h4>
                                            <p className="text-[10px] text-gray-500">Soft, chemical-free fabrics.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1 }}
                            className="relative"
                        >
                            <div className="aspect-square md:aspect-[4/5] rounded-[2.5rem] md:rounded-[4rem] overflow-hidden shadow-2xl border-[8px] md:border-[12px] border-white relative z-10">
                                <Image
                                    src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80"
                                    alt="Sustainable Materials"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-emerald-200/40 rounded-full blur-[80px] z-0 animate-pulse"></div>
                        </motion.div>
                    </div>
                </section>

                {/* Pillars Grid */}
                <section className="mb-32">
                    <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
                        <span className="text-emerald-600 font-black uppercase tracking-[0.5em] text-[11px]">The Pillars</span>
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900 leading-none">Designed for <span className="text-emerald-800">the Future</span></h2>
                        <div className="h-1 w-20 bg-emerald-600 mx-auto rounded-full"></div>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            { icon: <Leaf size={20} />, title: "Eco-Friendly Materials", desc: "Organic cotton, recycled polyester, and responsibly sourced wood." },
                            { icon: <Globe size={20} />, title: "Re-use & Recycle", desc: "Programs to help you repair, resell, or recycle anything you buy from us." },
                            { icon: <Wind size={20} />, title: "Green Energy", desc: "Our warehouses and offices are powered by 100% renewable solar and wind energy." },
                            { icon: <Droplets size={20} />, title: "Water Saving", desc: "Advanced dyeing processes that save huge amounts of water." },
                            { icon: <Heart size={20} />, title: "Support for Makers", desc: "Safe working conditions and fair pay for the people who make our products." },
                            { icon: <Sparkles size={20} />, title: "Full Transparency", desc: "Clear information on how we make our products and their total impact." },
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                viewport={{ once: true }}
                                className="bg-white p-8 rounded-[2rem] border border-gray-100/50 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full -mr-12 -mt-12 group-hover:bg-emerald-600 transition-colors duration-500 opacity-20"></div>
                                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-8 group-hover:bg-emerald-600 group-hover:text-white transition-all transform group-hover:rotate-[360deg] duration-700">
                                    {item.icon}
                                </div>
                                <h3 className="text-lg font-black text-gray-900 mb-3 tracking-tight">{item.title}</h3>
                                <p className="text-gray-500 leading-relaxed font-medium text-xs">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Final CTA Overlay Card */}
                <motion.section
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="relative rounded-[2.5rem] md:rounded-[4rem] overflow-hidden bg-emerald-900 text-white p-12 md:p-24 text-center shadow-3xl mb-12 group"
                >
                    <div className="absolute inset-0 z-0 opacity-40 group-hover:opacity-60 transition-opacity">
                        <Image
                            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80"
                            alt="Forest texture"
                            fill
                            className="object-cover"
                        />
                    </div>
                    <div className="absolute inset-0 bg-emerald-950/60 backdrop-blur-[2px] z-0"></div>

                    <div className="relative z-10 max-w-2xl mx-auto space-y-8">
                        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-emerald-400">Get Involved</span>
                        <h2 className="text-3xl md:text-6xl font-black tracking-tighter leading-tight md:leading-none uppercase px-4">
                            SHOP WITH <br /> CARE
                        </h2>
                        <p className="text-base md:text-lg text-emerald-100/80 font-medium max-w-lg mx-auto leading-relaxed">
                            Join thousands of customers who care about the planet. Every order you place helps support a better future.
                        </p>
                        <Link
                            href="/products"
                            className="inline-flex items-center px-10 py-6 bg-white text-emerald-900 rounded-2xl font-black uppercase tracking-[0.3em] text-[11px] hover:bg-emerald-400 hover:text-emerald-950 transition-all duration-300 shadow-xl active:scale-95"
                        >
                            Explore All Products <ArrowRight size={16} className="ml-4" />
                        </Link>
                    </div>
                </motion.section>

            </div>
        </div>
    );
}
