"use client";

import { use } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Clock, MapPin, CheckCircle2, Ticket } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { trips } from "@/data/trips";
import { notFound } from "next/navigation";

export default function TripDetails({ params }: { params: Promise<{ id: string }> }) {
    const unwrappedParams = use(params);
    const trip = trips.find((t) => t.id === unwrappedParams.id);

    if (!trip) {
        notFound();
    }

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Header />

            <main className="flex-grow pt-8 pb-20">
                <div className="max-w-7xl mx-auto px-4">

                    {/* Back Button */}
                    <Link href="/#trips" className="inline-flex items-center gap-2 text-gray-500 hover:text-brand-primary font-medium mb-8 transition-colors">
                        <ArrowLeft size={18} /> Back to all trips
                    </Link>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                        {/* Main Content Area */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Image Hero */}
                            <div className="relative h-80 md:h-[500px] w-full rounded-3xl overflow-hidden shadow-sm">
                                <Image
                                    src={trip.imageUrl}
                                    alt={trip.title}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                                {trip.isSale && (
                                    <div className="absolute top-6 left-6 bg-brand-sale text-white px-4 py-2 font-bold uppercase tracking-wider rounded-md shadow-lg z-10">
                                        Sale Active
                                    </div>
                                )}
                            </div>

                            {/* Title & Description Placeholder */}
                            <div>
                                <span className="text-brand-primary font-bold uppercase tracking-widest text-sm mb-3 block">
                                    {trip.type.replace("_", " ")}
                                </span>
                                <h1 className="text-3xl md:text-5xl font-bold text-brand-secondary leading-tight mb-6">
                                    {trip.title}
                                </h1>
                                <p className="text-lg text-gray-600 leading-relaxed mb-6">
                                    Experience the ultimate journey to one of Europe's most iconic destinations. This trip is specially curated for Indian travelers looking for a comfortable, budget-friendly, and unforgettable adventure. We handle the logistics so you can focus on creating memories.
                                </p>

                                <div className="flex flex-wrap gap-6 border-y border-gray-200 py-6 my-8">
                                    <div className="flex items-center gap-3">
                                        <Clock className="text-brand-accent w-6 h-6" />
                                        <div>
                                            <p className="text-sm text-gray-500 font-medium">Duration</p>
                                            <p className="font-semibold text-foreground capitalize">{trip.type.replace("_", " ")}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <MapPin className="text-brand-accent w-6 h-6" />
                                        <div>
                                            <p className="text-sm text-gray-500 font-medium">Departures</p>
                                            <p className="font-semibold text-foreground">Belgium / Luxembourg</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-2xl font-bold text-brand-secondary mb-4">What's Included</h3>
                                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <li className="flex items-center gap-3 text-gray-700">
                                            <CheckCircle2 className="text-brand-primary w-5 h-5 flex-shrink-0" /> Local guide assistance
                                        </li>
                                        <li className="flex items-center gap-3 text-gray-700">
                                            <CheckCircle2 className="text-brand-primary w-5 h-5 flex-shrink-0" /> Comfortable transportation
                                        </li>
                                        <li className="flex items-center gap-3 text-gray-700">
                                            <CheckCircle2 className="text-brand-primary w-5 h-5 flex-shrink-0" /> Safe group environment
                                        </li>
                                        <li className="flex items-center gap-3 text-gray-700">
                                            <CheckCircle2 className="text-brand-primary w-5 h-5 flex-shrink-0" /> Indian-friendly itineraries
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Sticky Sidebar / Booking Widget */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-28 bg-white border border-gray-100 rounded-2xl shadow-xl p-6 lg:p-8">
                                <div className="text-center pb-6 border-b border-gray-100 mb-6">
                                    <p className="text-sm text-gray-500 font-medium mb-1">Price from</p>
                                    <div className="text-4xl font-extrabold text-foreground mb-2">{trip.price}</div>
                                    <p className="text-sm text-brand-primary font-medium flex items-center justify-center gap-1">
                                        <Ticket size={16} /> Best Price Guaranteed
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <button className="w-full bg-brand-primary hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5">
                                        Add to Cart
                                    </button>
                                    <button className="w-full bg-orange-50 hover:bg-orange-100 text-brand-accent font-bold py-4 rounded-xl transition-colors border border-orange-200">
                                        Contact for Group Booking
                                    </button>
                                </div>

                                <p className="text-center text-xs text-gray-500 mt-6 pt-6 border-t border-gray-100">
                                    Calling hours: 2-5 PM Tue-Fri<br />
                                    <a href="tel:+32497883883" className="font-semibold text-brand-primary hover:underline">+32 497 883 883</a>
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
