"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function OrderTracking() {
  const [orderId, setOrderId] = useState("");
  const [trackingInfo, setTrackingInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) return;

    setLoading(true);
    setError("");
    setTrackingInfo(null);

    try {
      const orderRef = doc(db, "Orders", orderId.trim());
      const orderSnap = await getDoc(orderRef);

      if (orderSnap.exists()) {
        const data = orderSnap.data();
        setTrackingInfo({
          status: data.delivery_stage || "Processing",
          tracking_number: data.tracking_number || "N/A",
          courier: data.courier || "Standard Shipping"
        });
      } else {
        setError("Order not found. Please check the ID and try again.");
      }
    } catch (err) {
      console.error("Error fetching order:", err);
      setError("An error occurred while tracking your order.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded shadow-md w-full max-w-md mx-auto mt-10">
      <h2 className="text-xl font-bold mb-4">Track Your Order</h2>
      
      <form onSubmit={handleTrack} className="mb-4">
        <label className="block text-sm font-medium mb-1">Order ID</label>
        <div className="flex gap-2">
           <input 
             type="text" 
             value={orderId}
             placeholder="e.g. MOCK123"
             onChange={(e) => setOrderId(e.target.value)}
             className="w-full border p-2 rounded flex-1"
             required
           />
           <button 
             type="submit"
             disabled={loading}
             className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
           >
             {loading ? "..." : "Track"}
           </button>
        </div>
      </form>

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

      {trackingInfo && (
        <div className="mt-4 p-4 border rounded bg-gray-50">
          <h3 className="font-bold text-lg mb-2">Order Status: <span className="text-green-600">{trackingInfo.status}</span></h3>
          <p className="text-sm"><strong>Tracking Number:</strong> {trackingInfo.tracking_number}</p>
          <p className="text-sm"><strong>Courier:</strong> {trackingInfo.courier}</p>
          
          <div className="mt-4 flex justify-between text-xs text-gray-500">
             <div className="flex flex-col items-center">
                <div className="w-4 h-4 rounded-full bg-green-500 mb-1"></div>
                Ordered
             </div>
             <div className="flex flex-col items-center">
                <div className={`w-4 h-4 rounded-full ${trackingInfo.status === 'Shipped' || trackingInfo.status === 'Delivered' ? 'bg-green-500' : 'bg-gray-300'} mb-1`}></div>
                Shipped
             </div>
             <div className="flex flex-col items-center">
                <div className={`w-4 h-4 rounded-full ${trackingInfo.status === 'Delivered' ? 'bg-green-500' : 'bg-gray-300'} mb-1`}></div>
                Delivered
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
