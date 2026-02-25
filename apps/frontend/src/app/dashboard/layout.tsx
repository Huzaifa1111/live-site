'use client';

import { ReactNode, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  ShoppingBag,
  User as UserIcon,
  Settings,
  Shield,
  LogOut,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, isLoading, logout: authLogout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full"
        />
      </div>
    );
  }

  if (!user) return null;

  const handleLogout = () => {
    authLogout();
    router.push('/auth/login');
  };

  const menuItems = [
    { name: 'Overview', href: '/dashboard', icon: Home },
    { name: 'My Orders', href: '/dashboard/orders', icon: ShoppingBag },
    { name: 'Profile', href: '/dashboard/profile', icon: UserIcon },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 italic">
        <span className="font-plus-jakarta-sans font-bold text-xl">
          EStore<span className="text-emerald-500">.</span>
        </span>
        <button onClick={() => setIsSidebarOpen(true)} className="p-2">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <AnimatePresence>
          {(isSidebarOpen || (typeof window !== 'undefined' && window.innerWidth >= 1024)) && (
            <motion.aside
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              className={`fixed inset-y-0 left-0 z-50 w-72 lg:static bg-white border-r border-gray-100 h-screen transition-all duration-300 transform lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
              <div className="p-8 h-full flex flex-col">
                <div className="flex items-center justify-between mb-12">
                  <Link href="/" className="font-plus-jakarta-sans font-extrabold text-2xl tracking-tighter">
                    EStore<span className="text-emerald-500">.</span>
                  </Link>
                  <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <nav className="flex-1 space-y-2">
                  {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link key={item.name} href={item.href}>
                        <motion.div
                          whileHover={{ x: 5 }}
                          className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 ${isActive
                            ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200'
                            : 'text-gray-500 hover:text-black hover:bg-gray-50'
                            }`}
                        >
                          <item.icon className="w-5 h-5" />
                          <span className="font-semibold text-sm tracking-wide">{item.name}</span>
                          {isActive && (
                            <motion.div layoutId="activeDot" className="ml-auto">
                              <ChevronRight className="w-4 h-4 opacity-70" />
                            </motion.div>
                          )}
                        </motion.div>
                      </Link>
                    );
                  })}

                  {/* Admin Section */}
                  {user.role === 'admin' && (
                    <div className="pt-8 border-t border-gray-100 mt-8">
                      <p className="px-5 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">Management</p>
                      <Link href="/admin">
                        <motion.div
                          whileHover={{ x: 5 }}
                          className="flex items-center gap-4 px-5 py-4 rounded-2xl text-purple-600 bg-purple-50 hover:bg-purple-100 transition-all font-semibold text-sm tracking-wide"
                        >
                          <Shield className="w-5 h-5" />
                          <span>Admin Panel</span>
                        </motion.div>
                      </Link>
                    </div>
                  )}
                </nav>

                <div className="pt-8 mt-auto">
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-4 px-5 py-4 rounded-2xl text-red-500 hover:bg-red-50 transition-all font-semibold text-sm tracking-wide"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Global Sidebar Overlay */}
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          />
        )}

        {/* Main Content */}
        <main className="flex-1 min-h-screen max-w-full overflow-x-hidden pt-8 lg:pt-12">
          <div className="max-w-6xl mx-auto px-6 lg:px-12 pb-20">
            <div className="mb-10">
              <Breadcrumbs />
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
