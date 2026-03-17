export type OrderStatus = 'Ordered' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled';

export interface Order {
  id: string;
  date: string;
  items: any[];
  totalAmount: number;
  shippingAddress: any;
  customerName: string;
  customerEmail: string;
  paymentStatus: string;
  status: OrderStatus;
  trackingUpdates: { status: OrderStatus; timestamp: string; note?: string }[];
}

// In-memory store for orders to simulate backend
let mockOrders: Order[] = [];

export const createOrder = (orderData: Partial<Order>) => {
  const newOrder: Order = {
    id: `GP-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
    date: new Date().toISOString(),
    items: orderData.items || [],
    totalAmount: orderData.totalAmount || 0,
    shippingAddress: orderData.shippingAddress,
    customerName: orderData.customerName || '',
    customerEmail: orderData.customerEmail || '',
    paymentStatus: orderData.paymentStatus || 'Pending',
    status: 'Ordered',
    trackingUpdates: [
      {
        status: 'Ordered',
        timestamp: new Date().toISOString(),
        note: 'Order placed waiting for confirmation',
      }
    ]
  };
  
  mockOrders.unshift(newOrder); // Add to beginning
  // Save to local storage for persistence across reloads (in browser only)
  if (typeof window !== 'undefined') {
    localStorage.setItem('gp_mock_orders', JSON.stringify(mockOrders));
  }
  return newOrder;
};

export const getOrders = (): Order[] => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('gp_mock_orders');
    if (saved) {
      mockOrders = JSON.parse(saved);
    }
  }
  return mockOrders;
};

export const getOrderById = (id: string): Order | undefined => {
  const orders = getOrders();
  return orders.find(o => o.id === id);
};

export const updateOrderStatus = (orderId: string, newStatus: OrderStatus, note?: string) => {
  const orders = getOrders();
  const orderIndex = orders.findIndex(o => o.id === orderId);
  if (orderIndex !== -1) {
    orders[orderIndex].status = newStatus;
    orders[orderIndex].trackingUpdates.push({
      status: newStatus,
      timestamp: new Date().toISOString(),
      note
    });
    mockOrders = orders;
    if (typeof window !== 'undefined') {
      localStorage.setItem('gp_mock_orders', JSON.stringify(mockOrders));
    }
    return orders[orderIndex];
  }
  return null;
};
