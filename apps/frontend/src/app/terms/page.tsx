'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import { Scale, ArrowLeft, ShieldCheck, Zap, Handshake, Globe, AlertCircle } from 'lucide-react';
import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } as any
};

export default function TermsOfServicePage() {
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
            <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-emerald-50 rounded-full blur-[100px] -translate-y-1/2 -translate-x-1/2 opacity-40 pointer-events-none"></div>

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
                <section className="relative h-[40vh] sm:h-[45vh] md:h-[35vh] min-h-[350px] rounded-[2rem] md:rounded-[2.5rem] overflow-hidden mb-12 md:mb-16 shadow-2xl bg-emerald-950">
                    <motion.div style={{ y }} className="absolute inset-0 z-0">
                        <Image
                            src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80"
                            alt="Terms Background"
                            fill
                            className="object-cover brightness-50 contrast-125 saturate-[0.8]"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-emerald-950/60"></div>
                    </motion.div>

                    <div className="absolute inset-0 z-10 flex items-center justify-center text-center px-6">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                        >
                            <span className="inline-block py-2 px-5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-black uppercase tracking-[0.3em] text-[10px] mb-8">
                                Our Terms
                            </span>
                            <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-widest leading-tight md:leading-none mb-6 md:mb-8 drop-shadow-2xl uppercase">
                                TERMS OF <br /><span className="text-emerald-400">SERVICE</span>
                            </h1>
                            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto font-medium leading-relaxed drop-shadow-md">
                                The rules and conditions for using our website and services.
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* Content Section */}
                <div className="max-w-4xl mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="bg-white p-8 md:p-16 rounded-[2.5rem] md:rounded-[3rem] shadow-[0_20px_60px_rgba(0,0,0,0.03)] border border-gray-100 relative overflow-hidden group"
                    >
                        <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-50 rounded-full blur-[80px] -ml-32 -mt-32 opacity-40 group-hover:opacity-60 transition-opacity"></div>

                        <div className="relative z-10 space-y-16">
                            <section className="space-y-6">
                                <div className="flex items-center space-x-4">
                                    <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                                        <Handshake size={20} />
                                    </div>
                                    <h2 className="text-2xl md:text-3xl font-black tracking-tighter text-gray-900 uppercase">1. Acceptance of Terms</h2>
                                </div>
                                <p className="text-gray-500 leading-relaxed font-medium text-base md:text-lg">
                                    By using our website and marketplace, you agree to follow these terms and conditions. If you do not agree with any part of these terms, please do not use our services.
                                </p>
                            </section>

                            <section className="space-y-6">
                                <div className="flex items-center space-x-4">
                                    <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                                        <Zap size={20} />
                                    </div>
                                    <h2 className="text-2xl md:text-3xl font-black tracking-tighter text-gray-900 uppercase">2. Use of Site</h2>
                                </div>
                                <p className="text-gray-500 leading-relaxed font-medium text-base md:text-lg italic">
                                    We grant you permission to use our website for personal shopping, as long as you follow these rules and policies.
                                </p>
                            </section>

                            <section className="space-y-6">
                                <div className="flex items-center space-x-4">
                                    <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                                        <Globe size={20} />
                                    </div>
                                    <h2 className="text-2xl md:text-3xl font-black tracking-tighter text-gray-900 uppercase">3. Rules of Conduct</h2>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
                                    {[
                                        { title: "Commercial", desc: "No unauthorized use of our website or services." },
                                        { title: "Intellectual", desc: "No copying or reverse engineering of our technology." },
                                        { title: "Proprietary", desc: "No removal of our logos, branding, or trademarks." },
                                    ].map((item, i) => (
                                        <div key={i} className="p-6 rounded-2xl bg-gray-50/50 border border-gray-100 hover:border-emerald-200 transition-all group/item">
                                            <h4 className="font-black text-[10px] uppercase tracking-[0.2em] text-emerald-600 mb-2">{item.title}</h4>
                                            <p className="text-[12px] text-gray-500 leading-relaxed font-medium">{item.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section className="space-y-6">
                                <div className="flex items-center space-x-4">
                                    <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                                        <ShieldCheck size={20} />
                                    </div>
                                    <h2 className="text-2xl md:text-3xl font-black tracking-tighter text-gray-900 uppercase">4. Your Account</h2>
                                </div>
                                <p className="text-gray-500 leading-relaxed font-medium text-base md:text-lg">
                                    You are responsible for keeping your account password safe. You are responsible for all activity that happens on your account. We reserve the right to close accounts if these terms are broken.
                                </p>
                            </section>

                            <section className="space-y-6">
                                <div className="flex items-center space-x-4">
                                    <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                                        <AlertCircle size={20} />
                                    </div>
                                    <h2 className="text-2xl md:text-3xl font-black tracking-tighter text-gray-900 uppercase">5. Changes to Terms</h2>
                                </div>
                                <p className="text-gray-500 leading-relaxed font-medium text-base md:text-lg">
                                    We may update these terms from time to time. If we make significant changes, we will notify you by posting a notice on our website or sending an email.
                                </p>
                            </section>

                            <div className="pt-16 border-t border-gray-100 text-center">
                                <p className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-400 mb-4">Last Updated</p>
                                <span className="text-emerald-600 font-bold uppercase tracking-widest text-xs">January 2026</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
