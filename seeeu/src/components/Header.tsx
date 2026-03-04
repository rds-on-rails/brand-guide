"use client";

import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, Menu, X, Facebook, Instagram } from "lucide-react";
import { useState } from "react";

export default function Header() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <header className="w-full relative z-50 shadow-sm bg-white">
            {/* Top Bar */}
            <div className="bg-brand-primary text-white text-xs py-2 px-4 transition-colors">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
                    <div className="flex items-center gap-4">
                        <a href="tel:+32497883883" className="flex items-center gap-1.5 hover:text-gray-200 transition-colors">
                            <Phone size={14} />
                            <span>+32 497 883 883</span>
                        </a>
                        <span className="hidden sm:inline opacity-70">|</span>
                        <a href="mailto:See-EU@Live.be" className="flex items-center gap-1.5 hover:text-gray-200 transition-colors">
                            <Mail size={14} />
                            <span>See-EU@Live.be</span>
                        </a>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/my-account" className="hover:text-gray-200 transition-colors font-semibold tracking-wide">
                            Login / My Account
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main Header */}
            <div className="max-w-7xl mx-auto px-4 py-4 md:py-6 flex justify-between items-center">
                {/* Logo */}
                <Link href="/" className="relative flex items-center group">
                    <Image
                        src="/logo.png"
                        alt="See-EU Logo"
                        width={180}
                        height={60}
                        className="w-auto h-12 sm:h-14 lg:h-16 object-contain group-hover:opacity-90 transition-opacity"
                        priority
                    />
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center space-x-8">
                    <Link href="/" className="text-foreground tracking-wide font-semibold hover:text-brand-accent transition-colors relative after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-0.5 after:bg-brand-accent hover:after:w-full after:transition-all">
                        TRIPS
                    </Link>
                    <Link href="/faq" className="text-foreground tracking-wide font-semibold hover:text-brand-accent transition-colors relative after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-0.5 after:bg-brand-accent hover:after:w-full after:transition-all">
                        FAQ
                    </Link>
                    <div className="flex items-center gap-3 border-l border-gray-200 pl-6 ml-2">
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-brand-primary p-2 rounded-full hover:bg-blue-50 transition-colors">
                            <Facebook size={20} />
                        </a>
                        <a href="https://www.instagram.com/seeeu79" target="_blank" rel="noopener noreferrer" className="text-brand-primary p-2 rounded-full hover:bg-blue-50 transition-colors">
                            <Instagram size={20} />
                        </a>
                    </div>
                </nav>

                {/* Mobile Toggle */}
                <button
                    className="p-2 md:hidden text-brand-primary bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Nav */}
            {isOpen && (
                <div className="md:hidden absolute top-full left-0 w-full bg-white border-t border-gray-100 shadow-lg py-4 px-6 flex flex-col gap-4 animate-in slide-in-from-top-4 fade-in duration-200 z-40">
                    <Link href="/" className="text-lg font-semibold text-foreground py-2 border-b border-gray-50 hover:text-brand-primary" onClick={() => setIsOpen(false)}>
                        TRIPS
                    </Link>
                    <Link href="/faq" className="text-lg font-semibold text-foreground py-2 border-b border-gray-50 hover:text-brand-primary" onClick={() => setIsOpen(false)}>
                        FAQ
                    </Link>
                    <Link href="/my-account" className="text-lg font-semibold text-foreground py-2 border-b border-gray-50 hover:text-brand-primary" onClick={() => setIsOpen(false)}>
                        Login
                    </Link>
                    <div className="flex items-center gap-4 pt-2">
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-brand-primary p-2 bg-blue-50 rounded-full">
                            <Facebook size={20} />
                        </a>
                        <a href="https://www.instagram.com/seeeu79" target="_blank" rel="noopener noreferrer" className="text-brand-primary p-2 bg-blue-50 rounded-full">
                            <Instagram size={20} />
                        </a>
                    </div>
                </div>
            )}
        </header>
    );
}
