'use client';

import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export function CartDrawer() {
  const { isOpen, setIsOpen, items, updateQuantity, removeItem, getTotal } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-brand-cream shadow-2xl z-[60] transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-stone-200">
          <h2 className="font-serif text-2xl font-bold text-brand-secondary flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-brand-primary" />
            Your Cart
          </h2>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 text-stone-400 hover:text-stone-800 transition-colors bg-white rounded-full shadow-sm hover:shadow"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-stone-500 gap-4">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-inner">
                 <ShoppingBag className="w-8 h-8 text-stone-300" />
              </div>
              <p>Your cart is empty</p>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-brand-primary font-medium hover:underline mt-2"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={`${item.id}-${item.weight}`} className="flex gap-4 bg-white p-3 rounded-2xl shadow-sm border border-stone-100">
                <div className="w-24 h-24 bg-stone-50 rounded-xl overflow-hidden shadow-inner flex items-center justify-center">
                  <span className="text-4xl">🌾</span> {/* Placeholder for actual image */}
                </div>
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-brand-secondary leading-tight">{item.name}</h3>
                      <button 
                        onClick={() => removeItem(item.id, item.weight)}
                        className="text-stone-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-sm text-stone-500 mt-1.5 flex items-center gap-2">
                      <span className="bg-brand-cream px-2 py-0.5 rounded-md text-brand-primary font-medium">{item.weight} Pack</span>
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <p className="font-semibold text-brand-primary">₹{item.price * item.quantity}</p>
                    <div className="flex items-center gap-3 bg-stone-50 px-2 py-1 rounded-full border border-stone-200">
                      <button 
                        onClick={() => updateQuantity(item.id, item.weight, item.quantity - 1)}
                        className="p-1 hover:bg-white rounded-full transition-colors"
                      >
                        <Minus className="w-3 h-3 text-stone-600" />
                      </button>
                      <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.weight, item.quantity + 1)}
                        className="p-1 hover:bg-white rounded-full transition-colors text-brand-primary"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 border-t border-stone-200 bg-white/50 backdrop-blur-sm">
            <div className="flex justify-between items-center mb-6 text-lg">
              <span className="font-semibold text-stone-600">Total</span>
              <span className="font-bold text-xl text-brand-secondary">₹{getTotal()}</span>
            </div>
            <Link 
              href="/checkout"
              onClick={() => setIsOpen(false)}
              className="w-full bg-brand-primary hover:bg-brand-primary-dark text-white font-medium py-4 rounded-xl shadow-lg shadow-brand-primary/20 transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5"
            >
              Proceed to Checkout
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
