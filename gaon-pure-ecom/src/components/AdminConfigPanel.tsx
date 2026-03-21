"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";

export default function AdminConfigPanel() {
  const [shippingThreshold, setShippingThreshold] = useState(50);
  const [taxRate, setTaxRate] = useState(0.08);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Fetch config from Firestore
  useEffect(() => {
    async function fetchConfig() {
       try {
         const docSnap = await getDoc(doc(db, "Configs", "settings"));
         if (docSnap.exists()) {
           const data = docSnap.data();
           if (data.free_shipping_threshold !== undefined) setShippingThreshold(data.free_shipping_threshold);
           if (data.default_tax_rate !== undefined) setTaxRate(data.default_tax_rate);
         }
       } catch (error) {
         console.error("Error fetching config:", error);
       } finally {
         setFetching(false);
       }
    }
    fetchConfig();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      const configRef = doc(db, "Configs", "settings");
      const docSnap = await getDoc(configRef);
      if (docSnap.exists()) {
        await updateDoc(configRef, {
           free_shipping_threshold: shippingThreshold,
           default_tax_rate: taxRate
        });
      } else {
        await setDoc(configRef, {
           free_shipping_threshold: shippingThreshold,
           default_tax_rate: taxRate
        });
      }
      alert("Configuration saved!");
    } catch (error) {
      console.error("Error saving config:", error);
      alert("Failed to save configuration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded shadow-md w-full max-w-md mx-auto mt-10">
      <h2 className="text-xl font-bold mb-4">Admin Config System</h2>
      
      {fetching ? (
        <p className="text-sm text-gray-500 mb-4">Loading configuration...</p>
      ) : (
        <>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Free Shipping Threshold ($)</label>
        <input 
          type="number" 
          value={shippingThreshold}
          onChange={(e) => setShippingThreshold(Number(e.target.value))}
          className="w-full border p-2 rounded"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Default Tax Rate (Decimal)</label>
        <input 
          type="number" 
          step="0.01"
          value={taxRate}
          onChange={(e) => setTaxRate(Number(e.target.value))}
          className="w-full border p-2 rounded"
        />
      </div>

      <button 
        onClick={handleSave}
        disabled={loading}
        className="w-full bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Saving..." : "Save Configs"}
      </button>
      </>
      )}
    </div>
  );
}
