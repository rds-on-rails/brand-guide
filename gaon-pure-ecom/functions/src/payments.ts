import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";
import Stripe from "stripe";

// Initialize Stripe with a mock key fallback for development
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_mock", {
  apiVersion: "2025-02-24.acacia" as any,
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || "whsec_mock";

export const stripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers["stripe-signature"];

  if (!sig) {
    functions.logger.error("Missing stripe-signature header");
    res.status(400).send("Missing stripe-signature header");
    return;
  }

  let event;
  try {
    // Note: req.rawBody is provided by Firebase Functions
    event = stripe.webhooks.constructEvent(
      (req as any).rawBody, 
      sig as string, 
      endpointSecret
    );
  } catch (err: any) {
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
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const orderId = paymentIntent.metadata?.orderId;
      
      if (orderId) {
        await db.collection("Orders").doc(orderId).update({
          payment_status: "Authorized",
          paymentIntentId: paymentIntent.id,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        functions.logger.info(`Order ${orderId} marked as Authorized.`);
      }
    } else if (event.type === "payment_intent.payment_failed") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const orderId = paymentIntent.metadata?.orderId;
      
      if (orderId) {
        await db.collection("Orders").doc(orderId).update({
          payment_status: "Failed",
          paymentIntentId: paymentIntent.id,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        functions.logger.info(`Order ${orderId} marked as Failed.`);
      }
    } else if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;
      
      if (orderId) {
        await db.collection("Orders").doc(orderId).update({
          payment_status: "Authorized",
          paymentIntentId: session.payment_intent as string || null,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        functions.logger.info(`Order ${orderId} marked as Authorized via Session.`);
      }
    }
    
    res.json({received: true});
  } catch (error) {
    functions.logger.error(`Error processing event ${event.id}`, error);
    res.status(500).send("Internal Server Error processing webhook");
  }
});

export const createPaymentIntent = functions.https.onCall(async (data, context) => {
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
    const productRefs = items.map((item: any) => db.collection("Products").doc(item.productId));
    const productDocs = await db.getAll(...productRefs);

    for (let i = 0; i < productDocs.length; i++) {
        const pDoc = productDocs[i];
        if (!pDoc.exists) {
            throw new Error(`Product ${productRefs[i].id} not found`);
        }
        const pData = pDoc.data();
        const price = pData?.price || 0;
        subtotal += (price * items[i].quantity); // assuming price is in cents
    }

    // 2. Apply Custom Pricing & Promotions Engine
    let discount = 0;
    if (couponCode) {
        const couponDoc = await db.collection("Coupons").doc(couponCode).get();
        if (couponDoc.exists) {
            const couponData = couponDoc.data();
            if (couponData?.active) {
                if (couponData.type === "percentage") {
                    discount = Math.floor(subtotal * (couponData.value / 100));
                } else if (couponData.type === "fixed") {
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
        const taxRate = taxRulesDoc.data()?.default_rate || 0; // e.g. 0.08 for 8%
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
  } catch (error: any) {
    functions.logger.error("Error creating secure payment intent", error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});
