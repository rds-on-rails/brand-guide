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
exports.onOrderStatusChanged = void 0;
const functions = __importStar(require("firebase-functions/v1"));
const admin = __importStar(require("firebase-admin"));
// Scaffolding SendGrid
// import sgMail from "@sendgrid/mail";
// sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
exports.onOrderStatusChanged = functions.firestore
    .document("Orders/{orderId}")
    .onUpdate(async (change, context) => {
    const newData = change.after.data();
    const oldData = change.before.data();
    const orderId = context.params.orderId;
    if (!newData || !oldData)
        return;
    // Check if delivery stage changed
    if (newData.delivery_stage !== oldData.delivery_stage) {
        functions.logger.info(`Order ${orderId} stage changed to ${newData.delivery_stage}. Sending notification...`);
        const userSnap = await admin.firestore().collection("Users").doc(newData.userId).get();
        const userData = userSnap.data();
        const userEmail = (userData === null || userData === void 0 ? void 0 : userData.email) || newData.customer_email;
        if (!userEmail) {
            functions.logger.warn(`No email found to notify for order ${orderId}`);
            return;
        }
        // Scaffold Email Send
        const msg = {
            to: userEmail,
            from: "noreply@gaon-pure-ecom.com",
            subject: `Update on your order #${orderId}`,
            text: `Your order status is now: ${newData.delivery_stage}. Track it here: ${newData.tracking_url || "N/A"}`
        };
        try {
            // await sgMail.send(msg);
            functions.logger.info(`(MOCK) Sent email to ${userEmail}: ${msg.subject}`);
        }
        catch (err) {
            functions.logger.error("Failed to send email notification", err);
        }
    }
    // Check if payment was authorized
    if (newData.payment_status === "Authorized" && oldData.payment_status !== "Authorized") {
        functions.logger.info(`(MOCK) Sending Order Confirmation Email to ${newData.customer_email}`);
    }
});
//# sourceMappingURL=notifications.js.map