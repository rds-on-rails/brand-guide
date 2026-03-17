'use client';

import { ProductCard } from '@/components/ProductCard';
import { ArrowRight, Leaf, Waves, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useCatalogStore } from '@/store/useCatalogStore';
import { useEffect, useState } from 'react';

export default function Home() {
  const ingredients = ['Jowar', 'Bajra', 'Chana', 'Makka', 'Ragi', 'Moong', 'Soybeen', 'Jau', 'Sawa', 'Kodo', 'Kutki'];
  
  const { getActiveProducts } = useCatalogStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeProducts = mounted ? getActiveProducts() : [];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-brand-cream border-b border-brand-primary/20">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-brand-secondary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4"></div>
          {/* subtle paper texture overlay */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/rice-paper.png')] opacity-40 mix-blend-overlay pointer-events-none"></div>
        </div>

        <div className="container mx-auto px-4 z-10 grid md:grid-cols-2 gap-12 items-center pt-20">
           <div className="space-y-8 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-brand-primary/20 shadow-sm">
                <Leaf className="w-4 h-4 text-brand-primary" />
                <span className="text-sm font-semibold text-brand-secondary tracking-wide uppercase">100% Traditional & Pure</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold font-serif text-brand-secondary leading-[1.1]">
                Nourishing life <br/>
                <span className="text-brand-primary italic">the traditional way.</span>
              </h1>
              <p className="text-lg md:text-xl text-stone-600 leading-relaxed max-w-lg">
                Experience the authentic taste and health benefits of our Chokar Sahit cold-pressed stone-ground multigrain flour. A perfect blend of 11 diverse grains.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link 
                  href="#products" 
                  className="bg-brand-primary hover:bg-brand-primary-dark text-white px-8 py-4 rounded-full font-bold flex items-center justify-center gap-2 transition-all duration-300 shadow-xl shadow-brand-primary/20 hover:-translate-y-1 group border-2 border-transparent"
                >
                  Shop Now
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link 
                  href="#processing" 
                  className="bg-white hover:bg-brand-cream text-brand-secondary border-2 border-brand-secondary/10 hover:border-brand-primary/50 px-8 py-4 rounded-full font-bold flex items-center justify-center gap-2 transition-all duration-300 shadow-sm"
                >
                  Our Process
                </Link>
              </div>
           </div>

           <div className="relative h-[400px] md:h-[600px] w-full flex items-center justify-center mt-12 md:mt-0">
             {/* Decorative element substituting for an image */}
             <div className="absolute inset-0 bg-gradient-to-tr from-brand-secondary to-brand-primary rounded-[80px] rotate-3 opacity-10 animate-pulse"></div>
             <div className="relative w-72 h-72 md:w-96 md:h-96 md:-rotate-6 bg-white rounded-3xl shadow-2xl p-4 flex flex-col items-center justify-center border-8 border-brand-cream transform transition-transform duration-700 hover:rotate-0 hover:scale-105">
                 <div className="text-9xl mb-4">🌾</div>
                 <h2 className="font-serif text-2xl font-bold text-brand-secondary text-center">Multi<span className="text-brand-primary">grain</span><br/>Flour</h2>
             </div>
             
             {/* Floating badge */}
             <div className="absolute top-1/4 -right-4 md:right-8 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-3 animate-[bounce_4s_infinite]">
                <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-xs text-stone-500 uppercase tracking-wider">Quality</p>
                  <p className="font-serif font-bold text-brand-secondary text-lg leading-tight">100% Pure</p>
                </div>
             </div>
           </div>
        </div>
      </section>

      {/* Philosophy / Features Section */}
      <section className="py-24 bg-white relative z-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
             <h2 className="text-xs font-bold text-brand-primary uppercase tracking-widest">Our Uncompromising Standards</h2>
             <h3 className="text-4xl md:text-5xl font-serif font-bold text-brand-secondary">What makes us truly Pure?</h3>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Feat 1 */}
            <div id="ingredients" className="group space-y-6 pt-12 md:pt-0 relative">
               <div className="md:absolute top-0 right-0 h-full w-px bg-stone-100 hidden md:block"></div>
               <div className="w-16 h-16 rounded-2xl bg-brand-cream border border-brand-primary/20 flex items-center justify-center text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-colors duration-500 shadow-sm">
                  <Leaf className="w-8 h-8" />
               </div>
               <h4 className="text-2xl font-serif font-bold text-brand-secondary">Diverse Ingredient Blend</h4>
               <p className="text-stone-600 leading-relaxed text-lg">
                 Our flour is masterfully composed of a wide variety of 11 distinct grains. Each bringing its unique nutritional profile.
               </p>
               <div className="flex flex-wrap gap-2 pt-4">
                 {ingredients.map(ingredient => (
                   <span key={ingredient} className="text-xs font-semibold bg-brand-primary/10 text-brand-primary-dark px-3 py-1.5 rounded-full border border-brand-primary/20">{ingredient}</span>
                 ))}
               </div>
            </div>

            {/* Feat 2 */}
            <div id="processing" className="group space-y-6 pt-12 md:pt-0 relative">
              <div className="md:absolute top-0 right-0 h-full w-px bg-stone-100 hidden md:block"></div>
               <div className="w-16 h-16 rounded-2xl bg-brand-cream border border-brand-primary/20 flex items-center justify-center text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-colors duration-500 shadow-sm">
                  <Waves className="w-8 h-8" />
               </div>
               <h4 className="text-2xl font-serif font-bold text-brand-secondary">Traditional Processing</h4>
               <p className="text-stone-600 leading-relaxed text-lg">
                 We proudly use <strong>Cold Pressed Stone Grinding at Slow RPM</strong>. This ancient method helps retain essential nutrients and natural oils often destroyed in modern high-speed milling.
               </p>
            </div>

            {/* Feat 3 */}
            <div id="integrity" className="group space-y-6 pt-12 md:pt-0">
               <div className="w-16 h-16 rounded-2xl bg-brand-cream border border-brand-primary/20 flex items-center justify-center text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-colors duration-500 shadow-sm">
                  <CheckCircle2 className="w-8 h-8" />
               </div>
               <h4 className="text-2xl font-serif font-bold text-brand-secondary">Whole Grain Integrity</h4>
               <p className="text-stone-600 leading-relaxed text-lg">
                 Marketed proudly as <strong>"Chokar (Bran) Sahit,"</strong> meaning it retains the fibrous outer layer of the grain for significantly better digestive health and sustained energy.
               </p>
            </div>
          </div>
        </div>
      </section>

      {/* Shop Section */}
      <section id="products" className="py-24 bg-brand-cream border-y border-brand-primary/10 relative overflow-hidden">
        {/* subtle background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#8a6a43_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.03]"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
             <h2 className="text-xs font-bold text-brand-primary uppercase tracking-widest">Store</h2>
             <h3 className="text-4xl md:text-5xl font-serif font-bold text-brand-secondary">Our Catalog</h3>
             <p className="text-stone-600 text-lg">Discover our range of authentic, traditionally processed products.</p>
          </div>

          <div className="max-w-5xl mx-auto space-y-12">
            {!mounted ? (
              <div className="text-center text-stone-500 py-12">Loading products...</div>
            ) : activeProducts.length === 0 ? (
               <div className="text-center text-stone-500 py-12 bg-white rounded-3xl shadow-sm border border-stone-100">
                  <p className="text-lg">Our catalog is currently being updated. Please check back soon!</p>
               </div>
            ) : (
               activeProducts.map(product => (
                 <ProductCard key={product.id} product={product} />
               ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
