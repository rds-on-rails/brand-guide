---
name: ecom-architect  
description: This skill generates a full-stack e-commerce solution blueprint that facilitates the "Order-to-Delivery" lifecycle. Trigger this skill when the user says "Build an e-commerce site for [URL/Idea/Local Project]" or "Scaffold a store from this website." It takes a website URL, a business idea, or a local project directory as input.  
---

# E-com Architect

This skill transforms a website URL, a business idea, or an existing local project into a full-stack e-commerce solution blueprint, focusing on the "Order-to-Delivery" lifecycle.

## Instructions

When triggered, walk through the following steps to build the e-commerce architecture:

---

## 1. Product Extraction
- Analyze the input website, business idea, or local project directory files.
- Identify product categories, attributes, and pricing models.

---

## 2. Product Catalog & Discovery (Storefront Scaffolding)
- Generate a React/Next.js frontend using Tailwind CSS.
- **Product Listings**: Grid/list view with images, titles, prices.
- **Search & Filters**: Category, size, color, brand.
- **Product Detail Page (PDP)**: Images, description, stock, add-to-cart.
- Use `scripts/scaffold_ecom.py` to bootstrap structure.

---

## 3. Shopping Cart System
- Add/remove/update items with persistent cart.
- Mini-cart drawer for quick access.
- Real-time pricing (subtotal, tax, shipping).
- Use Redux/XState for state management.

---

## 4. Frictionless Checkout
- Guest checkout enabled.
- Shipping & billing forms.
- Payment gateway (Stripe/PayPal sandbox).

---

## 5. User Profiles & Account Management (Firebase)
- Firebase Auth (via `.env.local`)
- Registration & Login flows (Email/Password, OAuth providers).
- **User Profile Management**:
  - Profile update pages (Name, Phone, Avatars).
  - Address Book management (Multiple shipping/billing addresses).
- **Account Recovery & Security**:
  - Forgot password / Password reset pages.
  - Email verification flows.
- Role-based access: Customer / Admin
- Order history dashboard and active order tracking.

---

## 6. Comprehensive Admin Dashboard & Order Management (Firebase)
- Built securely on Firestore and Firebase Cloud Functions.
- RBAC protecting all `/admin/*` routes (requires 'admin' custom claim).
- **User Management Module**:
  - View all registered users (syncs `Users` collection).
  - Manage user roles, reset passwords, and audit account activity.
- **Order Management Module**:
  - Live feed of all orders synced from the `Orders` collection.
  - Order confirmation (email + UI).
  - Update tracking status, handle fulfillment, and issue refunds.
  - Delivery stages:
    - Digital: Payment Pending → Done → Confirmed
    - Physical: Ordered → Shipped → Delivered → Return
- **Inventory & Catalog Studio**:
  - Centralized inventory tracking (syncs `Products` collection).
  - CRUD products, manage variants, and handle low-stock thresholds.
  - Image upload via Firebase Storage.
- **Analytics Dashboard**:
  - Aggregated sales metrics, payment success rates, and fulfillment statuses.

---

## 7. Order Tracking Logic
- Status-based UI stepper
- Track Order API
- Customer tracking page

---

## 8. Integration
- Integrate with "brand-guide" skill for design tokens

---

# 🔥 NEW PRODUCTION-CRITICAL SECTIONS

---

## 9. Payment Lifecycle Management
- Use Firebase Cloud Functions for secure webhook handling.
- Handle events:
  - `payment_intent.succeeded`
  - `payment_intent.failed`
  - `checkout.session.completed`
- Update Firestore `Orders` via webhook (NOT frontend).
- Ensure idempotency using event IDs.
- Maintain `payment_status`:
  - Pending, Authorized, Failed, Refunded
- Store transaction metadata.

---

## 10. Inventory Management (Atomic)
- Use Firestore transactions:
  - Prevent overselling
- Maintain:
  - `available_quantity`
  - `reserved_quantity`
- Deduct stock only after payment success.
- Rollback on failure.

---

## 11. Shipping & Logistics Integration
- Integrate APIs (Shippo, Sendcloud).
- Features:
  - Real-time shipping cost
  - Delivery ETA
- Generate labels via Cloud Functions.
- Store tracking IDs.
- Sync tracking via scheduled jobs.

---

## 12. Returns & Refund Workflow
- User return request system.
- Admin flow:
  - Requested → Approved → Picked → Refunded
- Trigger refunds via payment API.
- Track `refund_status`.

---

## 13. Notification System (Event-Driven)
- Firebase Cloud Functions triggers:
  - Order confirmation
  - Shipping updates
  - Delivery alerts
- Integrations:
  - Email (SendGrid)
  - SMS (Twilio)

---

## 14. Configurable Admin System
- Firestore `Configs` collection:
  - business_type (physical/digital/hybrid)
  - tax_rules
  - shipping_rules
  - payment_methods
- Dynamic UI rendering based on config.
- Feature toggles (COD, subscriptions, etc.).

---

## 15. Pricing & Promotions Engine
- Support:
  - Coupons
  - Discounts
  - Cart rules
- Tax calculation (VAT/GST).
- Firestore collections:
  - `Coupons`
  - `TaxRules`
- Apply pricing via Cloud Functions.

---

## 16. Firebase Backend Architecture
- Services:
  - Firestore
  - Auth
  - Storage
  - Cloud Functions
  - Cloud Scheduler
- Collections:
  - Users
  - Products
  - Orders
  - Payments
  - Configs
- Enforce Firestore security rules.

---

## 17. Security & Fraud Prevention
- Validate via Firebase Auth tokens.
- Prevent price tampering (server-side calc).
- Rate limiting via Cloud Functions.
- Log suspicious activity.
- Use HTTPS callable functions.

---

## 18. Logging & Monitoring
- Firebase + Google Cloud Logging.
- Monitor:
  - Payment failures
  - Inventory issues
  - API errors
- Setup alerts.

---

## Resources
- **Database Schema**: `assets/db-schema.md`
- **Scaffold Script**: `scripts/scaffold_ecom.py`
