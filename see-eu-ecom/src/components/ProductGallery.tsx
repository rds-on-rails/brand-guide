'use client';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, updateQuantity } from '../store/cartSlice';
import { RootState } from '../store';
import { products } from '../lib/data';
import { ShoppingCart, Plus, Minus, Search, Filter } from 'lucide-react';
import Link from 'next/link';
import { useState, useMemo } from 'react';

export default function ProductGallery() {
  const dispatch = useDispatch();
  const cartItems = useSelector((state: RootState) => state.cart.items);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            product.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="bg-gray-50 py-12 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Discovery Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Discover Experiences</h2>
            <p className="text-gray-500 mt-2">Find your next adventure or souvenir.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            {/* Search Bar */}
            <div className="relative w-full sm:w-72">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-shadow"
              />
            </div>
            
            {/* Category Filter */}
            <div className="relative w-full sm:w-48">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-4 w-4 text-gray-400" />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-xl leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm appearance-none cursor-pointer transition-shadow"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <Search className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No products found</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
            <button 
              onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
              className="mt-4 text-blue-600 font-medium hover:text-blue-800"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => {
              const cartItem = cartItems.find((item) => item.id === product.id);
              const quantityInCart = cartItem ? cartItem.quantity : 0;
              const isOutOfStock = product.stock === 0;
              const isMaxReached = quantityInCart >= product.stock;

              return (
                <div key={product.id} className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col h-full">
                  <Link href={`/products/${product.id}`} className="block overflow-hidden relative aspect-[4/3] bg-gray-100">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                        <span className="bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                        {product.category}
                        </span>
                        {product.type === 'physical' && (
                            <span className="bg-blue-600/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                            Physical Item
                            </span>
                        )}
                    </div>
                  </Link>
                  
                  <div className="p-6 flex flex-col flex-grow">
                    <Link href={`/products/${product.id}`} className="hover:text-blue-600 transition-colors">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-grow">
                      {product.description}
                    </p>
                    
                    <div className="mt-auto pt-4 border-t border-gray-50">
                      <div className="flex items-end justify-between mb-4">
                        <div>
                          <p className="text-xs text-gray-500 font-medium mb-1">Price</p>
                          <span className="text-2xl font-bold text-gray-900 leading-none">€{product.price}</span>
                        </div>
                        <div className="text-right">
                          {product.stock > 0 ? (
                            <p className="text-xs text-green-600 font-medium">{product.stock} available</p>
                          ) : (
                            <p className="text-xs text-red-500 font-medium">Out of stock</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-2">
                        {isOutOfStock ? (
                          <div className="w-full text-center text-red-500 font-semibold text-sm bg-red-50 px-4 py-3 rounded-xl">Sold Out</div>
                        ) : quantityInCart > 0 ? (
                          <div className="flex items-center justify-between w-full bg-blue-50 border border-blue-100 rounded-xl px-2 py-1">
                            <button 
                              onClick={(e) => { e.preventDefault(); dispatch(updateQuantity({ id: product.id, quantity: quantityInCart - 1 })); }}
                              className="p-2 text-blue-600 hover:bg-white hover:shadow-sm rounded-lg transition-all"
                            >
                              <Minus className="w-5 h-5" />
                            </button>
                            <span className="font-bold text-blue-900 min-w-[30px] text-center select-none text-lg">{quantityInCart}</span>
                            <button 
                              onClick={(e) => { e.preventDefault(); dispatch(updateQuantity({ id: product.id, quantity: quantityInCart + 1 })); }}
                              disabled={isMaxReached}
                              className={`p-2 rounded-lg transition-all ${
                                isMaxReached 
                                  ? 'text-gray-400 cursor-not-allowed' 
                                  : 'text-blue-600 hover:bg-white hover:shadow-sm'
                              }`}
                            >
                              <Plus className="w-5 h-5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => { e.preventDefault(); dispatch(addToCart({ ...product, quantity: 1 })); }}
                            className="w-full flex justify-center items-center space-x-2 bg-gray-900 hover:bg-blue-600 text-white px-4 py-3 rounded-xl transition-colors text-sm font-semibold shadow-sm hover:shadow-md"
                          >
                            <ShoppingCart className="w-4 h-4" />
                            <span>Add to Cart</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
