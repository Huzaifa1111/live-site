'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Bell,
    Shield,
    Moon,
    Globe,
    Smartphone,
    Mail,
    Eye,
    ChevronRight,
    LogOut,
    Lock
} from 'lucide-react';
import { useAuth } from '@/lib/auth';

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0 }
};

interface ToggleProps {
    label: string;
    description?: string;
    enabled: boolean;
    onChange: (val: boolean) => void;
    icon?: React.ElementType;
}

const Toggle = ({ label, description, enabled, onChange, icon: Icon }: ToggleProps) => (
    <div className="flex items-center justify-between py-6">
        <div className="flex items-center gap-6">
            {Icon && (
                <div className="w-12 h-12 rounded-[1rem] bg-gray-50 flex items-center justify-center text-emerald-500/40 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500 shadow-inner">
                    <Icon size={20} />
                </div>
            )}
            <div>
                <p className="font-bold text-black tracking-tight">{label}</p>
                {description && <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest mt-1">{description}</p>}
            </div>
        </div>
        <button
            onClick={() => onChange(!enabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-500 focus:outline-none focus:ring-4 focus:ring-emerald-50 ${enabled ? 'bg-emerald-600 shadow-lg shadow-emerald-200' : 'bg-gray-200'
                }`}
        >
            <span
                className={`${enabled ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-500 shadow-sm`}
            />
        </button>
    </div>
);

export default function SettingsPage() {
    const { logout } = useAuth();
    const [notifications, setNotifications] = useState({
        email: true,
        orders: true,
        promo: false,
        push: true
    });

    const [privacy, setPrivacy] = useState({
        publicProfile: false,
        shareActivity: true
    });

    const [appearance, setAppearance] = useState({
        darkMode: false,
    });

    return (
        <motion.div
            className="space-y-12 pb-20"
            variants={containerVariants}
            initial="hidden"
            animate="show"
        >
            {/* Hero Section */}
            <motion.div variants={itemVariants} className="relative overflow-hidden rounded-[3rem] bg-black p-10 md:p-16 text-white shadow-3xl group">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-600/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/30 transition-colors duration-1000"></div>

                <div className="relative z-10">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-600/20 backdrop-blur-md border border-emerald-500/30 text-[9px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-6">
                        System Configuration
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter leading-none">Console & <br className="hidden md:block" /> Preferences</h1>
                    <p className="text-gray-400 max-w-xl text-lg font-medium tracking-wide leading-relaxed">
                        Curate your digital experience, modulate notification protocols, and govern your security parameters.
                    </p>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Main Settings Panel */}
                <motion.div variants={itemVariants} className="lg:col-span-2 space-y-8">

                    {/* Notifications Card */}
                    <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 opacity-40 group-hover:opacity-60 transition-opacity duration-1000 pointer-events-none"></div>

                        <h2 className="text-2xl font-black text-black tracking-tighter mb-10 flex items-center">
                            <Bell className="mr-4 text-emerald-500/40" size={24} />
                            Communication Protocols
                        </h2>
                        <div className="space-y-2 divide-y divide-gray-50 relative z-10">
                            <Toggle
                                label="Logistics Alerts"
                                description="Real-time updates on your style acquisitions"
                                enabled={notifications.orders}
                                onChange={(v) => setNotifications(prev => ({ ...prev, orders: v }))}
                                icon={Smartphone}
                            />
                            <Toggle
                                label="Curated Chronicles"
                                description="Receive exclusive updates on new drops"
                                enabled={notifications.email}
                                onChange={(v) => setNotifications(prev => ({ ...prev, email: v }))}
                                icon={Mail}
                            />
                            <Toggle
                                label="Privileged Access"
                                description="Exclusive early access to seasonal boutique events"
                                enabled={notifications.promo}
                                onChange={(v) => setNotifications(prev => ({ ...prev, promo: v }))}
                                icon={Globe}
                            />
                        </div>
                    </div>

                    {/* Privacy & Security Card */}
                    <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 opacity-40 group-hover:opacity-60 transition-opacity duration-1000 pointer-events-none"></div>

                        <h2 className="text-2xl font-black text-black tracking-tighter mb-10 flex items-center">
                            <Shield className="mr-4 text-emerald-500/40" size={24} />
                            Governance & Cryptography
                        </h2>
                        <div className="space-y-2 divide-y divide-gray-50 relative z-10">
                            <Toggle
                                label="Public Visibility"
                                description="Allow community members to view your curated wishlist"
                                enabled={privacy.publicProfile}
                                onChange={(v) => setPrivacy(prev => ({ ...prev, publicProfile: v }))}
                                icon={Eye}
                            />
                            <div className="flex items-center justify-between py-6 cursor-pointer group/item">
                                <div className="flex items-center gap-6">
                                    <div className="w-12 h-12 rounded-[1rem] bg-gray-50 flex items-center justify-center text-emerald-500/40 group-hover/item:bg-black group-hover/item:text-white transition-all duration-500 shadow-inner">
                                        <Lock size={20} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-black tracking-tight">Access Key Rotation</p>
                                        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest mt-1">Re-calibrate your secure access code</p>
                                    </div>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 group-hover/item:bg-emerald-600 group-hover/item:text-white transition-all duration-500">
                                    <ChevronRight size={20} />
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>


                {/* Sidebar / Additional Settings */}
                <motion.div variants={itemVariants} className="space-y-8">
                    {/* Appearance */}
                    <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm">
                        <h2 className="text-2xl font-black text-black tracking-tighter mb-10 flex items-center">
                            <Moon className="mr-4 text-emerald-500/40" size={24} />
                            Aesthetic Mode
                        </h2>
                        <div className="space-y-2">
                            <Toggle
                                label="Noir Presentation"
                                description="Switch to high-contrast dark interface"
                                enabled={appearance.darkMode}
                                onChange={(v) => setAppearance(prev => ({ ...prev, darkMode: v }))}
                            />
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="bg-red-50/50 rounded-[3rem] p-10 border border-red-100 shadow-sm group">
                        <h2 className="text-2xl font-black text-red-700 tracking-tighter mb-4">Critical Actions</h2>
                        <p className="text-red-600/60 text-[10px] font-black uppercase tracking-widest mb-10 leading-relaxed">
                            Irreversible terminal termination and synchronization logout.
                        </p>
                        <button
                            onClick={logout}
                            className="w-full py-5 bg-white border border-red-200 text-red-600 font-black uppercase tracking-[0.2em] text-[10px] rounded-full shadow-sm hover:bg-red-600 hover:text-white hover:border-red-600 hover:shadow-2xl hover:shadow-red-200 transform hover:-translate-y-1 transition-all duration-500 flex items-center justify-center"
                        >
                            <LogOut size={16} className="mr-3" />
                            Terminate Session
                        </button>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}
