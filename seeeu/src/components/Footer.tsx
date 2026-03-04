import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-brand-secondary text-white pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-3 gap-12">
                {/* Contact Info */}
                <div className="space-y-6">
                    <h3 className="text-xl font-bold text-brand-accent mb-4">Contact your own See-EU Team</h3>
                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <Mail className="w-5 h-5 text-gray-400 mt-1" />
                            <div>
                                <p className="font-semibold">WRITE US</p>
                                <a href="mailto:See-EU@Live.be" className="text-gray-300 hover:text-white transition-colors">See-EU@Live.be</a>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Phone className="w-5 h-5 text-gray-400 mt-1" />
                            <div>
                                <p className="font-semibold">CALL US</p>
                                <p className="text-gray-300 text-sm mb-1 leading-relaxed">
                                    (WhatsApp only in case of urgent inquiries)<br />
                                    Calling hours are between 2 to 5 PM from Tuesday to Friday (closed on Mondays, weekends & during public holidays in Belgium)
                                </p>
                                <a href="tel:+32497883883" className="text-brand-accent hover:text-orange-400 font-medium transition-colors">+32 497 883 883</a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Office Details */}
                <div className="space-y-6">
                    <h3 className="text-xl font-bold text-gray-100 mb-4">Office</h3>
                    <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                        <div className="text-gray-300 space-y-1">
                            <p className="font-medium text-white">See-Globe (BV)</p>
                            <p>Terneuzenlaan 38</p>
                            <p>9000 GENT (Belgium)</p>
                            <p className="pt-2 text-sm text-gray-400">BTW / TVA / VAT Nr: BE 680852007</p>
                        </div>
                    </div>
                </div>

                {/* Quick Links */}
                <div className="space-y-6">
                    <h3 className="text-xl font-bold text-gray-100 mb-4">Quick Links</h3>
                    <ul className="space-y-3">
                        <li>
                            <Link href="/" className="text-gray-300 hover:text-brand-accent hover:underline transition-all">All Trips</Link>
                        </li>
                        <li>
                            <Link href="/faq" className="text-gray-300 hover:text-brand-accent hover:underline transition-all">FAQ</Link>
                        </li>
                        <li>
                            <Link href="/my-account" className="text-gray-300 hover:text-brand-accent hover:underline transition-all">My Account / Login</Link>
                        </li>
                        <li>
                            <Link href="/cart" className="text-gray-300 hover:text-brand-accent hover:underline transition-all">Shopping Cart</Link>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Copyright */}
            <div className="max-w-7xl mx-auto px-4 mt-16 pt-8 border-t border-gray-700/50 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
                <p className="text-sm text-gray-400">
                    See-EU is a TM of the See-Globe BV Enterprise. All rights reserved. &copy; 2018-{new Date().getFullYear()}
                </p>
            </div>
        </footer>
    );
}
