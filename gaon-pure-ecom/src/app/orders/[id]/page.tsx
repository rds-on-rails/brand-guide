'use client';

import { useEffect, useState } from 'react';
import { getOrderById, type Order } from '@/store/useOrderStore';
import { Package, CheckCircle, Truck, Inbox, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function OrderTracking({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  // Unwrap params using React.use() in Next.js 15
  // But for simple client components, standard params destructuring works if not async. Wait, in Next 15 `params` is a Promise.
  // We should unwrap it properly or just read the URL. Let's use `useParams` from next/navigation.
  
  return <OrderTrackingContent id={params.id} />
}

import { useParams } from 'next/navigation';

function OrderTrackingContent({ id }: { id?: string }) {
  const params = useParams();
  const orderId = (id || params.id) as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      // In a real app this would be an API call
      const found = getOrderById(orderId);
      setOrder(found || null);
      setLoading(false);
    }
  }, [orderId]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  if (!order) {
    return (
      <div className="min-h-screen bg-brand-cream/50 pt-32 text-center">
        <h1 className="text-3xl font-serif text-brand-secondary mb-4">Order Not Found</h1>
        <Link href="/" className="text-brand-primary underline">Return Home</Link>
      </div>
    );
  }

  const steps = ['Ordered', 'Shipped', 'Out for Delivery', 'Delivered'];
  const currentStepIndex = steps.indexOf(order.status);

  return (
    <div className="min-h-screen bg-brand-cream/50 pt-24 pb-24">
      <div className="container mx-auto px-4 max-w-3xl">
        <Link href="/" className="inline-flex items-center gap-2 text-stone-500 hover:text-brand-primary transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-stone-200">
          <div className="text-center mb-10 border-b border-stone-100 pb-8">
             <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10" />
             </div>
             <h1 className="text-3xl font-serif font-bold text-brand-secondary mb-2">Thank you for your order!</h1>
             <p className="text-stone-500">Order #{order.id}</p>
          </div>

          <div className="mb-12">
            <h3 className="font-semibold text-lg mb-6">Tracking Status</h3>
            <div className="relative flex justify-between">
               {/* Progress bar background */}
               <div className="absolute top-1/2 left-0 w-full h-1 bg-stone-100 -translate-y-1/2"></div>
               {/* Progress bar fill */}
               <div 
                  className="absolute top-1/2 left-0 h-1 bg-brand-primary transition-all duration-1000 -translate-y-1/2"
                  style={{ width: `${(Math.max(0, currentStepIndex) / (steps.length - 1)) * 100}%` }}
               ></div>

               {steps.map((step, index) => {
                 const isCompleted = index <= currentStepIndex;
                 const isCurrent = index === currentStepIndex;
                 return (
                   <div key={step} className="relative z-10 flex flex-col items-center gap-3">
                     <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-500 ${
                       isCompleted ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/30' : 'bg-white border-2 border-stone-200 text-stone-400'
                     }`}>
                       {index === 0 && <Inbox className="w-5 h-5" />}
                       {index === 1 && <Package className="w-5 h-5" />}
                       {index === 2 && <Truck className="w-5 h-5" />}
                       {index === 3 && <CheckCircle className="w-5 h-5" />}
                     </div>
                     <span className={`text-xs font-medium md:text-sm absolute top-12 whitespace-nowrap ${isCurrent ? 'text-brand-primary font-bold' : isCompleted ? 'text-stone-700' : 'text-stone-400'}`}>
                       {step}
                     </span>
                   </div>
                 );
               })}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 pt-12">
            <div>
              <h4 className="font-semibold text-stone-800 mb-4 border-b pb-2">Delivery Details</h4>
              <div className="text-sm text-stone-600 space-y-1">
                <p className="font-medium text-stone-900">{order.customerName}</p>
                <p>{order.shippingAddress?.address}</p>
                <p>{order.shippingAddress?.city}, {order.shippingAddress?.pincode}</p>
                <p className="pt-2">{order.shippingAddress?.phone}</p>
                <p>{order.customerEmail}</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-stone-800 mb-4 border-b pb-2">Order Summary</h4>
              <div className="space-y-3 mb-4">
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-stone-600">{item.quantity}x {item.weight} Pack</span>
                    <span className="font-medium">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-3 flex justify-between items-center font-bold text-brand-secondary">
                <span>Total Paid</span>
                <span>₹{order.totalAmount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
