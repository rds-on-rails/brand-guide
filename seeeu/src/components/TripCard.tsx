"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";

interface TripCardProps {
    id: string;
    title: string;
    price: string;
    imageUrl: string;
    type: string;
    isSale?: boolean;
}

export default function TripCard({ id, title, price, imageUrl, type, isSale = false }: TripCardProps) {
    return (
        <motion.div
            whileHover={{ y: -8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="group relative bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-xl flex flex-col h-full"
        >
            {/* Image Container */}
            <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-gray-100">
                {imageUrl ? (
                    <Image
                        src={imageUrl}
                        alt={title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                        No Image
                    </div>
                )}

                {/* Badges */}
                {isSale && (
                    <div className="absolute top-4 right-0 bg-brand-sale text-white text-xs font-bold px-3 py-1.5 uppercase shadow-md pointer-events-none z-10">
                        Sale
                    </div>
                )}

                {/* Heart Icon (Wishlist) */}
                <button className="absolute top-4 left-4 p-2 bg-white/80 backdrop-blur-sm rounded-full text-gray-400 hover:text-red-500 hover:bg-white transition-all shadow-sm z-10 z-10opacity-0 group-hover:opacity-100 focus:opacity-100 sm:opacity-100">
                    <Heart size={18} />
                </button>
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col flex-grow">
                <p className="text-xs font-semibold text-brand-primary uppercase tracking-wider mb-2">
                    {type.replace("_", " ")}
                </p>

                <h3 className="text-lg font-bold text-foreground leading-snug mb-3 flex-grow line-clamp-2 group-hover:text-brand-primary transition-colors">
                    <Link href={`/trip/${id}`} className="after:absolute after:inset-0">
                        {title}
                    </Link>
                </h3>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                    <div className="flex flex-col">
                        <span className="text-sm text-gray-500">From</span>
                        <span className="text-xl font-extrabold text-foreground">{price}</span>
                    </div>

                    <span className="text-sm font-semibold text-brand-primary group-hover:text-brand-accent transition-colors">
                        Read more &rarr;
                    </span>
                </div>
            </div>
        </motion.div>
    );
}
