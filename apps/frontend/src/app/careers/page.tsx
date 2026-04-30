'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import { ArrowRight, Globe, Zap, Heart, Monitor, Clock, Shield, ArrowLeft } from 'lucide-react';
import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } as any
};

export default function CareersPage() {
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
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-50 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 opacity-40 pointer-events-none"></div>

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
                            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80"
                            alt="Team Collaboration"
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
                                Join Our Team
                            </span>
                            <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-widest leading-tight md:leading-none mb-6 md:mb-8 drop-shadow-2xl uppercase">
                                BUILD THE <br /><span className="text-emerald-400">FUTURE</span>
                            </h1>
                            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto font-medium leading-relaxed drop-shadow-md">
                                We are looking for talented people to help build the next generation of online shopping.
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* Culture Section */}
                <section className="mb-16 md:mb-24 px-4 sm:px-6">
                    <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16 space-y-4">
                        <span className="text-emerald-600 font-black uppercase tracking-[0.5em] text-[11px]">Our Philosophy</span>
                        <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-gray-900 leading-[1.1] md:leading-none italic">
                            Beyond conventional <br />
                            <span className="text-emerald-800 opacity-60 not-italic">Work Culture.</span>
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                        {[
                            { icon: <Globe size={20} />, title: "Remote Work", desc: "Work from anywhere in the world. We value great results over being in an office." },
                            { icon: <Zap size={20} />, title: "Fast Paced", desc: "Small, autonomous teams. Your work will impact millions of users worldwide." },
                            { icon: <Heart size={20} />, title: "Health & Wellness", desc: "Comprehensive care for mind and body. We truly care about our people." }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                {...fadeInUp}
                                transition={{ delay: i * 0.1, ease: [0.16, 1, 0.3, 1] as any }}
                                className="bg-white p-7 rounded-[2rem] border border-gray-100 hover:border-emerald-200/50 hover:shadow-[0_30px_60px_-15px_rgba(16,185,129,0.1)] transition-all duration-500 group"
                            >
                                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500">
                                    {item.icon}
                                </div>
                                <h3 className="text-xl font-black mb-3 text-gray-900 tracking-tight">{item.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed font-medium">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Perks Grid */}
                <section className="py-16 md:py-24 px-6 md:px-8 rounded-[2rem] md:rounded-[3rem] bg-emerald-950 text-white relative overflow-hidden mb-16 md:mb-24 lg:mx-[-2rem]">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none"></div>

                    <div className="max-w-6xl mx-auto relative z-10">
                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            <motion.div {...fadeInUp}>
                                <h2 className="text-3xl md:text-6xl font-black tracking-tighter mb-8 leading-[1.1] md:leading-none uppercase">
                                    TOOLS FOR <br /><span className="text-emerald-400">SUCCESS</span>
                                </h2>
                                <p className="text-white/60 text-base md:text-lg mb-12 leading-relaxed max-w-md">
                                    We take care of the small things so you can focus on your best work. Every team member gets the best equipment.
                                </p>

                                <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                                    {[
                                        { icon: <Monitor size={15} />, text: "Latest MacBook Pro" },
                                        { icon: <Clock size={15} />, text: "Flexible Hours" },
                                        { icon: <Globe size={15} />, text: "Remote Work Fund" },
                                        { icon: <Shield size={15} />, text: "Premium Health Plans" },
                                    ].map((perk, i) => (
                                        <div key={i} className="flex items-center space-x-3">
                                            <div className="text-emerald-400 group-hover:animate-pulse">{perk.icon}</div>
                                            <span className="font-black text-[9px] uppercase tracking-widest text-white/80">{perk.text}</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] as any }}
                                className="relative max-w-md mx-auto lg:ml-auto"
                            >
                                <div className="aspect-square rounded-[1.5rem] md:rounded-[2rem] overflow-hidden border-[6px] md:border-[8px] border-white/5 shadow-3xl">
                                    <Image
                                        src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80"
                                        alt="Mastery Equipment"
                                        fill
                                        className="object-cover contrast-110 saturate-[0.8]"
                                    />
                                </div>
                                <div className="absolute -bottom-6 md:-bottom-8 -left-4 md:-left-8 bg-white text-gray-900 p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] shadow-2xl max-w-[200px] md:max-w-xs border border-gray-100">
                                    <div className="flex items-center space-x-4 mb-3">
                                        <div className="flex -space-x-3">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className={`w-8 h-8 rounded-full border-2 border-white bg-emerald-${100 + i * 100}`}></div>
                                            ))}
                                        </div>
                                        <span className="font-black text-[10px] uppercase tracking-wider italic">Join Us</span>
                                    </div>
                                    <p className="text-[10px] text-gray-500 font-medium leading-relaxed capitalize">A growing team of passionate innovators.</p>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="mb-24 text-center">
                    <motion.div {...fadeInUp} className="max-w-4xl mx-auto space-y-10">
                        <div className="space-y-4">
                            <span className="text-emerald-600 font-black uppercase tracking-[0.5em] text-[11px]">Apply Today</span>
                            <h2 className="text-3xl md:text-7xl font-black tracking-tighter text-gray-900 leading-[1.1] md:leading-none">
                                JOIN OUR <span className="text-emerald-800 opacity-60">GROWING TEAM</span>
                            </h2>
                        </div>
                        <p className="text-base md:text-lg text-gray-500 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
                            We are looking for people who want to help build the future of online shopping.
                        </p>

                        <a
                            href="/contact"
                            className="inline-flex items-center px-12 py-5 bg-emerald-950 text-white rounded-full font-black uppercase tracking-[0.4em] text-[10px] hover:bg-emerald-900 hover:scale-105 transition-all duration-500 shadow-2xl hover:shadow-emerald-900/40"
                        >
                            Apply Now <ArrowRight className="ml-4 group-hover:translate-x-1 transition-transform" size={16} />
                        </a>
                    </motion.div>
                </section>
            </div>
        </div>
    );
}
