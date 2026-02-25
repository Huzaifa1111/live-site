'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { usersService, UpdateUserDto } from '@/services/users.service';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Lock, Save, Loader2, Camera, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

export default function ProfilePage() {
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const router = useRouter();

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/auth/login');
        }

        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '', // Assuming phone might be available on user object even if not in Interface strictly
            }));
        }
    }, [user, isAuthenticated, authLoading, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        setIsLoading(true);
        setMessage(null);

        const formData = new FormData();
        formData.append('image', file);

        try {
            const token = localStorage.getItem('token');
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const response = await fetch(`${API_URL}/uploads/image`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) throw new Error('Upload failed');

            const data = await response.json();
            const imageUrl = data.url;

            await usersService.updateProfile(user.id, { picture: imageUrl });
            setMessage({ type: 'success', text: 'Profile picture updated!' });
            // Ideally call some refreshUser() here or window.location.reload()
            setTimeout(() => window.location.reload(), 1000);
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Failed to upload image' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setMessage(null);
        setIsLoading(true);

        try {
            if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
                throw new Error('New passwords do not match');
            }

            const updateData: UpdateUserDto = {
                name: formData.name,
                phone: formData.phone,
                ...(formData.newPassword ? { password: formData.newPassword } : {})
            };

            if (formData.email !== user.email) {
                updateData.email = formData.email;
            }

            await usersService.updateProfile(user.id, updateData);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (error: any) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || error.message || 'Failed to update profile'
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    if (!user) return null;

    return (
        <motion.div
            className="space-y-12 pb-20"
            variants={containerVariants}
            initial="hidden"
            animate="show"
        >
            {/* Header Section */}
            <motion.div variants={itemVariants} className="relative overflow-hidden rounded-[3rem] bg-black p-10 md:p-16 text-white shadow-3xl group">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-600/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/30 transition-colors duration-1000"></div>

                <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                    <div className="relative group/avatar">
                        <div className="w-40 h-40 rounded-full bg-emerald-600/20 p-1.5 backdrop-blur-xl border border-white/10 group-hover/avatar:scale-105 transition-transform duration-500">
                            <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden shadow-inner">
                                {user.picture ? (
                                    <img src={user.picture} alt={user.name} className="w-full h-full object-cover group-hover/avatar:scale-110 transition-transform duration-700" />
                                ) : (
                                    <span className="text-5xl font-black text-black tracking-tighter">{user.name?.charAt(0) || 'U'}</span>
                                )}
                            </div>
                        </div>
                        <input
                            type="file"
                            id="avatar-upload"
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageUpload}
                        />
                        <button
                            onClick={() => document.getElementById('avatar-upload')?.click()}
                            className="absolute bottom-1 right-1 p-3 bg-emerald-600 text-white rounded-full shadow-2xl hover:bg-emerald-500 hover:scale-110 active:scale-95 transition-all duration-300 border-4 border-black"
                        >
                            <Camera size={18} />
                        </button>
                    </div>

                    <div className="text-center md:text-left space-y-4">
                        <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-emerald-600/20 backdrop-blur-md border border-emerald-500/30 text-[9px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-2">
                            <Shield size={12} className="mr-2" /> {user.role?.toUpperCase() || 'CLIENT'} ACCESS
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-none">{user.name}</h1>
                        <p className="text-gray-400 font-medium tracking-wide flex items-center justify-center md:justify-start">
                            <Mail size={16} className="mr-3 text-emerald-500/50" />
                            {user.email}
                        </p>
                    </div>
                </div>
            </motion.div>

            <div className="flex justify-center">
                {/* Main Form */}
                <motion.div variants={itemVariants} className="w-full max-w-2xl">
                    <div className="bg-white rounded-[3rem] p-10 sm:p-12 border border-blue-50/50 shadow-sm relative overflow-hidden group">

                        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-50 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 opacity-40 group-hover:opacity-60 transition-opacity duration-1000 pointer-events-none"></div>

                        <div className="relative z-10">
                            <div className="mb-10">
                                <h2 className="text-3xl font-black text-black tracking-tighter">Client Identity</h2>
                                <p className="text-gray-400 text-xs font-medium mt-2">Update your personal identification details.</p>
                            </div>

                            {message && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`p-5 rounded-2xl mb-10 flex items-center font-bold text-[11px] uppercase tracking-widest ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}
                                >
                                    <div className={`w-2.5 h-2.5 rounded-full mr-4 ${message.type === 'success' ? 'bg-emerald-500 shadow-lg shadow-emerald-200' : 'bg-red-500 shadow-lg shadow-red-200 animate-pulse'}`}></div>
                                    {message.text}
                                </motion.div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="grid grid-cols-1 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Full Name</label>
                                        <div className="relative group/input">
                                            <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within/input:text-emerald-500 transition-colors" size={18} />
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                className="w-full pl-14 pr-6 py-4 rounded-2xl border border-gray-100 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 outline-none transition-all font-bold text-black bg-gray-50/50 focus:bg-white shadow-inner"
                                                placeholder="Identity Name"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Phone Number</label>
                                        <div className="relative group/input">
                                            <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within/input:text-emerald-500 transition-colors" size={18} />
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                className="w-full pl-14 pr-6 py-4 rounded-2xl border border-gray-100 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 outline-none transition-all font-bold text-black bg-gray-50/50 focus:bg-white shadow-inner"
                                                placeholder="+1 (555) 000-0000"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Email Terminal</label>
                                        <div className="relative opacity-60">
                                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                disabled
                                                className="w-full pl-14 pr-6 py-4 rounded-2xl border border-gray-100 bg-gray-100 text-gray-400 font-bold cursor-not-allowed shadow-inner"
                                                placeholder="Terminal ID"
                                            />
                                            <p className="text-[9px] text-gray-300 font-black uppercase tracking-widest mt-2 ml-1">Identity Terminal locked.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-10 border-t border-gray-50 mt-10">
                                    <div className="mb-8">
                                        <h3 className="text-xl font-black text-black tracking-tighter">Credential Rotation</h3>
                                        <p className="text-gray-400 text-[10px] font-medium mt-1 uppercase tracking-widest">Optional: Update your secure access code.</p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">New Secret</label>
                                            <div className="relative group/input">
                                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within/input:text-emerald-500 transition-colors" size={18} />
                                                <input
                                                    type="password"
                                                    name="newPassword"
                                                    value={formData.newPassword}
                                                    onChange={handleChange}
                                                    className="w-full pl-14 pr-6 py-4 rounded-2xl border border-gray-100 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 outline-none transition-all font-bold text-black bg-gray-50/50 focus:bg-white shadow-inner"
                                                    placeholder="••••••••"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Verify Secret</label>
                                            <div className="relative group/input">
                                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within/input:text-emerald-500 transition-colors" size={18} />
                                                <input
                                                    type="password"
                                                    name="confirmPassword"
                                                    value={formData.confirmPassword}
                                                    onChange={handleChange}
                                                    className="w-full pl-14 pr-6 py-4 rounded-2xl border border-gray-100 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 outline-none transition-all font-bold text-black bg-gray-50/50 focus:bg-white shadow-inner"
                                                    placeholder="••••••••"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-8">
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="flex items-center px-12 py-5 bg-black text-white rounded-full font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl hover:bg-emerald-600 hover:shadow-emerald-200 transform hover:-translate-y-1 transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed group/btn"
                                    >
                                        {isLoading ? (
                                            <><Loader2 className="animate-spin mr-3" size={16} /> Encrypting...</>
                                        ) : (
                                            <><Save className="mr-3 group-hover/btn:rotate-12 transition-transform" size={16} /> Synchronize Profile</>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}
