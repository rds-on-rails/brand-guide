import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";

/**
 * Scheduled job to run every 12 hours.
 * Scans Orders in 'Shipped' state and checks their tracking status with the carrier API.
 */
export const syncTrackingNumbers = functions.pubsub.schedule("every 12 hours").onRun(async (context) => {
  functions.logger.info("Starting scheduled sync for tracking numbers...");

  const db = admin.firestore();
  
  // Find orders that are shipped but not yet delivered
  const shippedOrdersSnap = await db.collection("Orders")
    .where("delivery_stage", "==", "Shipped")
    .get();

  if (shippedOrdersSnap.empty) {
    functions.logger.info("No shipped orders to sync.");
    return null;
  }

  const batch = db.batch();
  let syncCount = 0;

  for (const doc of shippedOrdersSnap.docs) {
    const data = doc.data();
    if (data.tracking_number) {
      // Mock API check:
      // const trackInfo = await shippo.track.get_status(data.tracking_number);
      // if (trackInfo.tracking_status.status === "DELIVERED") { ... }

      // We'll mock a random delivery for scaffolding purposes
      if (Math.random() > 0.8) {
        batch.update(doc.ref, {
          delivery_stage: "Delivered",
          deliveredAt: admin.firestore.FieldValue.serverTimestamp()
        });
        syncCount++;
        functions.logger.info(`Order ${doc.id} marked as Delivered via sync.`);
      }
    }
  }

  if (syncCount > 0) {
    await batch.commit();
    functions.logger.info(`Successfully synced ${syncCount} orders.`);
  }

  return null;
});

/**
 * Example of rate limiting wrapper for fraud prevention.
 * This function logs suspicious activity and could block requests.
 */
export const logSuspiciousActivity = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Must be authenticated");
  }

  const db = admin.firestore();
  
  // Scaffold: Log failed payment attempts or high-risk actions to a SecurityLogs collection
  await db.collection("SecurityLogs").add({
    userId: context.auth.uid,
    action: data.action || "unknown_suspicious_action",
    details: data.details || {},
    timestamp: admin.firestore.FieldValue.serverTimestamp()
  });

  functions.logger.warn(`Suspicious activity logged for user ${context.auth.uid}: ${data.action}`);

  return { logged: true };
});
