'use client';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { removeFromCart, updateQuantity } from '../store/cartSlice';
import { X, Plus, Minus, ShoppingCart, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface MiniCartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function MiniCartDrawer({ isOpen, onClose }: MiniCartDrawerProps) {
    const dispatch = useDispatch();
    const router = useRouter();
    const cart = useSelector((state: RootState) => state.cart);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity"
                onClick={onClose}
            />

            {/* Sliding Drawer */}
            <div className={`fixed inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}>
                
                {/* Header */}
                <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5 text-gray-900" />
                        <h2 className="text-lg font-bold text-gray-900">Your Cart</h2>
                        <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded-full">
                            {cart.items.reduce((sum, item) => sum + item.quantity, 0)} items
                        </span>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-900 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6">
                    {cart.items.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center">
                            <ShoppingCart className="w-16 h-16 text-gray-200 mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h3>
                            <p className="text-gray-500 mb-6">Looks like you haven't added anything yet.</p>
                            <button 
                                onClick={onClose}
                                className="bg-blue-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-blue-700 transition"
                            >
                                Start Browsing
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {cart.items.map(item => {
                                const isMaxReached = item.quantity >= item.stock;
                                return (
                                    <div key={item.id} className="flex gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm relative group text-left">
                                        <button 
                                            onClick={() => dispatch(removeFromCart(item.id))}
                                            className="absolute -top-2 -right-2 bg-white text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-full border border-gray-200 shadow-sm opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                        
                                        <img src={item.imageUrl} alt={item.name} className="w-20 h-20 object-cover rounded-xl" />
                                        
                                        <div className="flex-1 flex flex-col justify-between">
                                            <div>
                                                <h4 className="font-bold text-sm text-gray-900 line-clamp-2">{item.name}</h4>
                                                <p className="text-xs text-gray-500 mt-1 capitalize">{item.type} Product</p>
                                            </div>
                                            
                                            <div className="flex items-center justify-between mt-3">
                                                <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg p-1">
                                                    <button 
                                                        onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity - 1 }))}
                                                        className="p-1 text-gray-500 hover:bg-white hover:text-blue-600 rounded shadow-sm transition"
                                                    >
                                                        <Minus className="w-3 h-3" />
                                                    </button>
                                                    <span className="font-bold text-sm min-w-[24px] text-center">{item.quantity}</span>
                                                    <button 
                                                        onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }))}
                                                        disabled={isMaxReached}
                                                        className={`p-1 rounded shadow-sm transition ${isMaxReached ? 'text-gray-300 bg-gray-50' : 'text-gray-500 hover:bg-white hover:text-blue-600'}`}
                                                    >
                                                        <Plus className="w-3 h-3" />
                                                    </button>
                                                </div>
                                                <span className="font-bold text-gray-900">€{item.price * item.quantity}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {cart.items.length > 0 && (
                    <div className="border-t border-gray-100 p-6 bg-gray-50">
                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between text-gray-500 text-sm">
                                <span>Subtotal</span>
                                <span>€{cart.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-500 text-sm">
                                <span>Taxes (20%)</span>
                                <span>€{cart.tax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-500 text-sm">
                                <span>Shipping</span>
                                <span>{cart.shipping === 0 ? 'Free' : `€${cart.shipping.toFixed(2)}`}</span>
                            </div>
                            <div className="border-t border-gray-200 pt-3 flex justify-between items-center text-lg font-bold text-gray-900">
                                <span>Estimated Total</span>
                                <span>€{cart.total.toFixed(2)}</span>
                            </div>
                        </div>
                        
                        <button 
                            onClick={() => {
                                onClose();
                                router.push('/checkout');
                            }}
                            className="w-full bg-gray-900 hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-xl transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                        >
                            <span>Checkout Now</span>
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}
