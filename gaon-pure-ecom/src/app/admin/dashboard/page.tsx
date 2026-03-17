'use client';

import { useEffect, useState } from 'react';
import { getOrders, updateOrderStatus, type Order, type OrderStatus } from '@/store/useOrderStore';
import { useAuthStore } from '@/store/useAuthStore';
import { Search, ShieldAlert, Package, ShoppingBag } from 'lucide-react';
import CatalogManager from '@/components/CatalogManager';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

export default function AdminDashboard() {
  const { isAuthenticated, isAdmin, isInitialized, login, logout } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'orders' | 'catalog'>('orders');

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    // Refresh orders periodically
    setOrders(getOrders());
    const interval = setInterval(() => {
      setOrders(getOrders());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Fallback to mock login if firebase fails or is bypassed
    if (password === 'admin123') {
       login(email || 'admin@gaonpure.com', password);
       return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate admin.');
    }
  };

  const handleUpdateStatus = (orderId: string, newStatus: OrderStatus) => {
    const updated = updateOrderStatus(orderId, newStatus, `Admin updated status to ${newStatus}`);
    if (updated) setOrders(getOrders());
  };

  if (!isInitialized) return null;

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-brand-cream/30 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-sm w-full border border-stone-100">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-brand-primary/10 text-brand-primary rounded-full flex items-center justify-center">
              <ShieldAlert className="w-8 h-8" />
            </div>
          </div>
          <h1 className="text-2xl font-serif font-bold text-center mb-2 text-brand-secondary">Admin Access</h1>
          <p className="text-center text-sm text-stone-500 mb-6">Role-Based Access Control Area</p>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1">Admin Email</label>
              <input 
                type="email" 
                required
                className="w-full border border-stone-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-primary outline-none transition-all" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@gaonpure.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1">Passphrase</label>
              <input 
                type="password" 
                required
                className="w-full border border-stone-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-primary outline-none transition-all" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter admin password"
              />
            </div>
            <button className="w-full bg-brand-secondary hover:bg-brand-primary text-white font-bold py-3 rounded-xl transition-all shadow-md shadow-brand-primary/10">
              Authenticate
            </button>
          </form>
        </div>
      </div>
    );
  }

  const allStatuses: OrderStatus[] = ['Ordered', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      <div className="bg-brand-secondary text-brand-cream py-6 mb-8 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2"></div>
        <div className="container mx-auto px-4 flex justify-between items-center relative z-10">
          <h1 className="text-xl font-bold font-serif flex items-center gap-3">
            Gaon Pure <span className="bg-white/10 px-3 py-1 text-xs font-sans rounded-full border border-white/20">Admin Workspace</span>
          </h1>
          <button onClick={logout} className="text-sm text-brand-cream/70 hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-lg border border-white/10">Terminate Session</button>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex gap-4 mb-8">
          <button 
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'orders' 
                ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20' 
                : 'bg-white text-stone-600 border border-stone-200 hover:border-brand-primary/30 hover:bg-stone-50'
            }`}
          >
            <Package className="w-5 h-5" /> Order Fulfillment
          </button>
          <button 
            onClick={() => setActiveTab('catalog')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'catalog' 
                ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20' 
                : 'bg-white text-stone-600 border border-stone-200 hover:border-brand-primary/30 hover:bg-stone-50'
            }`}
          >
            <ShoppingBag className="w-5 h-5" /> Catalog Studio
          </button>
        </div>

        {activeTab === 'orders' ? (
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-stone-200 flex justify-between items-center bg-stone-50/50">
              <h2 className="text-lg font-bold text-stone-800 font-serif">Incoming Orders</h2>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input type="text" placeholder="Search ID or Name..." className="pl-9 pr-4 py-2 w-64 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary bg-white shadow-sm" />
              </div>
            </div>

            <div className="overflow-x-auto">
               <table className="w-full text-left">
                <thead>
                  <tr className="bg-white border-b border-stone-200 text-stone-500 text-xs uppercase tracking-wider">
                    <th className="p-4 font-semibold">Order ID</th>
                    <th className="p-4 font-semibold">Customer</th>
                    <th className="p-4 font-semibold">Total Revenue</th>
                    <th className="p-4 font-semibold">Payment</th>
                    <th className="p-4 font-semibold">Lifecycle Status</th>
                    <th className="p-4 font-semibold">Logistics Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-stone-500 bg-stone-50/30">
                        <Package className="w-12 h-12 mx-auto text-stone-300 mb-3" />
                        <p>No active orders in the pipeline.</p>
                      </td>
                    </tr>
                  ) : (
                    orders.map(order => (
                      <tr key={order.id} className="hover:bg-stone-50/50 transition-colors">
                        <td className="p-4 font-mono text-sm text-brand-primary font-medium">{order.id}</td>
                        <td className="p-4">
                          <div className="font-semibold text-stone-800">{order.customerName}</div>
                          <div className="text-xs text-stone-500">{order.customerEmail}</div>
                        </td>
                        <td className="p-4 font-medium text-stone-800">₹{order.totalAmount}</td>
                        <td className="p-4">
                          <span className="bg-green-100/50 text-green-700 border border-green-200/50 text-xs px-2.5 py-1 rounded-full font-medium">{order.paymentStatus}</span>
                        </td>
                        <td className="p-4">
                           <span className={`text-xs px-2.5 py-1 rounded-full font-medium inline-flex items-center border ${
                            order.status === 'Delivered' ? 'bg-green-100 text-green-700 border-green-200' :
                            order.status === 'Cancelled' ? 'bg-red-100 text-red-700 border-red-200' :
                            'bg-blue-100 text-blue-700 border-blue-200'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${order.status === 'Delivered' ? 'bg-green-500' : order.status === 'Cancelled' ? 'bg-red-500' : 'bg-blue-500 animate-pulse'}`}></span>
                            {order.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <select 
                            className="text-sm border border-stone-200 bg-white rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-brand-primary shadow-sm hover:border-brand-primary/30 transition-colors cursor-pointer"
                            value={order.status}
                            onChange={(e) => handleUpdateStatus(order.id, e.target.value as OrderStatus)}
                          >
                            {allStatuses.map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in zoom-in-95 duration-200">
             <CatalogManager />
          </div>
        )}
      </div>
    </div>
  );
}
