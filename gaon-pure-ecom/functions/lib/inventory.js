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
exports.handleOrderPaymentSuccess = void 0;
const functions = __importStar(require("firebase-functions/v1"));
const admin = __importStar(require("firebase-admin"));
/**
 * Triggered when an Order document is updated.
 * Handles inventory deduction when payment_status becomes "Authorized".
 */
exports.handleOrderPaymentSuccess = functions.firestore
    .document("Orders/{orderId}")
    .onUpdate(async (change, context) => {
    const newData = change.after.data();
    const oldData = change.before.data();
    // Check if payment status transitioned to Authorized
    if (oldData.payment_status !== "Authorized" && newData.payment_status === "Authorized") {
        const orderId = context.params.orderId;
        const items = newData.items || [];
        const db = admin.firestore();
        functions.logger.info(`Processing inventory deduction for order ${orderId}`);
        try {
            await db.runTransaction(async (t) => {
                // 1. Read all product documents first
                const productRefs = items.map((item) => db.collection("Products").doc(item.productId));
                const productDocs = await t.getAll(...productRefs);
                const updates = [];
                // 2. Compute new quantities and verify stock
                for (let i = 0; i < productDocs.length; i++) {
                    const productDoc = productDocs[i];
                    const requestedQuantity = items[i].quantity;
                    if (!productDoc.exists) {
                        throw new Error(`Product ${productRefs[i].id} does not exist!`);
                    }
                    const productData = productDoc.data();
                    const currentQuantity = (productData === null || productData === void 0 ? void 0 : productData.available_quantity) || 0;
                    if (currentQuantity < requestedQuantity) {
                        // Overselling risk! We should probably cancel/refund the order here in a real scenario
                        functions.logger.warn(`Not enough stock for ${productRefs[i].id}. Required: ${requestedQuantity}, Available: ${currentQuantity}`);
                        throw new Error(`Insufficient stock for product ${productRefs[i].id}`);
                    }
                    updates.push({
                        ref: productRefs[i],
                        available_quantity: currentQuantity - requestedQuantity
                    });
                }
                // 3. Apply updates to products
                updates.forEach(update => {
                    t.update(update.ref, { available_quantity: update.available_quantity });
                });
                // 4. Update the order to indicate inventory has been allocated
                t.update(change.after.ref, { inventory_allocated: true });
            });
            functions.logger.info(`Successfully deducted inventory for order ${orderId}`);
        }
        catch (err) {
            functions.logger.error(`Stock allocation failed for order ${orderId}`, err);
            // We might want to alert admins or mark order for manual review
            await change.after.ref.update({
                inventory_allocated: false,
                stock_error: err.message || "Unknown error"
            });
        }
    }
});
//# sourceMappingURL=inventory.js.map