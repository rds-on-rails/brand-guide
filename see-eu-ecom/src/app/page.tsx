'use client';
import Navbar from '@/components/Navbar';
import ProductGallery from '@/components/ProductGallery';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>
        {/* Hero Section */}
        <div className="bg-blue-600 py-16 text-center text-white px-4">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">See Europe through Indian eyes</h1>
          <p className="text-xl max-w-2xl mx-auto opacity-90">Discover the best day trips and magical experiences across Europe.</p>
        </div>

        {/* Product Gallery */}
        <ProductGallery />
      </main>
    </div>
  );
}
