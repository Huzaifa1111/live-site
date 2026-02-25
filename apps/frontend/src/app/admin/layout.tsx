'use client';

import { ReactNode, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import AdminSidebar from '@/components/layout/AdminSidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Menu } from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/auth/login');
      } else if (user.role !== 'admin') {
        router.push('/dashboard');
      }
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full"
        />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between px-8 py-6 bg-white border-b border-gray-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center shadow-lg">
            <Shield className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="font-plus-jakarta-sans font-black tracking-tight text-lg uppercase cursor-default">
            Admin<span className="text-emerald-500">.</span>
          </span>
        </div>
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-3 bg-gray-50 rounded-xl hover:bg-emerald-50 text-gray-400 hover:text-emerald-600 transition-all border border-gray-100"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      <div className="flex">
        {/* Sidebar Navigation */}
        <AnimatePresence>
          {(isSidebarOpen || (typeof window !== 'undefined' && window.innerWidth >= 1024)) && (
            <AdminSidebar
              isOpen={isSidebarOpen}
              onClose={() => setIsSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Global Sidebar Overlay */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[45] lg:hidden"
            />
          )}
        </AnimatePresence>

        {/* Workspace Operations */}
        <main className="flex-1 min-h-screen min-w-0 bg-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8 lg:py-16">
            <div className="mb-8 hidden lg:block">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600/60 bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-100">
                Administrative Session Active
              </span>
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}