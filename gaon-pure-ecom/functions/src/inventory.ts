import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";

/**
 * Triggered when an Order document is updated.
 * Handles inventory deduction when payment_status becomes "Authorized".
 */
export const handleOrderPaymentSuccess = functions.firestore
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
          const productRefs = items.map((item: any) => db.collection("Products").doc(item.productId));
          const productDocs = await t.getAll(...productRefs);

          const updates: { ref: admin.firestore.DocumentReference, available_quantity: number }[] = [];

          // 2. Compute new quantities and verify stock
          for (let i = 0; i < productDocs.length; i++) {
            const productDoc = productDocs[i];
            const requestedQuantity = items[i].quantity;
            
            if (!productDoc.exists) {
              throw new Error(`Product ${productRefs[i].id} does not exist!`);
            }

            const productData = productDoc.data() as any;
            const currentQuantity = productData?.available_quantity || 0;

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
      } catch (err) {
        functions.logger.error(`Stock allocation failed for order ${orderId}`, err);
        // We might want to alert admins or mark order for manual review
        await change.after.ref.update({
          inventory_allocated: false,
          stock_error: (err as any).message || "Unknown error"
        });
      }
    }
  });
