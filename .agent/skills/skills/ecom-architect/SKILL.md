---
name: ecom-architect
description: This skill generates a full-stack e-commerce solution blueprint that facilitates the "Order-to-Delivery" lifecycle. Trigger this skill when the user says "Build an e-commerce site for [URL/Idea/Local Project]" or "Scaffold a store from this website." It takes a website URL, a business idea, or a local project directory as input.
---

# E-com Architect

This skill transforms a website URL, a business idea, or an existing local project into a full-stack e-commerce solution blueprint, focusing on the "Order-to-Delivery" lifecycle. 

## Instructions

When triggered, walk through the following steps to build the e-commerce architecture:

1. **Product Extraction**:
   - Analyze the input website, business idea, or local project directory files.
   - Identify product categories, attributes, and pricing models.
   
2. **Product Catalog & Discovery (Storefront Scaffolding)**:
   - Generate a React/Next.js frontend using Tailwind CSS.
   - **Product Listings**: Implement a grid or list view showing product images, titles, and prices. Keep UI clean and navigation intuitive.
   - **Search & Basic Filters**: Add a simple search bar and category filters (e.g., Size, Color, or Brand).
   - **Product Detail Page (PDP)**: Include clear imagery, descriptions, stock availability, and an "Add to Cart" button.
   - Utilize the bundled `scripts/scaffold_ecom.py` to generate the folder structure and boilerplate code.

3. **The Shopping Cart System**:
   - **Cart Management**: Users should be able to add, remove, and update quantities of items. Cart must be persistent.
   - **Mini-Cart/Drawer**: Create a quick-view sidebar or dropdown to see the current total without leaving the page.
   - **Price Calculation**: Implement real-time updates of sub-totals, taxes, and estimated shipping.
   - **State Management**: Incorporate an XState-based machine or a simple Redux state for cart and order status transitions to ensure logic is robust.

4. **Frictionless Checkout**:
   - **Guest Checkout**: Allow checkout without forcing users to create an account (reduce friction).
   - **Shipping & Billing Info**: Simple forms for address and contact details (including pin code).
   - **Payment Gateway Integration**: Use a sandbox environment (like Stripe or PayPal) to show secure credit card processing.

5. **Essential User Profiles & Roles**:
   - **User Registration/Login (Firebase)**: Provide secure authentication using Firebase Auth. The skill must prompt the user to place their Firebase Web Config parameters safely into a `.env.local` file (or instruct them how to do so) and consume them via environment variables rather than hardcoding them.
     Provide the user with this `.env.local` template to fill out:
     ```env
     NEXT_PUBLIC_FIREBASE_API_KEY="xxxxxxxxxxxxxxxxxxxxxxxxxx-30xJF11IqG4"
     NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="xxxxxxxxxxxxxxxxxx-2d6b9.firebaseapp.com"
     NEXT_PUBLIC_FIREBASE_PROJECT_ID="xxxxxxxxxxxxxxxxxxxxx-2d6b9"
     NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="ramjanmbhoomi-2d6b9.firebasestorage.app"
     NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=""
     NEXT_PUBLIC_FIREBASE_APP_ID="1:370045306101:web:04fsew51590ce924e30fb71bc"
     NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="G-fddffdLE67JCM"
     ```
     Remind the user to add `.env.local` to their `.gitignore`. (optional for checkout).
   - **Order History**: Build a 'My Orders' dashboard for users to see what they’ve bought in the past.
   - Implement role-based access control identifying users as either 'Customer' or 'Admin'.

6. **Order Management & Admin Module (The "Backend")**:
   - **Order Confirmation**: Provide an automated email or "Thank You" page with an order ID.
   - **Role-Based Access Control (RBAC)**: Protect Admin routes (`/admin/*`) requiring specific admin credentials (e.g., a passphrase or specific email).
   - **Catalog Onboarding Dashboard**: Build a "Catalog Studio" allowing Admins to dynamically create, edit, deactivate, and delete products. Ensure it supports diverse packaging/pricing options.
     - **Database Integration**: The catalog must be persistently stored in a Firestore `Products` table (collection). 
       - **Unique Identifiers**: Each product must be assigned a mathematically generated or Firestore-native Unique ID that persists unchanged over its lifetime. 
       - **Publishing State**: Products should only appear on the storefront if their publish state is set to "Active" by the Admin.
       - **Inventory Tracking**: Each product must track its available quantity. This quantity must dynamically decrease when orders are successfully placed.
     - **Image Management**: Do not mock image assets. Upload real product images to a storage bucket (like Firebase Storage) and save their corresponding reference URLs within the Firestore `Products` document. Connect this dynamic, cloud-hosted catalog to the main storefront UI.
   - **Order Analytics Dashboard**: Create a high-level view for Admins showing total sales, pending orders, revenue metrics, and recent transactions at a glance.
   - **Order Fulfillment Dashboard**: Build an interface protected by role-based routing for the Admin to view new orders and manage inventory levels. Orders should only proceed to 'Shipped' if the requisite catalog quantity is available.
   - **Delivery Stage Orchestrator**:
     - Implement an order table allowing the Admin to update the status of each order.
     - For **Digital Products**, the stages are: `Payment Pending` => `Payment Done` => `Confirmed`.
     - For **Physical Products**, the stages are: `Ordered` => `Shipped` => `Out for Delivery` => `Delivered` => `Return Picked` => `Return Completed`.

7. **Order Tracking Logic**:
   - Implement a status-based tracking system. The UI must progress through the timeline dynamically based on whether the order contains physical or digital products.
   - Generate a mock 'Track Order' API endpoint.
   - Build a frontend tracking component with a progress stepper reflecting the applicable states for Customers.

8. **Integration**:
   - Ensure the generated code can consume the "brand-guide" skill (which the user already has) to apply consistent colors, typography, and logos. Do this by prompting the user to run the brand-guide skill or referencing how the output should integrate its design tokens.

## Resources
- **Database Schema**: Reference `assets/db-schema.md` for the Firestore database structure including `Products`, `Orders`, and `Order_Tracking` tables.
- **Scaffold Script**: Run or instruct the user to run `scripts/scaffold_ecom.py` to bootstrap the Next.js/React structure.
