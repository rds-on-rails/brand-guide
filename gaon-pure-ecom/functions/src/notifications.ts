import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";

// Scaffolding SendGrid
// import sgMail from "@sendgrid/mail";
// sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export const onOrderStatusChanged = functions.firestore
  .document("Orders/{orderId}")
  .onUpdate(async (change, context) => {
    const newData = change.after.data();
    const oldData = change.before.data();
    const orderId = context.params.orderId;

    if (!newData || !oldData) return;

    // Check if delivery stage changed
    if (newData.delivery_stage !== oldData.delivery_stage) {
      functions.logger.info(`Order ${orderId} stage changed to ${newData.delivery_stage}. Sending notification...`);

      const userSnap = await admin.firestore().collection("Users").doc(newData.userId).get();
      const userData = userSnap.data();
      const userEmail = userData?.email || newData.customer_email;

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
      } catch (err: any) {
        functions.logger.error("Failed to send email notification", err);
      }
    }
    
    // Check if payment was authorized
    if (newData.payment_status === "Authorized" && oldData.payment_status !== "Authorized") {
       functions.logger.info(`(MOCK) Sending Order Confirmation Email to ${newData.customer_email}`);
    }
  });
