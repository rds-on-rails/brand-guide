'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ProductPrice {
  weight: string;
  price: number;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  imageUrl: string;
  prices: ProductPrice[];
  isActive: boolean;
}

interface CatalogStore {
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  getProducts: () => Product[];
  getActiveProducts: () => Product[];
  decreaseStock: (items: { id: string, weight: string, quantity: number }[]) => void;
}

const defaultProducts: Product[] = [
  {
    id: 'gaon-pure-multigrain-17000000',
    name: 'Gaon Pure Multigrain Flour',
    description: 'Chokar (Bran) Sahit cold-pressed stone-ground flour made from 11 diverse grains including Jowar, Bajra, Chana, Makka, and Ragi.',
    category: 'Flour',
    imageUrl: '🌾',
    prices: [
      { weight: '1kg', price: 149, stock: 50 },
      { weight: '5kg', price: 699, stock: 20 }
    ],
    isActive: true
  }
];

export const useCatalogStore = create<CatalogStore>()(
  persist(
    (set, get) => ({
      products: defaultProducts,
      addProduct: (product) => set((state) => ({
        products: [...state.products, { ...product, id: `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` }]
      })),
      updateProduct: (id, updates) => set((state) => ({
        products: state.products.map(p => p.id === id ? { ...p, ...updates } : p)
      })),
      deleteProduct: (id) => set((state) => ({
        products: state.products.filter(p => p.id !== id)
      })),
      getProducts: () => get().products,
      getActiveProducts: () => get().products.filter(p => p.isActive),
      decreaseStock: (items) => set((state) => {
        const newProducts = [...state.products];
        items.forEach(item => {
           const prodIndex = newProducts.findIndex(p => p.id === item.id);
           if (prodIndex !== -1) {
             const priceIndex = newProducts[prodIndex].prices.findIndex(pr => pr.weight === item.weight);
             if (priceIndex !== -1 && newProducts[prodIndex].prices[priceIndex].stock >= item.quantity) {
                 newProducts[prodIndex].prices[priceIndex].stock -= item.quantity;
             }
           }
        });
        return { products: newProducts };
      })
    }),
    {
      name: 'gaon-pure-catalog',
    }
  )
);
