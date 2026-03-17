'use client';

import { useState } from 'react';
import { useCatalogStore, type Product, type ProductPrice } from '@/store/useCatalogStore';
import { Plus, Edit, Trash2, Save, X, ImageIcon } from 'lucide-react';

export default function CatalogManager() {
  const { products, addProduct, updateProduct, deleteProduct } = useCatalogStore();
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Omit<Product, 'id'>>({
    name: '',
    description: '',
    category: 'Flour',
    imageUrl: '🌾',
    prices: [{ weight: '1kg', price: 0, stock: 10 }],
    isActive: true
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: 'Flour',
      imageUrl: '🌾',
      prices: [{ weight: '1kg', price: 0, stock: 10 }],
      isActive: true
    });
    setIsEditing(false);
    setCurrentId(null);
  };

  const handleEdit = (product: Product) => {
    setFormData({
      name: product.name,
      description: product.description,
      category: product.category,
      imageUrl: product.imageUrl,
      prices: [...product.prices],
      isActive: product.isActive
    });
    setCurrentId(product.id);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (isEditing && currentId) {
      updateProduct(currentId, formData);
    } else {
      addProduct(formData);
    }
    resetForm();
  };

  const addPriceOption = () => {
    setFormData({ ...formData, prices: [...formData.prices, { weight: '', price: 0, stock: 10 }] });
  };

  const updatePriceOption = (index: number, field: keyof ProductPrice, value: string | number) => {
    const newPrices = [...formData.prices];
    newPrices[index] = { ...newPrices[index], [field]: value };
    setFormData({ ...formData, prices: newPrices });
  };

  const removePriceOption = (index: number) => {
    const newPrices = formData.prices.filter((_, i) => i !== index);
    setFormData({ ...formData, prices: newPrices });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold font-serif text-brand-secondary">Catalog Management</h2>
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="bg-brand-primary text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-brand-primary-dark transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Product
          </button>
        )}
      </div>

      {isEditing && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-brand-primary/20 mb-8 animate-in slide-in-from-top-4">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg">{currentId ? 'Edit Product' : 'Add New Product'}</h3>
            <button onClick={resetForm} className="text-stone-400 hover:text-stone-600"><X className="w-5 h-5" /></button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Product Name</label>
                <input required type="text" className="w-full px-4 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-brand-primary outline-none" 
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Premium Ragi Flour" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Category</label>
                <select className="w-full px-4 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-brand-primary outline-none"
                  value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                  <option value="Flour">Flour</option>
                  <option value="Grains">Whole Grains</option>
                  <option value="Spices">Spices</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Description</label>
                <textarea required rows={3} className="w-full px-4 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-brand-primary outline-none resize-none" 
                  value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Product details..." />
              </div>

               <div>
                 <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 text-brand-primary border-stone-300 rounded focus:ring-brand-primary"
                      checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} />
                    <span className="text-sm font-medium text-stone-700">Product is Active (Visible on store)</span>
                 </label>
               </div>
            </div>

            <div className="space-y-6">
              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-semibold text-stone-800 text-sm">Packaging & Pricing</h4>
                  <button type="button" onClick={addPriceOption} className="text-xs text-brand-primary font-medium flex items-center gap-1 hover:underline">
                    <Plus className="w-3 h-3" /> Add Option
                  </button>
                </div>
                
                <div className="space-y-3">
                  {formData.prices.map((price, index) => (
                    <div key={index} className="flex gap-3 items-center">
                       <input type="text" className="w-1/3 px-3 py-1.5 rounded-md border border-stone-300 text-sm focus:ring-2 focus:ring-brand-primary outline-none" 
                        placeholder="e.g. 1kg" value={price.weight} onChange={e => updatePriceOption(index, 'weight', e.target.value)} />
                       
                       <div className="relative flex-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 text-sm">₹</span>
                          <input type="number" className="w-full pl-7 pr-3 py-1.5 rounded-md border border-stone-300 text-sm focus:ring-2 focus:ring-brand-primary outline-none" 
                            placeholder="Amount" value={price.price} onChange={e => updatePriceOption(index, 'price', Number(e.target.value))} />
                       </div>
                       
                       <div className="w-24">
                          <input type="number" className="w-full px-3 py-1.5 rounded-md border border-stone-300 text-sm focus:ring-2 focus:ring-brand-primary outline-none" 
                            placeholder="Stock" value={price.stock} onChange={e => updatePriceOption(index, 'stock', Number(e.target.value))} />
                       </div>

                       {formData.prices.length > 1 && (
                         <button type="button" onClick={() => removePriceOption(index)} className="text-stone-400 hover:text-red-500 p-1">
                           <X className="w-4 h-4" />
                         </button>
                       )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
                <h4 className="font-semibold text-stone-800 text-sm mb-2">Image Asset (Mock)</h4>
                <div className="flex items-center gap-3">
                   <div className="w-12 h-12 bg-white rounded-lg border border-stone-200 flex items-center justify-center text-2xl">
                     {formData.imageUrl || <ImageIcon className="w-5 h-5 text-stone-400" />}
                   </div>
                   <input type="text" className="flex-1 px-3 py-1.5 rounded-md border border-stone-300 text-sm focus:ring-2 focus:ring-brand-primary outline-none" 
                      placeholder="Emoji or Image URL" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} />
                </div>
                 <p className="text-xs text-stone-500 mt-2">For this prototype, use emojis (🌾, 📦, 🥖) or valid image URLs.</p>
              </div>

              <div className="flex justify-end pt-2">
                <button 
                  onClick={handleSave}
                  disabled={!formData.name || formData.prices.length === 0}
                  className="bg-brand-secondary hover:bg-brand-primary text-white px-6 py-2.5 rounded-lg font-medium shadow-md transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" /> {currentId ? 'Update Product' : 'Save Product'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product List */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        <table className="w-full text-left bg-white">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr>
              <th className="p-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">Product</th>
              <th className="p-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">Pricing Options</th>
              <th className="p-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">Status</th>
              <th className="p-4 text-xs font-semibold text-stone-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {products.length === 0 ? (
              <tr><td colSpan={4} className="p-8 text-center text-stone-500">No products in catalog.</td></tr>
            ) : (
              products.map(product => (
                <tr key={product.id} className="hover:bg-stone-50/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-stone-100 rounded-lg flex items-center justify-center text-xl shadow-inner border border-stone-200/50">
                        {product.imageUrl}
                      </div>
                      <div>
                        <div className="font-semibold text-stone-800">{product.name}</div>
                        <div className="text-xs text-stone-500">{product.category}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1.5">
                      {product.prices.map((p, i) => (
                        <span key={i} className="inline-flex items-center text-xs bg-brand-cream border border-brand-primary/20 text-stone-700 px-2 py-1 rounded-md">
                          <span className="font-semibold mr-1">{p.weight}:</span> ₹{p.price} <span className="text-[10px] text-stone-400 ml-1">({p.stock} left)</span>
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      product.isActive ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'
                    }`}>
                      {product.isActive ? 'Active' : 'Draft'}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => handleEdit(product)} className="text-stone-400 hover:text-brand-primary p-1.5 rounded-lg hover:bg-brand-primary/10 transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteProduct(product.id)} className="text-stone-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
