'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Package,
  Users,
  ShoppingCart,
  Settings,
  BarChart3,
  Folder,
  Shield,
  PlusCircle,
  ArrowLeft,
  Mail,
  ChevronDown,
  X
} from 'lucide-react';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: Home },
  {
    label: 'Products',
    icon: Package,
    children: [
      { href: '/admin/products', label: 'All Products' },
      { href: '/admin/products/create', label: 'Add Product' },
      { href: '/admin/categories', label: 'Categories' },
      { href: '/admin/products/variations', label: 'Attributes' },
    ]
  },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/messages', label: 'Messages', icon: Mail },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<string[]>(['Products']);

  const toggleMenu = (label: string) => {
    setOpenMenus(prev =>
      prev.includes(label)
        ? prev.filter(m => m !== label)
        : [...prev, label]
    );
  };

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-50 w-72 lg:static bg-white border-r border-gray-100 h-screen transition-all duration-300 transform 
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
    >
      <div className="p-8 h-full flex flex-col">
        {/* Professional Header */}
        <div className="flex items-center justify-between mb-12">
          <Link href="/admin/dashboard" className="font-plus-jakarta-sans font-extrabold text-2xl tracking-tighter">
            Admin<span className="text-emerald-500">.</span>
          </Link>
          <button onClick={onClose} className="lg:hidden p-2 text-gray-400 hover:text-black transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation Menus */}
        <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar pr-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const hasChildren = 'children' in item;
            const isOpenMenu = openMenus.includes(item.label);
            const isActive = !hasChildren && (pathname === item.href || pathname?.startsWith(item.href + '/'));
            const isChildActive = hasChildren && item.children?.some(child => pathname === child.href || pathname?.startsWith(child.href + '/'));

            if (hasChildren) {
              return (
                <div key={item.label} className="space-y-1">
                  <button
                    onClick={() => toggleMenu(item.label)}
                    className={`w-full flex items-center justify-between px-5 py-3.5 text-sm font-semibold rounded-2xl transition-all duration-300 group ${isChildActive || isOpenMenu
                      ? 'text-black bg-gray-50/50'
                      : 'text-gray-500 hover:text-black hover:bg-gray-50'
                      }`}
                  >
                    <div className="flex items-center">
                      <Icon className={`w-5 h-5 mr-4 transition-colors ${isChildActive || isOpenMenu ? 'text-emerald-600' : 'text-gray-400 group-hover:text-emerald-600'}`} />
                      <span className="tracking-wide text-[13px]">{item.label}</span>
                    </div>
                    <ChevronDown size={14} className={`transition-transform duration-500 text-gray-400 ${isOpenMenu ? 'rotate-180 text-emerald-600' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isOpenMenu && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden ml-4 pl-4 border-l border-gray-100"
                      >
                        {item.children?.map((child) => {
                          const isSubActive = pathname === child.href || pathname?.startsWith(child.href + '/');
                          return (
                            <Link
                              key={child.href}
                              href={child.href}
                              onClick={onClose}
                              className={`flex items-center px-4 py-2.5 text-[12px] font-semibold transition-all duration-300 rounded-xl mt-1 ${isSubActive
                                ? 'text-emerald-700 bg-emerald-50 shadow-sm'
                                : 'text-gray-500 hover:text-black hover:bg-gray-50'
                                }`}
                            >
                              {child.label}
                            </Link>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            }

            return (
              <Link key={item.href} href={item.href} onClick={onClose}>
                <motion.div
                  whileHover={{ x: 5 }}
                  className={`flex items-center px-5 py-3.5 rounded-2xl transition-all duration-300 ${isActive
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100'
                    : 'text-gray-500 hover:text-black hover:bg-gray-50'
                    }`}
                >
                  <Icon className="w-5 h-5 mr-4" />
                  <span className="font-semibold text-sm tracking-wide">{item.label}</span>
                  {isActive && (
                    <div className="ml-auto w-1 h-1 bg-white rounded-full" />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Storefront */}
        <div className="pt-8 mt-auto border-t border-gray-100">
          <Link
            href="/"
            className="group flex items-center px-5 py-4 text-sm font-semibold text-gray-500 hover:text-emerald-600 transition-all duration-300"
          >
            <ArrowLeft className="w-5 h-5 mr-4 group-hover:-translate-x-1 transition-transform" />
            Back to Store
          </Link>
        </div>
      </div>
    </aside>
  );
}
