'use client';
import Navbar from '@/components/Navbar';
import CheckoutFlow from '@/components/CheckoutFlow';

export default function CheckoutPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <CheckoutFlow />
        </div>
    );
}
