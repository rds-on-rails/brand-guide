"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestReturn = exports.processRefund = void 0;
const functions = __importStar(require("firebase-functions/v1"));
const admin = __importStar(require("firebase-admin"));
const stripe_1 = __importDefault(require("stripe"));
// Initialize Stripe with a mock key fallback for development
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY || "sk_test_mock", {
    apiVersion: "2025-02-24.acacia",
});
/**
 * Allows an admin to process a refund for an order via Stripe.
 */
exports.processRefund = functions.https.onCall(async (data, context) => {
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
    if (!(orderData === null || orderData === void 0 ? void 0 : orderData.paymentIntentId)) {
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
    }
    catch (err) {
        functions.logger.error("Refund failed", err);
        throw new functions.https.HttpsError("internal", err.message);
    }
});
/**
 * Allows a customer to request a return on an eligible physical product order.
 */
exports.requestReturn = functions.https.onCall(async (data, context) => {
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
    if ((orderData === null || orderData === void 0 ? void 0 : orderData.userId) !== context.auth.uid) {
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
//# sourceMappingURL=returns.js.map