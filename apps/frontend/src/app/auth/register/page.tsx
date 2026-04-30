'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Phone, UserPlus, ShieldCheck } from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { register } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
        throw new Error('Please fill in all required fields.');
      }

      if (!/\S+@\S+\.\S+/.test(formData.email)) {
        throw new Error('Please enter a valid email address.');
      }

      if (formData.password.length < 6) {
        throw new Error('Password must be at least 6 characters long.');
      }

      if (formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match.');
      }

      const result = await register(formData.name, formData.email, formData.password, formData.phone);

      if (result.requiresVerification) {
        setSuccess('Registration successful! Please check your email to verify your account.');
        localStorage.setItem('pendingVerificationEmail', formData.email);
        setTimeout(() => {
          router.push(`/auth/verify-email?email=${encodeURIComponent(formData.email)}`);
        }, 2000);
      } else {
        setSuccess('Account created successfully! Logging you in...');
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] font-plus-jakarta-sans relative overflow-hidden">
      {/* Emerald Aurora Background */}
      <div className="absolute top-[-20%] right-[-10%] w-[70%] h-[70%] bg-emerald-600/10 rounded-full blur-[140px] animate-pulse pointer-events-none opacity-40"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-emerald-950/20 rounded-full blur-[120px] animate-pulse pointer-events-none opacity-30" style={{ animationDelay: '3s' }}></div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(16,185,129,0.03)_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"></div>

      <div className="w-full flex items-center justify-center p-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-xl w-full"
        >
          {/* Brand Header */}
          <div className="text-center mb-10">
            <Link href="/" className="group inline-flex items-center space-x-2 mb-6">
              <span className="w-10 h-10 bg-white text-black rounded-xl flex items-center justify-center font-black text-xl shadow-2xl group-hover:scale-110 transition-transform duration-500">E</span>
              <span className="text-2xl font-black text-white tracking-widest uppercase">ESTORE</span>
            </Link>
          </div>

          {/* Registration Card */}
          <div className="bg-white/5 backdrop-blur-3xl border border-white/5 p-8 md:p-12 rounded-[2.5rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.5)] relative overflow-hidden group">
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[40px] -ml-16 -mb-16 group-hover:opacity-100 opacity-50 transition-opacity duration-700"></div>

            <div className="relative z-10">
              <div className="mb-10 text-center">
                <h2 className="text-3xl font-black text-white tracking-tighter mb-2 uppercase italic">CREATE AN ACCOUNT</h2>
                <p className="text-gray-500 font-medium text-xs tracking-[0.2em] uppercase">Join us to start shopping</p>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center space-x-3"
                  >
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                    <span>{error}</span>
                  </motion.div>
                )}

                {success && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center space-x-3"
                  >
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span>{success}</span>
                  </motion.div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] ml-2">Full Name</label>
                    <div className="relative group">
                      <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-500 transition-colors" size={16} />
                      <input
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full pl-12 pr-6 py-4 bg-white/[0.03] border border-white/5 rounded-2xl outline-none focus:bg-white/[0.07] focus:border-emerald-500/30 transition-all duration-500 text-white font-medium text-sm placeholder-gray-600"
                        placeholder="Artifact Curator"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] ml-2">Phone Number</label>
                    <div className="relative group">
                      <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-500 transition-colors" size={16} />
                      <input
                        name="phone"
                        type="text"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full pl-12 pr-6 py-4 bg-white/[0.03] border border-white/5 rounded-2xl outline-none focus:bg-white/[0.07] focus:border-emerald-500/30 transition-all duration-500 text-white font-medium text-sm placeholder-gray-600"
                        placeholder="+1 234 567 890"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] ml-2">Email Address</label>
                    <div className="relative group">
                      <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-500 transition-colors" size={16} />
                      <input
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full pl-12 pr-6 py-4 bg-white/[0.03] border border-white/5 rounded-2xl outline-none focus:bg-white/[0.07] focus:border-emerald-500/30 transition-all duration-500 text-white font-medium text-sm placeholder-gray-600"
                        placeholder="curator@collective.com"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] ml-2">Password</label>
                    <div className="relative group">
                      <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-500 transition-colors" size={16} />
                      <input
                        name="password"
                        type="password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full pl-12 pr-6 py-4 bg-white/[0.03] border border-white/5 rounded-2xl outline-none focus:bg-white/[0.07] focus:border-emerald-500/30 transition-all duration-500 text-white font-medium text-sm placeholder-gray-600"
                        placeholder="••••••••"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] ml-2">Confirm Password</label>
                    <div className="relative group">
                      <ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-500 transition-colors" size={16} />
                      <input
                        name="confirmPassword"
                        type="password"
                        required
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full pl-12 pr-6 py-4 bg-white/[0.03] border border-white/5 rounded-2xl outline-none focus:bg-white/[0.07] focus:border-emerald-500/30 transition-all duration-500 text-white font-medium text-sm placeholder-gray-600"
                        placeholder="••••••••"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-white text-black py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.5em] hover:bg-emerald-50 active:scale-[0.98] transition-all duration-500 flex items-center justify-center space-x-4 disabled:opacity-50 group/btn shadow-[0_20px_40px_-10px_rgba(255,255,255,0.1)] mt-8"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                      <span>CREATING ACCOUNT...</span>
                    </div>
                  ) : (
                    <>
                      <span>CREATE ACCOUNT</span>
                      <UserPlus size={14} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>

                <div className="mt-8 text-center">
                  <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Already have an account? </span>
                  <Link href="/auth/login" className="text-[10px] font-black text-white hover:text-emerald-500 uppercase tracking-widest underline underline-offset-8 decoration-emerald-500/30 transition-all">Login Here</Link>
                </div>
              </form>

              <div className="mt-12 pt-6 border-t border-white/5 text-[9px] text-gray-600 text-center uppercase tracking-[0.2em] leading-relaxed">
                By creating an account, you agree to our <br />
                <Link href="/terms" className="text-white hover:text-emerald-500 transition-colors">Terms of Service</Link> and <Link href="/privacy" className="text-white hover:text-emerald-500 transition-colors">Privacy Policy</Link>
              </div>
            </div>
          </div>

          {/* Meta Info */}
          <div className="mt-12 text-center opacity-40">
            <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.5em]">Secure Registration System</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
