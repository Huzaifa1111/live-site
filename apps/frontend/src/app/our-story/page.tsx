'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import { Quote, Linkedin, Twitter, Mail, ArrowLeft } from 'lucide-react';
import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as any }
};

const staggerContainer = {
    initial: {},
    whileInView: {
        transition: {
            staggerChildren: 0.15
        }
    }
};

export default function OurStoryPage() {
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
            <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-emerald-50 rounded-full blur-[120px] -translate-y-1/2 -translate-x-1/2 opacity-40 pointer-events-none"></div>

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
                <section className="relative h-[45vh] min-h-[400px] rounded-[2.5rem] overflow-hidden mb-20 shadow-2xl bg-emerald-950">
                    <motion.div style={{ y }} className="absolute inset-0 z-0">
                        <Image
                            src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80"
                            alt="The Journey"
                            fill
                            className="object-cover brightness-50 contrast-125"
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
                                Established 2024
                            </span>
                            <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-widest leading-tight md:leading-none mb-6 md:mb-8 drop-shadow-2xl translate-y-2">
                                OUR <span className="text-emerald-400">ORIGIN</span>
                            </h1>
                            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto font-medium leading-relaxed drop-shadow-md">
                                Two founders, one mission: To bring together great technology and beautiful craftsmanship.
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* The Origin Narrative */}
                <section className="mb-20">
                    <div className="max-w-4xl mx-auto text-center space-y-12">
                        <motion.div {...fadeInUp} className="space-y-4">
                            <span className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.5em] block">The Beginning</span>
                            <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-gray-900 leading-none">
                                Focus on Quality <br />
                                <span className="text-emerald-800 opacity-60">In a world of noise.</span>
                            </h2>
                        </motion.div>

                        <motion.p
                            {...fadeInUp}
                            transition={{ delay: 0.2 }}
                            className="text-gray-600 text-base md:text-lg leading-relaxed font-medium"
                        >
                            In an era of generic mass-production, we envisioned a sanctuary for thoughtful shopping. What began as a series of late-night planning meetings has blossomed into a global community of makers and customers. We keep it simple and focus on what matters, ensuring that using our site is easy and enjoyable.
                        </motion.p>

                        <motion.div
                            initial={{ scaleX: 0 }}
                            whileInView={{ scaleX: 1 }}
                            transition={{ duration: 1, ease: "circOut" }}
                            className="w-24 h-1.5 bg-emerald-600 mx-auto rounded-full"
                        ></motion.div>
                    </div>
                </section>

                {/* The Visionaries Section */}
                <section className="mb-20 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[120%] bg-emerald-50/50 -z-10 blur-3xl rounded-[10rem]"></div>

                    <motion.div
                        variants={fadeInUp}
                        initial="initial"
                        whileInView="whileInView"
                        className="text-center mb-16 space-y-4"
                    >
                        <span className="text-emerald-600 font-black uppercase tracking-[0.5em] text-[11px]">The Founders</span>
                        <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-gray-900 leading-[1.1] md:leading-none uppercase">MEET THE <br />FOUNDERS</h2>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-8 lg:gap-12 max-w-3xl mx-auto">
                        {/* Wasik */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] as any }}
                            className="group relative"
                        >
                            <div className="bg-white rounded-[2rem] p-4 shadow-[0_15px_60px_rgba(0,0,0,0.02)] border border-white/50 hover:shadow-[0_40px_80px_rgba(16,185,129,0.06)] transition-all duration-700 hover:-translate-y-2 text-center">
                                <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] mb-6 shadow-lg">
                                    <Image
                                        src="/images/hero/wasik.jpeg"
                                        alt="Wasik Rehman"
                                        fill
                                        className="object-cover transition-transform duration-[2000ms] group-hover:scale-110"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <h3 className="text-2xl lg:text-3xl font-black text-gray-900 tracking-tighter leading-none">Wasik Rehman</h3>
                                        <span className="inline-block py-1 px-4 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-[0.2em]">
                                            Operations Lead
                                        </span>
                                    </div>
                                    <p className="text-gray-500 leading-relaxed font-medium italic max-w-[180px] mx-auto text-[10px]">
                                        "We're not just building a platform; we're crafting a legacy where quality meets innovation."
                                    </p>
                                    <div className="flex justify-center space-x-5 pt-4 border-t border-gray-100">
                                        {[Linkedin, Twitter, Mail].map((Icon, i) => (
                                            <button key={i} className="text-gray-300 hover:text-emerald-600 transform hover:scale-110 transition-all duration-300">
                                                <Icon size={16} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Huzaifa */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] as any }}
                            className="group relative"
                        >
                            <div className="bg-white rounded-[2rem] p-4 shadow-[0_15px_60px_rgba(0,0,0,0.02)] border border-white/50 hover:shadow-[0_40px_80px_rgba(16,185,129,0.06)] transition-all duration-700 hover:-translate-y-2 text-center">
                                <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] mb-6 shadow-lg">
                                    <Image
                                        src="/images/hero/huzaifa.jpeg"
                                        alt="Muhammad Huzaifa"
                                        fill
                                        className="object-cover transition-transform duration-[2000ms] group-hover:scale-110"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <h3 className="text-2xl lg:text-3xl font-black text-gray-900 tracking-tighter leading-none">M. Huzaifa</h3>
                                        <span className="inline-block py-1 px-4 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-[0.2em]">
                                            Technology Lead
                                        </span>
                                    </div>
                                    <p className="text-gray-500 leading-relaxed font-medium italic max-w-[180px] mx-auto text-[10px]">
                                        "Technology should be invisible—a silent engine powering a magic-infused experience."
                                    </p>
                                    <div className="flex justify-center space-x-5 pt-4 border-t border-gray-100">
                                        {[Linkedin, Twitter, Mail].map((Icon, i) => (
                                            <button key={i} className="text-gray-300 hover:text-emerald-600 transform hover:scale-110 transition-all duration-300">
                                                <Icon size={16} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* The Philosophical Quote Section */}
                <motion.section
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-12 relative py-16 md:py-32 rounded-[2.5rem] md:rounded-[4rem] overflow-hidden bg-emerald-950 text-white text-center shadow-3xl"
                >
                    <div className="absolute inset-0 z-0 opacity-10">
                        <Image
                            src="https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&q=80"
                            alt="Abstract texture"
                            fill
                            className="object-cover"
                        />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-950 via-gray-950 to-emerald-950 z-0 opacity-90"></div>

                    <div className="relative z-10 max-w-4xl mx-auto px-6 space-y-10">
                        <Quote size={48} className="text-emerald-400 mx-auto opacity-40 animate-pulse" />
                        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black tracking-tight leading-tight mb-8 text-white uppercase px-4">
                            "KHUWAR  PA LONDON K AAM KHUWAR EE"
                        </h2>
                        <div className="flex items-center justify-center space-x-6 opacity-30">
                            <span className="h-[2px] w-16 bg-emerald-400"></span>
                            <span className="uppercase tracking-[0.6em] text-[10px] font-black">The Founders</span>
                            <span className="h-[2px] w-16 bg-emerald-400"></span>
                        </div>
                    </div>
                </motion.section>
            </div>
        </div>
    );
}
