'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import type { Product } from '@/store/useCatalogStore';

export function ProductCard({ product }: { product: Product }) {
  const [selectedWeight, setSelectedWeight] = useState(product.prices[0]?.weight);
  const addItem = useCartStore((state) => state.addItem);

  const currentPriceOption = product.prices.find(p => p.weight === selectedWeight) || product.prices[0];

  const handleAddToCart = () => {
    if (!currentPriceOption) return;
    
    addItem({
      id: product.id,
      name: product.name,
      price: currentPriceOption.price,
      image: product.imageUrl,
      weight: selectedWeight,
    });
  };

  if (!currentPriceOption) return null;

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 flex flex-col md:flex-row gap-8 shadow-xl border border-stone-100/50 hover:shadow-2xl transition-all duration-300">
      <div className="w-full md:w-1/2 aspect-square md:aspect-auto bg-gradient-to-br from-brand-accent/30 to-brand-primary/10 rounded-2xl flex flex-col items-center justify-center p-8 relative overflow-hidden group">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/rice-paper.png')] opacity-40 mix-blend-overlay pointer-events-none"></div>
        <div className="w-48 h-48 md:w-64 md:h-64 bg-white rounded-full shadow-2xl flex items-center justify-center text-7xl md:text-9xl border-8 border-white/50 relative z-10 transform group-hover:scale-105 transition-transform duration-500">
          {product.imageUrl}
          <div className="absolute -bottom-4 bg-brand-secondary text-brand-cream text-sm font-bold px-4 py-1.5 rounded-full tracking-wider uppercase border-2 border-white shadow-lg">{product.category}</div>
        </div>
      </div>
      
      <div className="w-full md:w-1/2 flex flex-col justify-center">
        <div className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-primary uppercase tracking-wider bg-brand-primary/10 px-3 py-1 rounded-full w-fit">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-primary"></span>
          100% Natural Process
        </div>
        <h2 className="text-3xl md:text-4xl font-serif font-bold tracking-tight text-brand-secondary mt-3 mb-4 leading-tight">
          {product.name}
        </h2>
        <p className="text-stone-600 mb-8 leading-relaxed text-lg">
          {product.description}
        </p>
        
        <div className="space-y-4 mb-8">
          <h3 className="text-sm font-semibold text-stone-900 uppercase tracking-wider border-b border-stone-200 pb-2">Select Packaging</h3>
          <div className="flex flex-wrap gap-4">
            {product.prices.map((priceOption) => (
              <button
                key={priceOption.weight}
                onClick={() => setSelectedWeight(priceOption.weight)}
                className={`flex-1 min-w-[120px] py-4 px-6 rounded-xl border-2 transition-all duration-300 relative overflow-hidden ${
                  selectedWeight === priceOption.weight
                    ? 'border-brand-primary bg-brand-primary/5 text-brand-secondary shadow-md scale-100'
                    : 'border-stone-200 text-stone-500 hover:border-brand-primary/30 hover:bg-stone-50 hover:scale-[1.02]'
                }`}
              >
                {selectedWeight === priceOption.weight && <div className="absolute top-0 right-0 w-8 h-8 bg-brand-primary transform rotate-45 translate-x-4 -translate-y-4"></div>}
                <div className="font-bold text-xl relative z-10">{priceOption.weight}</div>
                <div className={`text-sm mt-1 relative z-10 flex flex-col items-center gap-1 ${selectedWeight === priceOption.weight ? 'text-brand-primary font-medium' : 'text-stone-400'}`}>
                  <span>₹{priceOption.price}</span>
                  {priceOption.stock > 0 ? (
                    <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded leading-none border border-green-200">{priceOption.stock} in stock</span>
                  ) : (
                    <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded leading-none border border-red-200">Out of stock</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between mt-auto">
          <div className="font-serif">
            <span className="text-sm text-stone-500 block mb-1">Total Price</span>
            <span className="text-4xl font-bold text-brand-secondary block">₹{currentPriceOption.price}</span>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={currentPriceOption.stock === 0}
            className="bg-brand-secondary hover:bg-brand-primary text-white px-8 py-4 md:px-10 md:py-5 rounded-full font-bold flex items-center gap-3 transition-all duration-300 hover:shadow-xl hover:shadow-brand-primary/20 hover:-translate-y-1 group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
          >
            Add to Cart
            <span className="bg-white/20 p-1 rounded-full group-hover:bg-white group-hover:text-brand-primary transition-colors">
              <Plus className="w-5 h-5" />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
