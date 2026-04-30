'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import ContactForm from '@/components/forms/ContactForm';
import { Card, CardContent } from '@/components/ui/Card';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Instagram,
  Facebook,
  Twitter,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  MessageSquare
} from 'lucide-react';
import api from '@/lib/api';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } as any
};

export default function ContactPage() {
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleSubmit = async (data: any) => {
    try {
      const response = await api.post('/contact', data);
      setFormSubmitted(true);
    } catch (error) {
      console.error('Contact form error:', error);
      alert('Failed to send message. Please try again later.');
    }
  };

  const contactInfos = [
    {
      icon: Phone,
      title: "Phone Number",
      detail: "+1 (555) 888-2024",
      subDetail: "Direct phone support",
      color: "text-emerald-400",
      bg: "bg-emerald-500/10"
    },
    {
      icon: Mail,
      title: "Email Address",
      detail: "concierge@estore.com",
      subDetail: "Quick email response",
      color: "text-emerald-400",
      bg: "bg-emerald-500/10"
    },
    {
      icon: MapPin,
      title: "Our Location",
      detail: "77 Emerald Plaza",
      subDetail: "Silicon Valley, CA",
      color: "text-emerald-400",
      bg: "bg-emerald-500/10"
    }
  ];

  return (
    <div className="min-h-screen bg-white font-plus-jakarta-sans relative overflow-x-hidden selection:bg-emerald-100 selection:text-emerald-900">
      {/* Cinematic Background Elements */}
      <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-emerald-500/5 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2 opacity-60 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-black/[0.02] rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2 opacity-60 pointer-events-none" />

      <div className="max-w-[1440px] mx-auto px-6 py-16 md:py-24 relative z-10">
        <div className="grid lg:grid-cols-12 gap-16 items-stretch">

          {/* Left Column: Boutique Content */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 font-black uppercase tracking-[0.4em] text-[8px] mb-8">
                Get in Touch
              </span>
              <h1 className="text-5xl md:text-6xl font-black text-black tracking-tighter leading-[0.85] mb-8">
                CONTACT <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-emerald-700">US.</span>
              </h1>
              <p className="text-base text-gray-500 font-medium leading-relaxed mb-12 max-w-sm tracking-tight">
                Our team is ready to help you with any questions. Send us a message using the form below.
              </p>

              <div className="grid grid-cols-1 gap-10">
                {contactInfos.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + idx * 0.1 }}
                    className="flex items-center group"
                  >
                    <div className={`w-11 h-11 rounded-lg ${item.bg} ${item.color} flex items-center justify-center shrink-0 transition-all duration-500 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white group-hover:shadow-2xl group-hover:shadow-emerald-500/20`}>
                      <item.icon size={18} strokeWidth={2} />
                    </div>
                    <div className="ml-5 border-l border-gray-100 pl-5">
                      <h4 className="text-[8px] font-black uppercase tracking-[0.3em] text-emerald-600 mb-0.5">{item.title}</h4>
                      <p className="text-base font-black text-black tracking-tight">{item.detail}</p>
                      <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{item.subDetail}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Social Guild */}
              <div className="pt-12 mt-16 border-t border-gray-100">
                <h4 className="text-[8px] font-black uppercase tracking-[0.3em] text-gray-400 mb-6 font-plus-jakarta-sans">Follow Us</h4>
                <div className="flex gap-3">
                  {[Instagram, Facebook, Twitter].map((Icon, i) => (
                    <a key={i} href="#" className="w-10 h-10 rounded-lg border border-gray-100 flex items-center justify-center text-black hover:bg-black hover:text-white hover:border-black transition-all duration-500 hover:-translate-y-1">
                      <Icon size={16} />
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column: High-Fidelity Form Card */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="h-full"
            >
              <Card className="h-full rounded-[2rem] border-none shadow-2xl bg-white border border-gray-50 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                <CardContent className="p-6 md:p-10 lg:p-12 relative z-10">
                  {formSubmitted ? (
                    <div className="text-center py-20 animate-in fade-in zoom-in duration-700">
                      <div className="w-20 h-20 bg-emerald-500/10 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-500/5">
                        <ShieldCheck size={32} strokeWidth={1.5} />
                      </div>
                      <h2 className="text-3xl font-black text-black tracking-tight mb-4">MESSAGE SENT.</h2>
                      <p className="text-sm text-gray-500 font-medium max-w-sm mx-auto mb-10 leading-relaxed tracking-tight">
                        Your inquiry has been successfully sent. Our team will get back to you shortly.
                      </p>
                      <button
                        onClick={() => setFormSubmitted(false)}
                        className="group relative inline-flex items-center gap-3 px-6 py-3.5 bg-black text-white rounded-lg font-black text-[8px] uppercase tracking-[0.3em] overflow-hidden transition-all duration-500 hover:scale-105"
                      >
                        <span className="relative z-10 flex items-center">
                          Send Another Message <ArrowRight size={14} className="ml-3 transition-transform group-hover:translate-x-1" />
                        </span>
                        <div className="absolute inset-0 bg-emerald-600 -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="mb-8">
                        <h2 className="text-2xl font-black text-black tracking-tighter mb-3 leading-none uppercase">Send a Message</h2>
                        <div className="flex items-center gap-2 text-emerald-600">
                          <Zap size={12} />
                          <p className="text-[8px] font-black uppercase tracking-[0.2em]">Secure Contact System</p>
                        </div>
                      </div>
                      <ContactForm onSubmit={handleSubmit} />
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Status Modules */}
              <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div
                  {...fadeInUp}
                  className="p-6 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col justify-between"
                >
                  <div className="flex items-center gap-3 text-emerald-600 mb-5">
                    <Clock size={16} strokeWidth={2.5} />
                    <span className="text-[8px] font-black uppercase tracking-[0.3em]">Business Hours</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-black text-black uppercase tracking-tight">Monday - Friday</span>
                      <span className="bg-white px-2 py-0.5 rounded-md text-[9px] font-bold border border-gray-100 italic">09:00 - 18:00</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-black text-black uppercase tracking-tight">Saturday - Sunday</span>
                      <span className="bg-white px-2 py-0.5 rounded-md text-[9px] font-bold border border-gray-100 italic">10:00 - 16:00</span>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  {...fadeInUp}
                  className="p-6 bg-black rounded-2xl text-white overflow-hidden relative group"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000"></div>
                  <div className="mb-4 opacity-40">
                    <MessageSquare size={20} />
                  </div>
                  <p className="text-lg font-black leading-none mb-2 uppercase tracking-tighter">Fast <br /> Response</p>
                  <p className="text-[8px] font-bold opacity-50 uppercase tracking-[0.2em]">Avg. response time {`<`} 120min</p>
                </motion.div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
}
