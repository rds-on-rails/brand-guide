'use client';
import Navbar from '@/components/Navbar';
import OrderTrackingStepper from '@/components/OrderTrackingStepper';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { updateOrderStatus } from '@/store/orderSlice';
import { RefreshCw, Package, MapPin } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

export default function OrdersPage() {
    const orders = useSelector((state: RootState) => state.order.orders);
    const dispatch = useDispatch();
    const [isRefreshing, setIsRefreshing] = useState<string | null>(null);

    const fetchTracking = async (orderId: string, orderType: 'digital' | 'physical') => {
        setIsRefreshing(orderId);
        try {
            const res = await fetch(`/api/track-order?id=${orderId}&type=${orderType}`);
            if (!res.ok) throw new Error('Failed to track');
            const data = await res.json();

            // Update Redux state with new mock status
            dispatch(updateOrderStatus({ id: orderId, status: data.status }));
        } catch (e) {
            console.error(e);
        } finally {
            setTimeout(() => setIsRefreshing(null), 800);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

                {orders.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-xl font-medium text-gray-900 mb-2">No orders yet</h2>
                        <p className="text-gray-500 mb-6">Looks like you haven't made any purchases.</p>
                        <Link href="/" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition">
                            Start Browsing
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map(order => (
                            <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="bg-gray-50 px-6 py-4 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500 font-medium">Order Number</p>
                                        <p className="font-bold text-gray-900">{order.id}</p>
                                    </div>
                                    <div className="text-left sm:text-right">
                                        <p className="text-sm text-gray-500 font-medium">Order Date</p>
                                        <p className="font-medium text-gray-900">{new Date(order.date).toLocaleDateString()}</p>
                                    </div>
                                    <div className="text-left sm:text-right">
                                        <p className="text-sm text-gray-500 font-medium">Total Amount</p>
                                        <p className="font-bold text-blue-600">€{order.total}</p>
                                    </div>
                                </div>

                                <div className="p-6">
                                    {/* Tracking Section */}
                                    <div className="mb-8">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="font-bold text-lg text-gray-900">Tracking Status</h3>
                                            <button
                                                onClick={() => fetchTracking(order.id, order.orderType)}
                                                disabled={isRefreshing === order.id}
                                                className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 disabled:opacity-50 transition"
                                            >
                                                <RefreshCw className={`w-4 h-4 mr-1 ${isRefreshing === order.id ? 'animate-spin' : ''}`} />
                                                Refresh Status
                                            </button>
                                        </div>
                                        <OrderTrackingStepper status={order.status} orderType={order.orderType} />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t pt-6">
                                        {/* Items Section */}
                                        <div>
                                            <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                                                <Package className="w-5 h-5 mr-2 text-gray-400" />
                                                Items Ordered
                                            </h3>
                                            <div className="space-y-3">
                                                {order.items.map(item => (
                                                    <div key={item.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                                                        <div className="flex items-center gap-3">
                                                            <img src={item.imageUrl} alt={item.name} className="w-12 h-12 object-cover rounded-md" />
                                                            <div>
                                                                <p className="font-medium text-sm text-gray-900 line-clamp-1">{item.name}</p>
                                                                <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                                            </div>
                                                        </div>
                                                        <span className="font-medium text-gray-900 text-sm">€{item.price * item.quantity}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Address Section */}
                                        <div>
                                            <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                                                <MapPin className="w-5 h-5 mr-2 text-gray-400" />
                                                Shipping Address
                                            </h3>
                                            <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600">
                                                <p className="font-semibold text-gray-900 mb-1">{order.shippingAddress.fullName}</p>
                                                <p>{order.shippingAddress.street}</p>
                                                <p>{order.shippingAddress.city}, {order.shippingAddress.pinCode}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
