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
Object.defineProperty(exports, "__esModule", { value: true });
exports.logSuspiciousActivity = exports.syncTrackingNumbers = void 0;
const functions = __importStar(require("firebase-functions/v1"));
const admin = __importStar(require("firebase-admin"));
/**
 * Scheduled job to run every 12 hours.
 * Scans Orders in 'Shipped' state and checks their tracking status with the carrier API.
 */
exports.syncTrackingNumbers = functions.pubsub.schedule("every 12 hours").onRun(async (context) => {
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
exports.logSuspiciousActivity = functions.https.onCall(async (data, context) => {
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
//# sourceMappingURL=schedule.js.map