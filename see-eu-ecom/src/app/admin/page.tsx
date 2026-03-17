'use client';
import Navbar from '@/components/Navbar';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { updateOrderStatus, OrderStatus } from '@/store/orderSlice';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminDashboard() {
    const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
    const orders = useSelector((state: RootState) => state.order.orders);
    const dispatch = useDispatch();
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated || user?.role !== 'Admin') {
            router.push('/');
        }
    }, [isAuthenticated, user, router]);

    if (!isAuthenticated || user?.role !== 'Admin') return null;

    const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
        dispatch(updateOrderStatus({ id: orderId, status: newStatus }));
    };

    const statusColors: Record<string, string> = {
        'Payment Pending': 'bg-yellow-100 text-yellow-800',
        'Payment Done': 'bg-blue-100 text-blue-800',
        'Confirmed': 'bg-green-100 text-green-800',
        'Ordered': 'bg-yellow-100 text-yellow-800',
        'Shipped': 'bg-blue-100 text-blue-800',
        'Out for Delivery': 'bg-purple-100 text-purple-800',
        'Delivered': 'bg-green-100 text-green-800',
        'Return Picked': 'bg-orange-100 text-orange-800',
        'Return Completed': 'bg-gray-100 text-gray-800'
    };

    const digitalOptions = ['Payment Pending', 'Payment Done', 'Confirmed'];
    const physicalOptions = ['Ordered', 'Shipped', 'Out for Delivery', 'Delivered', 'Return Picked', 'Return Completed'];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Delivery Stage Orchestrator</h1>

                <div className="bg-white shadow overflow-hidden sm:rounded-lg overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Update Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                        No orders have been placed yet.
                                    </td>
                                </tr>
                            ) : orders.map((order) => {
                                const optionsList = order.orderType === 'digital' ? digitalOptions : physicalOptions;

                                return (
                                    <tr key={order.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{order.orderType}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.shippingAddress.fullName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.date).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">€{order.total}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="relative inline-block text-left w-full max-w-[180px]">
                                                <select
                                                    className="block w-full pl-3 pr-8 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border bg-gray-50 hover:bg-gray-100 transition-colors"
                                                    value={order.status}
                                                    onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                                                >
                                                    {optionsList.map(opt => (
                                                        <option key={opt} value={opt}>{opt}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
