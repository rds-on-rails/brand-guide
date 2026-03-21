import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";

// In a real environment, you would use shippo or sendcloud npm packages:
// import { Shippo } from "shippo";
// const shippo = new Shippo({ token: process.env.SHIPPO_API_TOKEN });

/**
 * Callable function to get shipping rates based on destination and weight/dimensions.
 * Returns mocked data for scaffolding purposes.
 */
export const getShippingRates = functions.https.onCall(async (data, context) => {
  const { destinationAddress, packageDetails } = data;

  if (!destinationAddress || !packageDetails) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Must provide destinationAddress and packageDetails"
    );
  }

  // Mock checking Configs for shipping rules
  const db = admin.firestore();
  const configDoc = await db.collection("Configs").doc("shipping_rules").get();
  
  let baseRate = 500; // $5.00 in cents

  if (configDoc.exists) {
    const configData = configDoc.data();
    if (configData && configData.free_shipping_threshold) {
      // Logic for free shipping threshold would go here in actual implementation
    }
  }

  // Mock API Call to Shippo/SendCloud
  return {
    rates: [
      {
        provider: "USPS",
        serviceLevel: "Priority Mail",
        amount: baseRate,
        currency: "USD",
        estimatedDays: 3,
        id: "rate_mock_12345"
      },
      {
        provider: "FedEx",
        serviceLevel: "2-Day",
        amount: 1500, // $15.00
        currency: "USD",
        estimatedDays: 2,
        id: "rate_mock_67890"
      }
    ]
  };
});

/**
 * Triggered after an order is successfully picked or shipped by an Admin
 * Used to conditionally generate labels or update tracking.
 */
export const onOrderShipped = functions.firestore
  .document("Orders/{orderId}")
  .onUpdate(async (change, context) => {
    const newData = change.after.data();
    const oldData = change.before.data();

    // Transition from Not Shipped -> Shipped
    if (oldData.delivery_stage !== "Shipped" && newData.delivery_stage === "Shipped") {
      const orderId = context.params.orderId;
      
      functions.logger.info(`Validating shipping label generation for order ${orderId}`);
      
      // Real API call would happen here:
      // const transaction = await shippo.transaction.create({
      //   rate: newData.selected_rate_id,
      //   label_file_type: "PDF",
      //   async: false
      // });

      // Mock update back to order document
      await change.after.ref.update({
        tracking_number: `MOCK-TRK-${Date.now()}`,
        tracking_url: `https://tracking.mock.io/${Date.now()}`,
        label_url: "https://label.mock.io/download.pdf",
        tracking_updated_at: admin.firestore.FieldValue.serverTimestamp()
      });
    }
  });
