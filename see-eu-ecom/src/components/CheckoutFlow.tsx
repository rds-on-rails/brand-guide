'use client';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { clearCart, removeFromCart, updateQuantity } from '../store/cartSlice';
import { placeOrder } from '../store/orderSlice';
import { Trash2, CreditCard, ChevronRight, Plus, Minus } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CheckoutFlow() {
    const dispatch = useDispatch();
    const router = useRouter();
    const cart = useSelector((state: RootState) => state.cart);

    const [step, setStep] = useState(1);
    const [address, setAddress] = useState({ fullName: '', street: '', city: '', pinCode: '' });
    const [isProcessing, setIsProcessing] = useState(false);

    const handleNext = (e: React.FormEvent) => {
        e.preventDefault();
        setStep(2);
    };

    const handlePay = () => {
        setIsProcessing(true);
        setTimeout(() => {
            const isPhysical = cart.items.some(i => i.type === 'physical');
            const newOrder = {
                id: `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
                items: cart.items,
                total: cart.total,
                status: (isPhysical ? 'Ordered' : 'Payment Pending') as 'Ordered' | 'Payment Pending',
                orderType: (isPhysical ? 'physical' : 'digital') as 'physical' | 'digital',
                date: new Date().toISOString(),
                shippingAddress: address
            };
            dispatch(placeOrder(newOrder));
            dispatch(clearCart());
            setIsProcessing(false);
            router.push(`/checkout/success?orderId=${newOrder.id}`);
        }, 1500);
    };

    if (cart.items.length === 0 && step === 1) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
                <button onClick={() => router.push('/')} className="text-blue-600 hover:text-blue-800 font-medium">Continue Shopping</button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="flex justify-between items-center mb-12">
                <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
                <div className="flex space-x-2 text-sm">
                    <span className={`font-semibold ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>Cart & Address</span>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                    <span className={`font-semibold ${step === 2 ? 'text-blue-600' : 'text-gray-400'}`}>Payment</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {step === 1 ? (
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold mb-6">Shipping Information</h2>
                            <form onSubmit={handleNext} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                    <input required type="text" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={address.fullName} onChange={(e) => setAddress({ ...address, fullName: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                                    <input required type="text" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                        <input required type="text" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Pin Code</label>
                                        <input required type="text" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={address.pinCode} onChange={(e) => setAddress({ ...address, pinCode: e.target.value })} />
                                    </div>
                                </div>
                                <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition mt-6">Continue to Payment</button>
                            </form>
                        </div>
                    ) : (
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold mb-6">Payment</h2>
                            <div className="p-6 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 text-center space-y-4">
                                <CreditCard className="w-12 h-12 text-gray-400 mx-auto" />
                                <p className="text-gray-600 font-medium">This is a simulated payment. Your card won't be charged.</p>
                                <button
                                    onClick={handlePay}
                                    disabled={isProcessing}
                                    className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition disabled:opacity-50"
                                >
                                    {isProcessing ? 'Processing...' : `Pay \u20AC${cart.total.toFixed(2)}`}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="lg:col-span-1">
                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 sticky top-24">
                        <h2 className="text-lg font-bold mb-4">Order Summary</h2>
                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                            {cart.items.map(item => {
                                const isMaxReached = item.quantity >= item.stock;
                                return (
                                    <div key={item.id} className="flex justify-between items-center text-sm border-b border-gray-200 pb-3 last:border-0">
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-800 line-clamp-1">{item.name}</p>

                                            {step === 1 ? (
                                                <div className="flex items-center space-x-2 mt-2">
                                                    <button
                                                        onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity - 1 }))}
                                                        className="p-1 bg-white border border-gray-200 rounded text-gray-600 hover:bg-gray-50 transition"
                                                    >
                                                        <Minus className="w-3 h-3" />
                                                    </button>
                                                    <span className="font-medium min-w-[16px] text-center">{item.quantity}</span>
                                                    <button
                                                        onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }))}
                                                        disabled={isMaxReached}
                                                        className={`p-1 bg-white border rounded transition ${isMaxReached ? 'border-gray-100 text-gray-300' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                                    >
                                                        <Plus className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <p className="text-gray-500 mt-1">Qty: {item.quantity}</p>
                                            )}
                                        </div>
                                        <div className="text-right ml-4">
                                            <p className="font-bold text-gray-900">€{item.price * item.quantity}</p>
                                            {step === 1 && (
                                                <button onClick={() => dispatch(removeFromCart(item.id))} className="text-red-500 hover:text-red-700 text-xs flex items-center justify-end mt-2 w-full">
                                                    <Trash2 className="w-3 h-3 mr-1" /> Remove
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="border-t mt-6 pt-4 space-y-3">
                            <div className="flex justify-between items-center text-sm text-gray-500">
                                <span>Subtotal</span>
                                <span>€{cart.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm text-gray-500">
                                <span>Taxes (20%)</span>
                                <span>€{cart.tax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm text-gray-500">
                                <span>Shipping</span>
                                <span>{cart.shipping === 0 ? 'Free (Digital Only)' : `€${cart.shipping.toFixed(2)}`}</span>
                            </div>
                            <div className="flex justify-between items-center font-bold text-lg pt-3 border-t">
                                <span>Total</span>
                                <span className="text-blue-600">€{cart.total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
