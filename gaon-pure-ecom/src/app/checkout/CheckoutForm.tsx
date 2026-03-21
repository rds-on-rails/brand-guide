"use client";

import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { useState } from "react";
import { ShieldCheck } from "lucide-react";

export function CheckoutForm({ total, onSuccess }: { total: number, onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsProcessing(true);
    setErrorMessage(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success`,
      },
      redirect: "if_required"
    });

    if (error) {
      setErrorMessage(error.message ?? "An unknown error occurred.");
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      onSuccess();
    } else {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="pt-6 border-t border-stone-200">
        <h3 className="font-semibold text-stone-800 mb-4 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-green-600" />
          Payment Information
        </h3>
        <PaymentElement />
        {errorMessage && <div className="text-red-500 text-sm mt-2">{errorMessage}</div>}
      </div>

      <button 
        type="submit" 
        disabled={isProcessing || !stripe || !elements}
        className="w-full bg-brand-secondary hover:bg-brand-primary text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isProcessing ? 'Processing Payment...' : `Pay ₹${total}`}
      </button>
    </form>
  );
}
