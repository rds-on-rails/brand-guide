"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Plane, ShieldCheck, Banknote, SlidersHorizontal, ChevronDown } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TripCard from "@/components/TripCard";
import { trips } from "@/data/trips";

export default function Home() {
  const [locationFilter, setLocationFilter] = useState("All");
  const [priceFilter, setPriceFilter] = useState("All");
  const [sortBy, setSortBy] = useState("Default sorting");

  const locations = ["All", "Belgium", "Luxembourg", "Netherlands", "Tickets Only"];
  const prices = ["All", "Under €50", "€50 - €100", "€100+"];
  const sortOptions = [
    "Default sorting",
    "Sort by popularity",
    "Sort by average rating",
    "Sort by newness",
    "Sort by price: low to high",
    "Sort by price: high to low"
  ];

  const filteredAndSortedTrips = useMemo(() => {
    let result = [...trips];

    // Location Filter
    if (locationFilter !== "All") {
      result = result.filter(trip => trip.departure.includes(locationFilter));
    }

    // Price Filter
    if (priceFilter !== "All") {
      result = result.filter(trip => {
        if (trip.priceValue === null) return false;
        if (priceFilter === "Under €50") return trip.priceValue < 50;
        if (priceFilter === "€50 - €100") return trip.priceValue >= 50 && trip.priceValue <= 100;
        if (priceFilter === "€100+") return trip.priceValue > 100;
        return true;
      });
    }

    // Sorting
    switch (sortBy) {
      case "Sort by popularity":
        result.sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
        break;
      case "Sort by average rating":
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "Sort by newness":
        result.sort((a, b) => (b.isNew === a.isNew ? 0 : b.isNew ? 1 : -1));
        break;
      case "Sort by price: low to high":
        result.sort((a, b) => {
          if (a.priceValue === null) return 1;
          if (b.priceValue === null) return -1;
          return a.priceValue - b.priceValue;
        });
        break;
      case "Sort by price: high to low":
        result.sort((a, b) => {
          if (a.priceValue === null) return 1;
          if (b.priceValue === null) return -1;
          return b.priceValue - a.priceValue;
        });
        break;
      default:
        break;
    }

    return result;
  }, [locationFilter, priceFilter, sortBy]);

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

        {/* Trips Grid & Filters */}
        <section id="trips" className="py-20 max-w-7xl mx-auto px-4">
          <div className="mb-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
              <div>
                <p className="text-brand-primary font-bold uppercase tracking-widest text-sm mb-2">Discover</p>
                <h2 className="text-3xl md:text-5xl font-bold text-brand-secondary">ALL PRODUCTS</h2>
              </div>

              <div className="flex items-center gap-2 text-gray-500">
                <p>Showing {filteredAndSortedTrips.length} results</p>
              </div>
            </div>

            {/* Filter and Sort Toolbar */}
            <div className="flex flex-col lg:flex-row items-center justify-between bg-white p-4 rounded-2xl border border-gray-200 shadow-sm gap-4">

              <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
                <div className="flex items-center gap-2 text-brand-secondary font-semibold">
                  <SlidersHorizontal size={18} /> Filters
                </div>

                {/* Location Filter */}
                <div className="relative w-full sm:w-auto">
                  <select
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="w-full sm:w-auto appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all cursor-pointer font-medium"
                  >
                    <option disabled>From Location</option>
                    {locations.map(loc => (
                      <option key={loc} value={loc}>{loc === "All" ? "All Locations" : loc}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>

                {/* Price Filter */}
                <div className="relative w-full sm:w-auto">
                  <select
                    value={priceFilter}
                    onChange={(e) => setPriceFilter(e.target.value)}
                    className="w-full sm:w-auto appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all cursor-pointer font-medium"
                  >
                    <option disabled>Price Range</option>
                    {prices.map(price => (
                      <option key={price} value={price}>{price === "All" ? "All Prices" : price}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
              </div>

              {/* Sorting */}
              <div className="relative w-full lg:w-64">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full appearance-none bg-brand-secondary text-white py-2.5 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-secondary/50 transition-all cursor-pointer font-medium shadow-md"
                >
                  {sortOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 pointer-events-none" size={16} />
              </div>

            </div>
          </div>

          {filteredAndSortedTrips.length > 0 ? (
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
            >
              {filteredAndSortedTrips.map((trip) => (
                <TripCard key={trip.id} {...trip} />
              ))}
            </motion.div>
          ) : (
            <div className="py-20 text-center">
              <h3 className="text-2xl font-bold text-gray-400 mb-2">No trips found</h3>
              <p className="text-gray-500">Try adjusting your filters to see more results.</p>
              <button
                onClick={() => { setLocationFilter("All"); setPriceFilter("All"); }}
                className="mt-6 text-brand-primary font-semibold hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}

          {filteredAndSortedTrips.length > 0 && (
            <div className="mt-16 text-center">
              <button className="border-2 border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white font-bold py-3 px-8 rounded-full transition-colors">
                Load More Trips
              </button>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
