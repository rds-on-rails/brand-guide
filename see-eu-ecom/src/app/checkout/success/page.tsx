'use client';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, ArrowRight, Package, Loader2 } from 'lucide-react';
import Link from 'next/link';

function SuccessContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [orderId, setOrderId] = useState<string | null>(null);

    useEffect(() => {
        const id = searchParams?.get('orderId');
        if (id) {
            setOrderId(id);
        } else {
            router.push('/');
        }
    }, [searchParams, router]);

    if (!orderId) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl shadow-xl text-center border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-green-50 to-white/0 pointer-events-none"></div>

                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-sm border-4 border-white">
                        <CheckCircle2 className="w-10 h-10 text-green-600" />
                    </div>
                    
                    <h2 className="mt-2 text-3xl font-extrabold text-gray-900 tracking-tight">Order Confirmed!</h2>
                    <p className="mt-4 text-base text-gray-500 max-w-sm">
                        Thank you for your purchase. We've received your order and will begin processing it right away.
                    </p>
                </div>
                
                <div className="relative z-10 mt-8 bg-gray-50 rounded-2xl p-6 border border-gray-100 shadow-sm text-left">
                    <div className="flex items-center text-gray-700 mb-4">
                        <Package className="w-5 h-5 mr-2 text-gray-400" />
                        <h3 className="font-bold text-sm uppercase tracking-wide">Order Details</h3>
                    </div>
                    <div className="space-y-3">
                        <div>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Order Number</p>
                            <p className="font-mono font-bold text-gray-900 text-lg bg-white inline-block px-3 py-1 rounded shadow-sm border border-gray-200">
                                {orderId}
                            </p>
                        </div>
                        <div className="pt-2">
                            <p className="text-sm text-gray-500">
                                A confirmation email with your receipt and tracking info has been sent to your inbox.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 mt-10 space-y-4">
                    <Link
                        href="/orders"
                        className="w-full flex items-center justify-center px-8 py-4 border border-transparent text-base font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10 transition-colors shadow-md hover:shadow-lg"
                    >
                        Track My Order
                        <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                    <Link
                        href="/"
                        className="w-full flex items-center justify-center px-8 py-4 border-2 border-gray-200 text-base font-bold rounded-xl text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 md:py-4 md:text-lg md:px-10 transition-colors"
                    >
                        Continue Shopping
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function CheckoutSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        }>
            <SuccessContent />
        </Suspense>
    );
}
