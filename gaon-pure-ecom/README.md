# Gaon Pure E-commerce

Gaon Pure is a modern, high-performance e-commerce platform built for the `gaon-pure.com` brand. It provides a seamless shopping experience for customers and a powerful administrative backend for store owners.

## Tech Stack

This project is built with cutting-edge web technologies:

*   **Frontend:** [Next.js](https://nextjs.org/) (React 19), [Tailwind CSS v4](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/) for animations, and [Zustand](https://zustand-demo.pmnd.rs/) for state management.
*   **Backend & Database:** [Firebase](https://firebase.google.com/) (Cloud Functions, Firestore, Authentication).
*   **Third-Party Integrations:**
    *   **Payments:** Stripe
    *   **Shipping & Fulfillment:** Shippo
    *   **Transactional Emails:** SendGrid

## Key Features

*   **Dynamic Product Catalog:** Fast, responsive product browsing and discovery.
*   **Secure Checkout Flow:** Frictionless checkout powered by Stripe integration.
*   **Order Tracking UI:** Customers can easily track the status of their orders in real-time.
*   **Admin Dashboard:** A comprehensive configuration panel for managing inventory, orders, and store settings.
*   **Automated Logistics:** Integration with Shippo for automated shipping label generation and tracking updates.
*   **Email Notifications:** Order confirmations and shipping updates via SendGrid.

## Getting Started

### Prerequisites

*   Node.js (v20 or newer recommended)
*   npm, yarn, pnpm, or bun
*   Firebase CLI installed globally (`npm install -g firebase-tools`)

### Installation

1.  Navigate to the project directory:
    ```bash
    cd gaon-pure-ecom
    ```
2.  Install dependencies:
    ```bash
    npm install
    # or yarn install / pnpm install / bun install
    ```

### Environment Setup

Create a `.env.local` file in the root of your project and configure your environment variables for Firebase, Stripe, Shippo, and SendGrid according to your project setup.

### Running the Development Server

Start the Next.js development server:

```bash
npm run dev
# or yarn dev / pnpm dev / bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Project Structure

*   `app/` - Next.js App Router containing the main application pages and layouts.
*   `components/` - Reusable React components used throughout the application.
*   `functions/` - Firebase Cloud Functions for backend logic (payments, shipping, notifications).
*   `store/` - Zustand stores for global state management.
