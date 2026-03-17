# Firestore Database Schema

## Users Collection
- `documentId`: `userId`
- `email` (string)
- `name` (string)
- `role` (string: 'Customer' | 'Admin')
- `createdAt` (timestamp)

## Products Collection
- `documentId`: `productId`
- `name` (string)
- `description` (string)
- `price` (number)
- `categories` (array of strings)
- `productType` (string: 'digital' | 'physical')
- `attributes` (map/object)
- `imageUrl` (string)
- `stock` (number)

## Orders Collection
- `documentId`: `orderId`
- `userId` (string)
- `items` (array of objects: `{ productId, quantity, priceAtPurchase }`)
- `totalAmount` (number)
- `shippingAddress` (object: `{ street, city, state, pinCode, country }`)
- `paymentStatus` (string: 'Pending', 'Simulated_Success')
- `orderDate` (timestamp)
- `trackingId` (string)

## Order_Tracking Collection
- `documentId`: `trackingId`
- `orderId` (string)
- `currentStatus` (string: 'Payment Pending' | 'Payment Done' | 'Confirmed' | 'Ordered' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Return Picked' | 'Return Completed')
- `statusHistory` (array of objects: `{ status, timestamp, location/note }`)
- `estimatedDelivery` (timestamp)
