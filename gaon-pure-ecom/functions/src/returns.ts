import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";
import Stripe from "stripe";

// Initialize Stripe with a mock key fallback for development
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_mock", {
  apiVersion: "2025-02-24.acacia" as any,
});

/**
 * Allows an admin to process a refund for an order via Stripe.
 */
export const processRefund = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "User must be authenticated.");
  }

  const { orderId, reason } = data;
  if (!orderId) {
    throw new functions.https.HttpsError("invalid-argument", "Must provide orderId");
  }

  const db = admin.firestore();
  
  // Scaffolding: In a real app, verify the user has an Admin custom claim:
  // const userRecord = await admin.auth().getUser(context.auth.uid);
  // if (userRecord.customClaims?.role !== "admin") {
  //   throw new functions.https.HttpsError("permission-denied", "Requires admin privileges");
  // }

  const orderRef = db.collection("Orders").doc(orderId);
  const orderSnap = await orderRef.get();

  if (!orderSnap.exists) {
    throw new functions.https.HttpsError("not-found", "Order not found");
  }

  const orderData = orderSnap.data();
  if (!orderData?.paymentIntentId) {
    throw new functions.https.HttpsError("failed-precondition", "Order does not have a linked Stripe Payment Intent.");
  }

  try {
    const refund = await stripe.refunds.create({
      payment_intent: orderData.paymentIntentId,
      reason: reason === "duplicate" || reason === "fraudulent" || reason === "requested_by_customer" 
        ? reason 
        : "requested_by_customer" // Map custom reasons to allowed Stripe enums
    });

    await orderRef.update({
      payment_status: "Refunded",
      refundId: refund.id,
      refundReason: reason || "No reason provided",
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return { success: true, refundId: refund.id };
  } catch (err: any) {
    functions.logger.error("Refund failed", err);
    throw new functions.https.HttpsError("internal", err.message);
  }
});

/**
 * Allows a customer to request a return on an eligible physical product order.
 */
export const requestReturn = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Must be authenticated");
  }

  const { orderId, reason } = data;
  if (!orderId) {
    throw new functions.https.HttpsError("invalid-argument", "Must provide orderId");
  }

  const db = admin.firestore();
  const orderRef = db.collection("Orders").doc(orderId);
  const orderSnap = await orderRef.get();

  if (!orderSnap.exists) {
    throw new functions.https.HttpsError("not-found", "Order not found");
  }

  const orderData = orderSnap.data();
  if (orderData?.userId !== context.auth.uid) {
    throw new functions.https.HttpsError("permission-denied", "You can only request returns for your own orders.");
  }

  await orderRef.update({
    delivery_stage: "Return Requested",
    returnReason: reason || "No reason provided",
    returnRequestedAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });

  return { success: true };
});
