import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ChevronDown } from "lucide-react";

const faqs = [
    {
        question: "Do I need a specific visa for these trips?",
        answer: "Most of our trips require a valid Schengen visa as we travel across multiple European borders (Belgium, France, Switzerland, etc.). Please ensure your visa is valid for the duration of the trip and allows multiple entries if applicable.",
    },
    {
        question: "What is the cancellation policy?",
        answer: "You can cancel up to 14 days before the trip for a full refund. Cancellations made within 14 days are subject to a 50% cancellation fee. Day trips usually have a shorter cancellation window of 48 hours.",
    },
    {
        question: "Are meals included in the trip price?",
        answer: "Unless specifically stated in the trip details, meals are not included. We ensure to stop at locations where varied and affordable food options, including vegetarian choices, are easily accessible.",
    },
    {
        question: "Is there an age limit for the tours?",
        answer: "There are no strict age limits for most tours. However, infants and toddlers must be seated securely in accordance with European transport laws. Please contact us to confirm child pricing and seating arrangements.",
    },
    {
        question: "Where do the trips depart from?",
        answer: "The majority of our trips depart from central locations in Belgium (like Brussels or Gent) and Luxembourg. Ensure you check the exact departure point on your ticket after booking.",
    }
];

export default function FAQ() {
    return (
        <div className="flex flex-col min-h-screen bg-gray-50/50">
            <Header />

            <main className="flex-grow pt-24 pb-20">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h1 className="text-4xl md:text-5xl font-bold text-brand-secondary mb-4">Frequently Asked Questions</h1>
                        <p className="text-lg text-gray-600">Everything you need to know about traveling with See-EU.</p>
                    </div>

                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <details key={index} className="group bg-white border border-gray-200 rounded-xl overflow-hidden [&_summary::-webkit-details-marker]:hidden">
                                <summary className="flex items-center justify-between cursor-pointer p-6 font-semibold text-lg text-foreground bg-white hover:bg-gray-50 transition-colors">
                                    {faq.question}
                                    <span className="transition duration-300 group-open:-rotate-180">
                                        <ChevronDown className="w-5 h-5 text-gray-400" />
                                    </span>
                                </summary>
                                <div className="p-6 pt-0 text-gray-600 bg-white">
                                    <p className="mt-2 leading-relaxed">{faq.answer}</p>
                                </div>
                            </details>
                        ))}
                    </div>

                    <div className="mt-16 bg-blue-50/50 rounded-2xl p-8 text-center border border-brand-primary/10">
                        <h3 className="text-2xl font-bold text-brand-secondary mb-3">Still have questions?</h3>
                        <p className="text-gray-600 mb-6">Can't find the answer you're looking for? Please write to our team.</p>
                        <a href="mailto:See-EU@Live.be" className="inline-block bg-brand-primary hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-full transition-colors shadow-md">
                            Contact Us
                        </a>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
