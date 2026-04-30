'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Globe, Users, Zap, Award, Sparkles, Target } from 'lucide-react';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } as any
};

const staggerContainer = {
  initial: {},
  whileInView: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white font-plus-jakarta-sans overflow-x-hidden selection:bg-emerald-100 selection:text-emerald-900">
      {/* Hero Section - Cinematic Aurora */}
      <section className="relative h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden bg-black">
        {/* Animated Aurora Background */}
        <div className="absolute inset-0 z-0">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-emerald-500/20 rounded-full blur-[120px]"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-emerald-600/10 rounded-full blur-[100px]"
          />
          <div className="absolute inset-0 bg-[url('https://transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-white"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-black uppercase tracking-[0.4em] text-[10px] mb-8">
              Our Story
            </span>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-6 leading-[0.9]">
              LEADING THE <br className="hidden md:block" /> <span className="text-transparent bg-clip-text bg-gradient-to-b from-emerald-400 to-emerald-600">FUTURE OF</span> <br /> SHOPPING.
            </h1>
            <p className="text-sm md:text-base text-gray-400 max-w-xl mx-auto font-medium leading-relaxed tracking-wide">
              We create premium shopping experiences with a total focus on quality, style, and our customers.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section - Elevated Grid */}
      <section className="py-24 md:py-40 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <motion.div
              {...fadeInUp}
              className="relative group"
            >
              <div className="absolute -inset-4 bg-emerald-50 rounded-[4rem] scale-95 group-hover:scale-100 transition-transform duration-700 -z-10 opacity-50"></div>
              <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80"
                  alt="Our Office"
                  fill
                  className="object-cover contrast-110 saturate-[0.8] transition-transform duration-1000 group-hover:scale-110"
                />
              </div>
              {/* Floating Stat Card */}
              <div className="absolute -bottom-10 -right-10 bg-black text-white p-8 rounded-[2rem] shadow-2xl hidden md:block border border-white/10 backdrop-blur-3xl bg-black/80">
                <p className="text-[9px] font-black uppercase tracking-[0.3em] mb-3 text-emerald-400">Established</p>
                <div className="text-4xl font-black tracking-tighter">2024</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="text-emerald-600 font-black uppercase tracking-[0.4em] text-[10px] mb-8 block">Our Philosophy</span>
              <h2 className="text-4xl md:text-6xl font-black tracking-tight text-black mb-10 leading-[0.95]">
                DRIVEN BY <span className="text-gray-300">QUALITY.</span> <br /> GUIDED BY VISION.
              </h2>
              <div className="space-y-8 text-gray-500 text-lg font-medium leading-relaxed">
                <p className="border-l-4 border-emerald-500 pl-8">
                  Our journey is a blend of style and technology. We believe that shopping online should go beyond a simple transaction and become a unique experience.
                </p>
                <p>
                  Today, we bridge the gap between high-end quality and fast delivery. We connect a global community of makers with those who seek nothing less than the best.
                </p>
              </div>

              <div className="mt-16 grid grid-cols-2 gap-12">
                <div className="border-t border-gray-100 pt-8">
                  <h3 className="text-4xl font-black text-black mb-3">24/7</h3>
                  <p className="text-gray-400 text-[9px] font-black uppercase tracking-[0.25em]">Available Worldwide</p>
                </div>
                <div className="border-t border-gray-100 pt-8">
                  <h3 className="text-4xl font-black text-black mb-3">100%</h3>
                  <p className="text-gray-400 text-[9px] font-black uppercase tracking-[0.25em]">Customer Satisfaction</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Values - Luxury Cards */}
      <section className="py-24 bg-[#050505] relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-emerald-500/5 blur-[150px] rounded-full"></div>
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            {...fadeInUp}
            className="text-center mb-24"
          >
            <span className="text-emerald-500 font-black uppercase tracking-[0.4em] text-[9px] mb-5 block">Our DNA</span>
            <h2 className="text-4xl md:text-6xl font-black tracking-tight text-white">THE PRINCIPLES</h2>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              { icon: <Zap size={16} />, title: "Speed", desc: "Fast delivery to your doorstep." },
              { icon: <Award size={16} />, title: "Quality", desc: "Highest standards of honesty and performance." },
              { icon: <Sparkles size={16} />, title: "Design", desc: "Every product chosen for the best look and feel." },
              { icon: <Target size={16} />, title: "Service", desc: "Always here to help our customers." },
            ].map((item, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 p-8 rounded-2xl hover:bg-emerald-600/10 hover:border-emerald-500/50 transition-all duration-700 group"
              >
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 mb-6 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-black transition-all duration-500 shadow-xl shadow-emerald-500/5">
                  {item.icon}
                </div>
                <h3 className="text-base font-black text-white mb-3 uppercase tracking-tight">{item.title}</h3>
                <p className="text-gray-400 font-medium leading-relaxed text-[11px]">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section - Cinematic Footer */}
      <motion.section
        {...fadeInUp}
        className="py-24 bg-white relative"
      >
        <div className="max-w-4xl mx-auto px-6 text-center">
          <span className="text-emerald-600 font-black uppercase tracking-[0.4em] text-[10px] mb-6 block">Get Started</span>
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-10 text-black leading-[0.85]">
            JOIN OUR <br /> <span className="text-gray-200">COMMUNITY.</span>
          </h2>
          <p className="text-gray-400 text-sm md:text-base mb-12 font-medium leading-relaxed max-w-2xl mx-auto tracking-tight">
            Join thousands of happy customers and discover our latest products today.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/products"
              className="group relative inline-flex items-center px-8 py-4 bg-black text-white rounded-xl font-black uppercase tracking-[0.3em] text-[9px] overflow-hidden transition-all duration-500 hover:scale-105 shadow-2xl shadow-emerald-900/10"
            >
              <span className="relative z-10 flex items-center">
                View Products <ArrowRight className="ml-3 group-hover:translate-x-2 transition-transform" size={12} />
              </span>
              <div className="absolute inset-0 bg-emerald-600 -translate-x-full group-hover:translate-x-0 transition-transform duration-700 ease-[0.16, 1, 0.3, 1]"></div>
            </Link>

            <Link
              href="/contact"
              className="group relative inline-flex items-center px-8 py-4 bg-white border-2 border-black text-black rounded-xl font-black uppercase tracking-[0.3em] text-[9px] overflow-hidden transition-all duration-500 hover:scale-105"
            >
              <span className="relative z-10">
                Contact Us
              </span>
            </Link>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
