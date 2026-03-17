'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Menu, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { AuthModal } from '@/components/AuthModal';

export function Navbar() {
  const { items, setIsOpen } = useCartStore();
  const { user, isAuthenticated, isAdmin, logout } = useAuthStore();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-brand-primary/20 bg-brand-cream/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button className="md:hidden p-2 text-brand-secondary hover:text-brand-primary transition-colors">
            <Menu className="w-6 h-6" />
          </button>
          <Link href="/" className="font-serif text-2xl md:text-3xl font-bold text-brand-secondary tracking-tight">
            Gaon <span className="text-brand-primary">Pure</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-8 font-medium text-stone-600">
          <Link href="/#products" className="hover:text-brand-primary transition-colors">Our Products</Link>
          <Link href="/#ingredients" className="hover:text-brand-primary transition-colors">Ingredients</Link>
          <Link href="/#processing" className="hover:text-brand-primary transition-colors">Processing</Link>
          <Link href="/#integrity" className="hover:text-brand-primary transition-colors">Integrity</Link>
        </nav>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              {isAdmin && (
                <Link href="/admin/dashboard" className="hidden md:flex items-center gap-2 text-sm font-medium text-brand-primary hover:text-brand-secondary transition-colors">
                  <LayoutDashboard className="w-4 h-4" /> Admin
                </Link>
              )}
              <div className="hidden md:block text-sm font-medium text-stone-600 bg-stone-100 px-3 py-1.5 rounded-full">
                Hi, {user?.name}
              </div>
              <button onClick={logout} className="p-2 text-stone-400 hover:text-red-500 transition-colors" title="Log out">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setIsAuthOpen(true)}
              className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-brand-primary/10 text-brand-primary font-medium hover:bg-brand-primary hover:text-white transition-all text-sm"
            >
              <User className="w-4 h-4" /> Sign In
            </button>
          )}

          <div className="w-px h-6 bg-stone-200 hidden md:block"></div>

          <button 
            className="p-2 text-brand-secondary hover:text-brand-primary transition-colors relative"
            onClick={() => setIsOpen(true)}
          >
            <ShoppingCart className="w-5 h-5" />
            {itemCount > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-brand-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>
      </header>
      
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
}
