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
exports.createPaymentIntent = exports.stripeWebhook = void 0;
const functions = __importStar(require("firebase-functions/v1"));
const admin = __importStar(require("firebase-admin"));
const stripe_1 = __importDefault(require("stripe"));
// Initialize Stripe with a mock key fallback for development
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY || "sk_test_mock", {
    apiVersion: "2025-02-24.acacia",
});
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || "whsec_mock";
exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
    var _a, _b, _c;
    const sig = req.headers["stripe-signature"];
    if (!sig) {
        functions.logger.error("Missing stripe-signature header");
        res.status(400).send("Missing stripe-signature header");
        return;
    }
    let event;
    try {
        // Note: req.rawBody is provided by Firebase Functions
        event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
    }
    catch (err) {
        functions.logger.error("Webhook signature verification failed.", err.message);
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }
    const db = admin.firestore();
    // Idempotency check: ensuring we don't process the same event twice
    const eventRef = db.collection("StripeEvents").doc(event.id);
    const eventSnapshot = await eventRef.get();
    if (eventSnapshot.exists) {
        functions.logger.info(`Event ${event.id} already processed. Skipping.`);
        res.json({ received: true });
        return;
    }
    await eventRef.set({
        type: event.type,
        created: admin.firestore.FieldValue.serverTimestamp()
    });
    try {
        if (event.type === "payment_intent.succeeded") {
            const paymentIntent = event.data.object;
            const orderId = (_a = paymentIntent.metadata) === null || _a === void 0 ? void 0 : _a.orderId;
            if (orderId) {
                await db.collection("Orders").doc(orderId).update({
                    payment_status: "Authorized",
                    paymentIntentId: paymentIntent.id,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                });
                functions.logger.info(`Order ${orderId} marked as Authorized.`);
            }
        }
        else if (event.type === "payment_intent.payment_failed") {
            const paymentIntent = event.data.object;
            const orderId = (_b = paymentIntent.metadata) === null || _b === void 0 ? void 0 : _b.orderId;
            if (orderId) {
                await db.collection("Orders").doc(orderId).update({
                    payment_status: "Failed",
                    paymentIntentId: paymentIntent.id,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                });
                functions.logger.info(`Order ${orderId} marked as Failed.`);
            }
        }
        else if (event.type === "checkout.session.completed") {
            const session = event.data.object;
            const orderId = (_c = session.metadata) === null || _c === void 0 ? void 0 : _c.orderId;
            if (orderId) {
                await db.collection("Orders").doc(orderId).update({
                    payment_status: "Authorized",
                    paymentIntentId: session.payment_intent || null,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                });
                functions.logger.info(`Order ${orderId} marked as Authorized via Session.`);
            }
        }
        res.json({ received: true });
    }
    catch (error) {
        functions.logger.error(`Error processing event ${event.id}`, error);
        res.status(500).send("Internal Server Error processing webhook");
    }
});
exports.createPaymentIntent = functions.https.onCall(async (data, context) => {
    var _a;
    // Ensure user is authenticated
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated.");
    }
    const { items, orderId, couponCode } = data;
    if (!items || !Array.isArray(items) || items.length === 0 || !orderId) {
        throw new functions.https.HttpsError("invalid-argument", "Provide valid items and orderId");
    }
    const db = admin.firestore();
    let subtotal = 0;
    try {
        // 1. Calculate base subtotal securely from Database
        const productRefs = items.map((item) => db.collection("Products").doc(item.productId));
        const productDocs = await db.getAll(...productRefs);
        for (let i = 0; i < productDocs.length; i++) {
            const pDoc = productDocs[i];
            if (!pDoc.exists) {
                throw new Error(`Product ${productRefs[i].id} not found`);
            }
            const pData = pDoc.data();
            const price = (pData === null || pData === void 0 ? void 0 : pData.price) || 0;
            subtotal += (price * items[i].quantity); // assuming price is in cents
        }
        // 2. Apply Custom Pricing & Promotions Engine
        let discount = 0;
        if (couponCode) {
            const couponDoc = await db.collection("Coupons").doc(couponCode).get();
            if (couponDoc.exists) {
                const couponData = couponDoc.data();
                if (couponData === null || couponData === void 0 ? void 0 : couponData.active) {
                    if (couponData.type === "percentage") {
                        discount = Math.floor(subtotal * (couponData.value / 100));
                    }
                    else if (couponData.type === "fixed") {
                        discount = couponData.value; // in cents
                    }
                }
            }
        }
        const afterDiscount = Math.max(0, subtotal - discount);
        // 3. Apply Configurable Tax Rules
        let taxAmount = 0;
        const taxRulesDoc = await db.collection("Configs").doc("tax_rules").get();
        if (taxRulesDoc.exists) {
            const taxRate = ((_a = taxRulesDoc.data()) === null || _a === void 0 ? void 0 : _a.default_rate) || 0; // e.g. 0.08 for 8%
            taxAmount = Math.floor(afterDiscount * taxRate);
        }
        // 4. Calculate Final Total
        // Mock shipping cost logic would be added here
        const shippingAmount = 0;
        const finalAmount = afterDiscount + taxAmount + shippingAmount;
        // Minimum Stripe charge is typically 50 cents USD
        if (finalAmount < 50) {
            throw new Error("Calculated total is below required minimum.");
        }
        const paymentIntent = await stripe.paymentIntents.create({
            amount: finalAmount,
            currency: "usd",
            metadata: {
                orderId: orderId,
                userId: context.auth.uid
            }
        });
        return {
            clientSecret: paymentIntent.client_secret,
            id: paymentIntent.id,
            calculatedTotal: finalAmount
        };
    }
    catch (error) {
        functions.logger.error("Error creating secure payment intent", error);
        throw new functions.https.HttpsError("internal", error.message);
    }
});
//# sourceMappingURL=payments.js.map