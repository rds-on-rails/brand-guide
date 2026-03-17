'use client';
import { useParams, useRouter } from 'next/navigation';
import { products } from '@/lib/data';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, updateQuantity } from '@/store/cartSlice';
import { RootState } from '@/store';
import Navbar from '@/components/Navbar';
import { ArrowLeft, ShoppingCart, Plus, Minus, Tag, MapPin, Package } from 'lucide-react';

import { use } from 'react';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const dispatch = useDispatch();
    
    // Unwrap params Promise in Next 15 client component
    const resolvedParams = use(params);
    const productId = resolvedParams.id;
    const product = products.find(p => p.id === productId);
    
    const cartItems = useSelector((state: RootState) => state.cart.items);
    
    if (!product) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
                <button onClick={() => router.push('/')} className="text-blue-600 hover:underline">
                    Return Home
                </button>
            </div>
        );
    }

    const cartItem = cartItems.find((item) => item.id === product.id);
    const quantityInCart = cartItem ? cartItem.quantity : 0;
    const isOutOfStock = product.stock === 0;
    const isMaxReached = quantityInCart >= product.stock;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
                <button 
                    onClick={() => router.push('/')}
                    className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-8 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Gallery
                </button>

                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2">
                        {/* Image Section */}
                        <div className="h-64 md:h-auto md:min-h-[500px] relative bg-gray-100">
                            <img 
                                src={product.imageUrl} 
                                alt={product.name} 
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                            <div className="absolute top-4 left-4 flex gap-2">
                                <span className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                                    {product.category}
                                </span>
                            </div>
                        </div>

                        {/* Details Section */}
                        <div className="p-8 md:p-12 flex flex-col">
                            <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
                                {product.type === 'physical' ? <Package className="w-4 h-4"/> : <MapPin className="w-4 h-4"/>}
                                <span className="capitalize">{product.type} Product</span>
                            </div>
                            
                            <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
                                {product.name}
                            </h1>
                            
                            <p className="text-2xl font-bold text-blue-600 mb-8">
                                €{product.price}
                            </p>
                            
                            <div className="prose prose-blue text-gray-600 mb-8 flex-1">
                                <p className="text-lg leading-relaxed">{product.description}</p>
                            </div>

                            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 mt-auto">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center text-gray-700">
                                        <Tag className="w-5 h-5 mr-2" />
                                        <span className="font-medium">Availability</span>
                                    </div>
                                    <div>
                                        {product.stock > 0 ? (
                                            <span className="text-green-600 font-bold bg-green-50 px-3 py-1 rounded-full">{product.stock} in stock</span>
                                        ) : (
                                            <span className="text-red-500 font-bold bg-red-50 px-3 py-1 rounded-full">Out of stock</span>
                                        )}
                                    </div>
                                </div>

                                {/* Cart Controls */}
                                {isOutOfStock ? (
                                    <button disabled className="w-full bg-gray-200 text-gray-500 font-bold py-4 rounded-xl cursor-not-allowed">
                                        Sold Out
                                    </button>
                                ) : quantityInCart > 0 ? (
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <div className="flex items-center justify-between flex-1 bg-white border-2 border-blue-100 rounded-xl px-4 py-2">
                                            <button 
                                                onClick={() => dispatch(updateQuantity({ id: product.id, quantity: quantityInCart - 1 }))}
                                                className="p-3 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                            >
                                                <Minus className="w-5 h-5" />
                                            </button>
                                            <span className="font-bold text-blue-900 text-xl">{quantityInCart}</span>
                                            <button 
                                                onClick={() => dispatch(updateQuantity({ id: product.id, quantity: quantityInCart + 1 }))}
                                                disabled={isMaxReached}
                                                className={`p-3 rounded-lg transition-all ${
                                                    isMaxReached 
                                                    ? 'text-gray-300 cursor-not-allowed' 
                                                    : 'text-blue-600 hover:bg-blue-50'
                                                }`}
                                            >
                                                <Plus className="w-5 h-5" />
                                            </button>
                                        </div>
                                        <button 
                                            onClick={() => router.push('/checkout')}
                                            className="sm:w-1/2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-colors shadow-sm"
                                        >
                                            Checkout Now
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => dispatch(addToCart({ ...product, quantity: 1, type: product.type }))}
                                        className="w-full flex justify-center items-center space-x-2 bg-gray-900 hover:bg-blue-600 text-white font-bold py-4 rounded-xl transition-all shadow-md hover:shadow-lg"
                                    >
                                        <ShoppingCart className="w-5 h-5" />
                                        <span>Add to Cart</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
