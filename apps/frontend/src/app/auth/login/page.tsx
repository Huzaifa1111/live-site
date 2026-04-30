'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Lock, LogIn, Chrome } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { login, user } = useAuth();
    const searchParams = useSearchParams();

    // Check for verification success message and initialize email
    useEffect(() => {
        const verified = searchParams.get('verified');
        if (verified === 'true') {
            setSuccess('Email verified successfully. You can now log in.');
        }

        const emailParam = searchParams.get('email');
        if (emailParam) {
            setEmail(emailParam);
        } else {
            const rememberedEmail = localStorage.getItem('rememberedEmail');
            if (rememberedEmail) {
                setEmail(rememberedEmail);
            }
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);

        try {
            if (!email || !password) {
                throw new Error('Please enter your email and password.');
            }

            if (!/\S+@\S+\.\S+/.test(email)) {
                throw new Error('Please enter a valid email address.');
            }

            await login(email, password);
            localStorage.setItem('rememberedEmail', email);
        } catch (err: any) {
            if (err.message.includes('verify your email')) {
                setError('Verification required. Please check your email inbox.');
            } else {
                setError(err.message || 'Login failed. Please check your details.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            if (user.role === 'admin') {
                router.push('/admin');
            } else {
                router.push('/dashboard');
            }
        }
    }, [user, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#050505] font-plus-jakarta-sans relative overflow-hidden">
            {/* Emerald Aurora Background */}
            <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-emerald-600/10 rounded-full blur-[140px] animate-pulse pointer-events-none opacity-40"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-emerald-950/20 rounded-full blur-[120px] animate-pulse pointer-events-none opacity-30" style={{ animationDelay: '3s' }}></div>

            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(rgba(16,185,129,0.03)_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"></div>

            <div className="w-full flex items-center justify-center p-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="max-w-md w-full"
                >
                    {/* Brand Header */}
                    <div className="text-center mb-12">
                        <Link href="/" className="group inline-flex items-center space-x-2 mb-8">
                            <span className="w-10 h-10 bg-white text-black rounded-xl flex items-center justify-center font-black text-xl shadow-2xl group-hover:scale-110 transition-transform duration-500">E</span>
                            <span className="text-2xl font-black text-white tracking-widest uppercase shadow-sm">ESTORE</span>
                        </Link>
                    </div>

                    {/* Auth Card */}
                    <div className="bg-white/5 backdrop-blur-3xl border border-white/5 p-8 md:p-12 rounded-[2.5rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.5)] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[40px] -mr-16 -mt-16 group-hover:opacity-100 opacity-50 transition-opacity duration-700"></div>

                        <div className="relative z-10">
                            <div className="mb-10 text-center">
                                <h2 className="text-3xl font-black text-white tracking-tighter mb-2 uppercase italic">Login</h2>
                                <p className="text-gray-500 font-medium text-xs tracking-[0.2em] uppercase">Welcome back to the store</p>
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

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] ml-2">Email Address</label>
                                        <div className="relative group">
                                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-500 transition-colors" size={16} />
                                            <input
                                                type="email"
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full pl-12 pr-6 py-4 bg-white/[0.03] border border-white/5 rounded-2xl outline-none focus:bg-white/[0.07] focus:border-emerald-500/30 transition-all duration-500 text-white font-medium text-sm placeholder-gray-600"
                                                placeholder="curator@collective.com"
                                                disabled={isLoading}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center ml-2">
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Password</label>
                                            <Link href="/auth/verify-email" className="text-[9px] font-black text-emerald-500 uppercase tracking-widest hover:text-emerald-400 transition-colors">Forgot Password?</Link>
                                        </div>
                                        <div className="relative group">
                                            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-500 transition-colors" size={16} />
                                            <input
                                                type="password"
                                                required
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
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
                                    className="w-full bg-white text-black py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.5em] hover:bg-emerald-50 active:scale-[0.98] transition-all duration-500 flex items-center justify-center space-x-4 disabled:opacity-50 group/btn shadow-[0_20px_40px_-10px_rgba(255,255,255,0.1)]"
                                >
                                    {isLoading ? (
                                        <div className="flex items-center space-x-3">
                                            <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                                            <span>LOGGING IN...</span>
                                        </div>
                                    ) : (
                                        <>
                                            <span>LOGIN</span>
                                            <LogIn size={14} className="group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </form>

                            <div className="mt-10 pt-10 border-t border-white/5 space-y-6">
                                <p className="text-[9px] font-black text-gray-600 text-center uppercase tracking-[0.4em]">Or login with</p>

                                <button
                                    type="button"
                                    onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/google`}
                                    className="w-full bg-white/[0.03] border border-white/5 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-white/[0.07] hover:border-white/10 transition-all duration-500 flex items-center justify-center space-x-4 group"
                                >
                                    <Chrome size={16} className="text-gray-400 group-hover:text-white transition-colors" />
                                    <span>Google Login</span>
                                </button>

                                <div className="text-center">
                                    <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">New user? </span>
                                    <Link href="/auth/register" className="text-[10px] font-black text-white hover:text-emerald-500 uppercase tracking-widest underline underline-offset-8 decoration-emerald-500/30 transition-all">Create an Account</Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Meta Info */}
                    <div className="mt-12 text-center opacity-40">
                        <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.5em]">Secure Login System</p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
