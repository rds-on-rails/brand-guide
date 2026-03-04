"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Plane, ShieldCheck, Banknote } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TripCard from "@/components/TripCard";
import { trips } from "@/data/trips";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50/50">
      <Header />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative h-[65vh] min-h-[500px] w-full flex items-center justify-center overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <Image
              src="https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&q=80&w=2000"
              alt="Europe Landscape"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-brand-secondary/60 mix-blend-multiply" />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-50/90 via-transparent to-transparent" />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-6 drop-shadow-md text-balance">
                See Europe Through <br className="hidden md:block" /> Indian Eyes
              </h1>
              <p className="text-xl md:text-2xl text-gray-100 max-w-3xl mx-auto font-light mb-10 drop-shadow">
                Showing Europe to Indians in a safe, economic & friendly way
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a href="#trips" className="bg-brand-accent hover:bg-orange-500 text-white font-semibold py-4 px-8 rounded-full transition-all shadow-lg hover:shadow-orange-500/30 flex items-center gap-2 transform hover:-translate-y-1">
                  View All Trips <ArrowRight size={20} />
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Value Proposition */}
        <section className="py-16 bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
              <div className="flex flex-col items-center text-center p-6 bg-blue-50/50 rounded-2xl">
                <div className="w-14 h-14 bg-brand-primary text-white rounded-full flex items-center justify-center mb-4 shadow-md">
                  <ShieldCheck size={28} />
                </div>
                <h3 className="text-xl font-bold text-brand-secondary mb-2">Safe Travels</h3>
                <p className="text-gray-600">Travel with peace of mind. We prioritize your safety and comfort at every destination.</p>
              </div>
              <div className="flex flex-col items-center text-center p-6 bg-blue-50/50 rounded-2xl">
                <div className="w-14 h-14 bg-brand-primary text-white rounded-full flex items-center justify-center mb-4 shadow-md">
                  <Banknote size={28} />
                </div>
                <h3 className="text-xl font-bold text-brand-secondary mb-2">Economic</h3>
                <p className="text-gray-600">Experience premium European tours tailored for the best value and budget.</p>
              </div>
              <div className="flex flex-col items-center text-center p-6 bg-blue-50/50 rounded-2xl">
                <div className="w-14 h-14 bg-brand-primary text-white rounded-full flex items-center justify-center mb-4 shadow-md">
                  <Plane size={28} />
                </div>
                <h3 className="text-xl font-bold text-brand-secondary mb-2">Friendly Service</h3>
                <p className="text-gray-600">Our team ensures a warm, welcoming experience specifically designed for Indian travelers.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Trips Grid */}
        <section id="trips" className="py-20 max-w-7xl mx-auto px-4">
          <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="text-brand-primary font-bold uppercase tracking-widest text-sm mb-2">Discover</p>
              <h2 className="text-3xl md:text-5xl font-bold text-brand-secondary">ALL PRODUCTS</h2>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="px-4 py-2 bg-brand-primary text-white text-sm font-semibold rounded-full shadow-sm cursor-pointer">All (15)</span>
              <span className="px-4 py-2 hover:bg-gray-100 text-gray-600 text-sm font-semibold rounded-full transition-colors cursor-pointer border border-gray-200">From Belgium (13)</span>
              <span className="px-4 py-2 hover:bg-gray-100 text-gray-600 text-sm font-semibold rounded-full transition-colors cursor-pointer border border-gray-200">Luxembourg (6)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {trips.map((trip) => (
              <TripCard key={trip.id} {...trip} />
            ))}
          </div>

          <div className="mt-16 text-center">
            <button className="border-2 border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white font-bold py-3 px-8 rounded-full transition-colors">
              Load More Trips
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
