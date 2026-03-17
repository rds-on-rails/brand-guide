'use client';
import Link from 'next/link';
import { ShoppingCart, LogOut, User as UserIcon } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { logoutUser } from '../store/authSlice';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import MiniCartDrawer from './MiniCartDrawer';

export default function Navbar() {
    const cartItems = useSelector((state: RootState) => state.cart.items);
    const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch();
    const router = useRouter();

    const [isCartOpen, setIsCartOpen] = useState(false);

    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    const handleLogout = () => {
        dispatch(logoutUser());
        router.push('/');
    };

    return (
        <>
            <nav className="bg-white shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <Link href="/" className="flex-shrink-0 flex items-center">
                                <span className="text-2xl font-bold text-blue-600">See-EU</span>
                            </Link>
                        </div>
                        <div className="flex items-center space-x-6">
                            {isAuthenticated && user?.role === 'Admin' && (
                                <Link href="/admin" className="text-red-600 hover:text-red-700 font-bold text-sm px-2 py-1 bg-red-50 rounded">
                                    Admin Dashboard
                                </Link>
                            )}

                            <Link href="/orders" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">
                                My Orders
                            </Link>

                            <button 
                                onClick={() => setIsCartOpen(true)}
                                className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors focus:outline-none"
                            >
                                <ShoppingCart className="h-6 w-6" />
                                {itemCount > 0 && (
                                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                                        {itemCount}
                                    </span>
                                )}
                            </button>

                            <div className="border-l pl-6 flex items-center space-x-4 border-gray-200">
                                {isAuthenticated && user ? (
                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center space-x-2 text-sm text-gray-700 hidden sm:flex">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                                <UserIcon className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="font-semibold leading-none">{user.name}</p>
                                                <p className="text-xs text-gray-500 mt-1">{user.role}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleLogout}
                                            className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
                                            title="Sign out"
                                        >
                                            <LogOut className="w-5 h-5" />
                                        </button>
                                    </div>
                                ) : (
                                    <Link
                                        href="/auth/login"
                                        className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                    >
                                        Sign In
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
            <MiniCartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </>
    );
}
