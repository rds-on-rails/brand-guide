'use client';

import { useCartStore } from '@/store/useCartStore';
import { ShieldCheck, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useCatalogStore } from '@/store/useCatalogStore';
import { db, functions, auth } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { CheckoutForm } from './CheckoutForm';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_mock');

export default function Checkout() {
  const { items, getTotal, clearCart } = useCartStore();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', address: '', city: '', pincode: '',
  });

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderDocId, setOrderDocId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const subtotal = getTotal();
  const shipping = subtotal > 1000 ? 0 : 50;
  const total = subtotal + shipping;

  const handleProceedToPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    try {
      // 1. Create order in Firestore
      const orderRef = await addDoc(collection(db, 'Orders'), {
        items,
        totalAmount: total,
        shippingAddress: formData,
        customer_email: formData.email,
        customerName: formData.name,
        payment_status: 'Pending',
        delivery_stage: 'Ordered',
        userId: auth.currentUser?.uid || 'guest',
        createdAt: serverTimestamp(),
      });
      setOrderDocId(orderRef.id);

      // 2. Call Cloud Function to get Payment Intent Secret
      const createPaymentIntent = httpsCallable(functions, 'createPaymentIntent');
      const response = await createPaymentIntent({
        items,
        orderId: orderRef.id,
      }) as any;
      
      setClientSecret(response.data.clientSecret);
    } catch (error) {
      console.error("Error initializing payment:", error);
      alert("Failed to initialize payment. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentSuccess = () => {
    clearCart();
    router.push(`/orders/${orderDocId || 'success'}`);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-brand-cream/50 pt-32 pb-24 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-serif text-brand-secondary mb-4">Your cart is empty</h1>
          <Link href="/#products" className="text-brand-primary hover:underline font-medium">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-cream/50 pt-24 pb-24">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center gap-2 text-sm text-stone-500 mb-8 mt-4">
          <Link href="/">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-stone-900 font-medium">Checkout</span>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Checkout Form or Payment Element */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-200">
            <h2 className="text-2xl font-serif text-brand-secondary mb-6 font-bold">
              {clientSecret ? "Complete Payment" : "Delivery Details"}
            </h2>
            
            {!clientSecret ? (
              <form onSubmit={handleProceedToPayment} className="space-y-6">
                 {/* Address Inputs... */}
                 <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-stone-700 mb-1">Full Name</label>
                    <input required type="text" className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none transition-all" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="John Doe" />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-stone-700 mb-1">Email</label>
                    <input required type="email" className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none transition-all" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="john@example.com" />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-stone-700 mb-1">Phone (+91)</label>
                    <input required type="tel" className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none transition-all" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="9876543210" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-stone-700 mb-1">Street Address</label>
                    <textarea required rows={2} className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none transition-all resize-none" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="123 Village Lane, Block C" />
                  </div>
                   <div className="col-span-1">
                    <label className="block text-sm font-medium text-stone-700 mb-1">City</label>
                    <input required type="text" className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none transition-all" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} placeholder="Mumbai" />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-stone-700 mb-1">PIN Code</label>
                    <input required type="text" className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none transition-all" value={formData.pincode} onChange={e => setFormData({...formData, pincode: e.target.value})} placeholder="400001" />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isProcessing}
                  className="w-full bg-brand-secondary hover:bg-brand-primary text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Saving Details...' : `Proceed to Payment`}
                </button>
              </form>
            ) : (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm total={total} onSuccess={handlePaymentSuccess} />
              </Elements>
            )}
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-200 sticky top-28">
              <h2 className="text-2xl font-serif text-brand-secondary mb-6 font-bold">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={`${item.id}-${item.weight}`} className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-stone-50 rounded-lg flex items-center justify-center text-xl shadow-inner text-center">🌾</div>
                      <div>
                        <h4 className="font-semibold text-stone-800">{item.name}</h4>
                        <p className="text-sm text-stone-500">Qty: {item.quantity} × {item.weight}</p>
                      </div>
                    </div>
                    <p className="font-semibold text-stone-800">₹{item.price * item.quantity}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-stone-200 pt-6 space-y-3 text-sm">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-stone-800">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Shipping</span>
                  <span className="font-medium text-stone-800">{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
                </div>
                {shipping > 0 && (
                  <div className="text-xs text-brand-primary mt-1">Add ₹{1000 - subtotal} more for free shipping!</div>
                )}
                
                <div className="border-t border-stone-200 pt-4 mt-4 flex justify-between items-center text-lg">
                  <span className="font-bold text-stone-800">Total</span>
                  <span className="font-bold text-2xl text-brand-secondary">₹{total}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
