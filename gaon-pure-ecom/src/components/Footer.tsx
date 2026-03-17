import Link from 'next/link';
import { Facebook, Instagram, Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-brand-secondary-dark text-stone-300 py-12 px-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] border-t border-brand-primary/20 mt-20">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4 col-span-1 md:col-span-2">
          <Link href="/" className="font-serif text-3xl font-bold text-brand-cream tracking-tight inline-block">
            Gaon <span className="text-brand-primary">Pure</span>
          </Link>
          <p className="max-w-sm text-sm leading-relaxed opacity-80 pt-2">
            Bringing you the traditional essence of pure, cold-pressed stone-ground flour. 
            Experience health and authenticity in every bite with our unique blend of 11 diverse grains, 
            Chokar (Bran) Sahit.
          </p>
          <div className="flex gap-4 pt-4">
            <a href="#" className="hover:text-brand-primary transition-colors p-2 bg-stone-800/50 rounded-full"><Facebook className="w-5 h-5" /></a>
            <a href="#" className="hover:text-brand-primary transition-colors p-2 bg-stone-800/50 rounded-full"><Instagram className="w-5 h-5" /></a>
            <a href="#" className="hover:text-brand-primary transition-colors p-2 bg-stone-800/50 rounded-full"><Twitter className="w-5 h-5" /></a>
          </div>
        </div>
        
        <div className="space-y-4">
          <h4 className="font-serif text-lg font-semibold text-brand-cream border-b border-brand-primary/30 pb-2 inline-block">Quick Links</h4>
          <ul className="space-y-3 text-sm">
            <li><Link href="/" className="hover:text-brand-primary transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-brand-primary"></span>Home</Link></li>
            <li><Link href="/#products" className="hover:text-brand-primary transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-brand-primary"></span>Shop Products</Link></li>
            <li><Link href="/#ingredients" className="hover:text-brand-primary transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-brand-primary"></span>Our Ingredients</Link></li>
            <li><Link href="/#processing" className="hover:text-brand-primary transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-brand-primary"></span>Processing Method</Link></li>
          </ul>
        </div>

        <div className="space-y-4">
          <h4 className="font-serif text-lg font-semibold text-brand-cream border-b border-brand-primary/30 pb-2 inline-block">Contact</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-brand-primary mt-1">📍</span>
              <span className="opacity-80">123 Village Road,<br/>Traditional District, 452001</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-brand-primary">📞</span>
              <a href="tel:+919876543210" className="hover:text-brand-primary transition-colors opacity-80">+91 98765 43210</a>
            </li>
             <li className="flex items-center gap-2">
              <span className="text-brand-primary">✉️</span>
              <a href="mailto:hello@gaonpure.com" className="hover:text-brand-primary transition-colors opacity-80">hello@gaonpure.com</a>
            </li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto mt-12 pt-8 border-t border-stone-700/50 text-center text-xs opacity-60">
        <p>&copy; {new Date().getFullYear()} Gaon Pure. All rights reserved.</p>
      </div>
    </footer>
  );
}
