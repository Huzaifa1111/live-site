'use client';

import { useAuth } from "@/lib/auth";
import { useClickOutside } from "@/hooks/useClickOutside";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { useState, useEffect, useCallback } from 'react';
import { authService } from '@/services/auth.service';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/lib/WishlistContext';

import { categoryService } from '@/services/category.service';
import SearchBar from './SearchBar';

import {
  Search,
  User,
  Heart,
  ShoppingBag,
  Instagram,
  Facebook,
  ChevronDown,
  Menu,
  X,
  Crown,
  ArrowRight
} from 'lucide-react';

interface Category {
  id: number;
  name: string;
}

export default function Header() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const dropdownRef = useClickOutside<HTMLDivElement>(() => setIsAccountOpen(false));
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoryService.getCategories();
        setCategories(data);
      } catch (err) {
        console.error('Failed to fetch categories', err);
      }
    };
    fetchCategories();
  }, []);

  // Handle intersection/scroll logic
  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;

    // Always show at the top
    if (currentScrollY < 100) {
      setIsVisible(true);
      setLastScrollY(currentScrollY);
      return;
    }

    if (currentScrollY > lastScrollY) {
      // Scrolling down
      setIsVisible(false);
    } else {
      // Scrolling up
      setIsVisible(true);
    }

    setLastScrollY(currentScrollY);
  }, [lastScrollY]);

  // Handle mouse move to top
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (e.clientY < 50) {
      setIsVisible(true);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [handleScroll, handleMouseMove]);

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  const { count } = useCart();
  const { items: wishlistItems } = useWishlist();

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About Us' },
    { href: '/contact', label: 'Contact Us' },
    ...(isAuthenticated ? [{ href: '/dashboard', label: 'Dashboard' }] : []),
  ];

  return (
    <>
      {/* 1. Top Bar - Static (Scrolls Away) */}
      <div className="bg-white border-b border-gray-100 py-2 hidden md:block relative z-[60]">
        <div className="max-w-[1440px] mx-auto px-6 flex justify-between items-center text-[13px] font-medium text-gray-600">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Instagram size={14} />
              <span>100k Followers</span>
            </div>
            <div className="flex items-center space-x-2">
              <Facebook size={14} />
              <span>300k Followers</span>
            </div>
          </div>

          <div className="flex-1 text-center font-black uppercase tracking-[0.2em] text-[11px]">
            <span>Next-Gen Tech Marketplace | </span>
            <Link href="/products" className="underline underline-offset-4 hover:text-black transition-colors">Shop Now</Link>
          </div>
        </div>
      </div>

      {/* 2. Main Navbar - Smart Sticky */}
      <header
        style={{ top: lastScrollY === 0 ? '37px' : '0' }}
        className={`fixed left-0 right-0 z-50 bg-white transition-all duration-500 ease-in-out ${isVisible ? 'translate-y-0' : '-translate-y-full'
          } ${lastScrollY > 0 ? 'shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)]' : ''
          } ${
          /* On mobile, lastScrollY is handled same but Top bar is hidden */
          'md:block'
          }`}
      >
        <div className="max-w-[1440px] mx-auto px-6 h-20 flex justify-between items-center">
          {/* Left: Nav Links & Categories Dropdown */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Link href="/" className="text-[15px] font-semibold text-black hover:text-gray-600 transition-colors uppercase tracking-tight">Home</Link>

            {/* Professional Category Dropdown */}
            <div className="relative group/mega">
              <button className="flex items-center space-x-1.5 text-[15px] font-bold text-black uppercase tracking-tight group-hover:text-emerald-600 transition-colors py-8">
                <span>Shop by Category</span>
                <ChevronDown size={14} className="group-hover/mega:rotate-180 transition-transform duration-300" />
              </button>

              <div className="absolute top-[100%] left-0 w-[800px] bg-white border border-gray-100 shadow-2xl rounded-2xl p-8 opacity-0 invisible group-hover/mega:opacity-100 group-hover/mega:visible transition-all duration-300 transform origin-top-left -translate-y-2 group-hover/mega:translate-y-0 grid grid-cols-3 gap-x-8 gap-y-2 z-[100]">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/products?category=${cat.id}`}
                    className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-200 group-hover:bg-emerald-600 transition-colors" />
                    <span className="text-[14px] font-medium text-gray-600 group-hover:text-black transition-colors">{cat.name}</span>
                  </Link>
                ))}
                <div className="col-span-3 mt-4 pt-4 border-t border-gray-100">
                  <Link href="/products" className="flex items-center text-emerald-600 font-black uppercase tracking-[0.2em] text-[11px] hover:translate-x-2 transition-transform">
                    View All Products <ArrowRight size={14} className="ml-2" />
                  </Link>
                </div>
              </div>
            </div>

            <Link href="/about" className="text-[15px] font-semibold text-black hover:text-gray-600 transition-colors uppercase tracking-tight">About</Link>
            <Link href="/contact" className="text-[15px] font-semibold text-black hover:text-gray-600 transition-colors uppercase tracking-tight">Contact</Link>
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-black hover:bg-gray-50 rounded-full transition-colors"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Center: Logo */}
          <div className="absolute left-1/2 -translate-x-1/2">
            <Link href="/" className="text-3xl font-bold tracking-tighter text-black hover:scale-105 transition-transform duration-300 flex items-center group">
              <span className="bg-white border-2 border-black text-black px-2 py-0.5 rounded mr-1 group-hover:bg-emerald-50 transition-colors">E</span>
              <span>Store</span>
              <span className="text-emerald-600 animate-pulse">.</span>
            </Link>
          </div>

          {/* Right: Icons & Auth */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2 md:space-x-5 text-black">
              {/* Account / Auth - Optimized for 1-click access */}
              {isAuthenticated ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsAccountOpen(!isAccountOpen)}
                    className="p-1.5 px-3 hover:bg-gray-100 rounded-full transition-all flex items-center relative group space-x-2"
                  >
                    {user?.role === 'admin' ? (
                      <div className="relative">
                        <User size={20} className="text-purple-600" />
                        <Crown size={12} className="absolute -top-1.5 -right-1.5 text-yellow-500 fill-yellow-500 animate-bounce" />
                      </div>
                    ) : (
                      <User size={20} className="text-emerald-600" />
                    )}

                    <span className="hidden sm:inline-block text-[13px] font-bold text-black uppercase tracking-wider">
                      {user?.name?.split(' ')[0]}
                    </span>

                    <ChevronDown size={12} className={`transition-transform duration-200 text-gray-400 ${isAccountOpen ? "rotate-180" : ""}`} />
                  </button>

                  {isAccountOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-xl py-2 z-[100] animate-in fade-in zoom-in duration-200 origin-top-right">
                      <div className="px-4 py-3 border-b border-gray-50 flex flex-col">
                        <span className="text-sm font-bold truncate">{user?.name}</span>
                        <span className="text-xs text-gray-400 truncate">{user?.email}</span>
                        {user?.role === 'admin' && (
                          <span className="mt-1 text-[10px] uppercase font-black bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded w-fit">Admin</span>
                        )}
                      </div>
                      <Link href="/dashboard" className="block px-4 py-2.5 text-sm font-medium hover:bg-gray-50 hover:text-emerald-600 transition-colors">Dashboard</Link>
                      {user?.role === 'admin' && (
                        <Link href="/admin" className="block px-4 py-2.5 text-sm font-medium text-purple-700 hover:bg-purple-50 transition-colors">Admin Panel</Link>
                      )}
                      <Link href="/dashboard" className="block px-4 py-2.5 text-sm font-medium hover:bg-gray-50 hover:text-emerald-600 transition-colors border-b border-gray-50">Profile Settings</Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-1 sm:space-x-4">
                  <Link
                    href="/auth/login"
                    className="text-[13px] font-bold uppercase tracking-widest text-black hover:text-emerald-600 transition-colors px-2 py-1"
                  >
                    Login
                  </Link>
                  <span className="text-gray-200 hidden sm:inline">|</span>
                  <Link
                    href="/auth/register"
                    className="hidden sm:block text-[13px] font-bold uppercase tracking-widest text-black hover:text-emerald-600 transition-colors px-2 py-1"
                  >
                    Register
                  </Link>
                </div>
              )}

              <SearchBar />

              <Link href="/wishlist" className="p-2 hover:bg-gray-100 rounded-full transition-colors relative">
                <Heart size={22} className={wishlistItems.length > 0 ? "fill-red-500 text-red-500" : ""} />
                <span className="absolute top-0 right-0 bg-white border border-black text-black text-[10px] font-black w-4 h-4 flex items-center justify-center rounded-full leading-none">
                  {wishlistItems.length}
                </span>
              </Link>
              <Link href="/cart" className="p-2 hover:bg-gray-100 rounded-full transition-colors relative">
                <ShoppingBag size={22} />
                <span className="absolute top-0 right-0 bg-white border border-black text-black text-[10px] font-black w-4 h-4 flex items-center justify-center rounded-full leading-none">
                  {count > 99 ? '99+' : count}
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 top-20 bg-white z-[60] overflow-y-auto p-6 animate-in slide-in-from-left duration-300">
            <nav className="flex flex-col space-y-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-xl font-bold text-black border-b border-gray-50 pb-4"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {user?.role === 'admin' && (
                <Link
                  href="/admin"
                  className="text-xl font-bold text-purple-700"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Admin Panel
                </Link>
              )}
              <div className="pt-6 flex flex-col space-y-4">
                {isAuthenticated ? (
                  <>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="font-bold">{user?.name}</p>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                    </div>
                    <Button variant="secondary" onClick={handleLogout} className="w-full py-4 rounded-xl">
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full py-4 rounded-xl">Login</Button>
                    </Link>
                    <Link href="/auth/register" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button className="w-full py-4 rounded-xl">Register</Button>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
