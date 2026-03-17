import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CartItem } from './cartSlice';

export type OrderStatus =
    | 'Payment Pending' | 'Payment Done' | 'Confirmed' // Digital
    | 'Ordered' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Return Picked' | 'Return Completed'; // Physical

export type OrderType = 'digital' | 'physical';

export interface Order {
    id: string;
    items: CartItem[];
    total: number;
    status: OrderStatus;
    orderType: OrderType;
    date: string;
    shippingAddress: {
        fullName: string;
        street: string;
        city: string;
        pinCode: string;
    };
}

interface OrderState {
    orders: Order[];
    currentOrder: Order | null;
}

const initialState: OrderState = {
    orders: [],
    currentOrder: null,
};

const orderSlice = createSlice({
    name: 'order',
    initialState,
    reducers: {
        placeOrder: (state, action: PayloadAction<Order>) => {
            state.orders.push(action.payload);
            state.currentOrder = action.payload;
        },
        updateOrderStatus: (state, action: PayloadAction<{ id: string; status: OrderStatus }>) => {
            const order = state.orders.find(o => o.id === action.payload.id);
            if (order) {
                order.status = action.payload.status;
            }
            if (state.currentOrder?.id === action.payload.id) {
                state.currentOrder.status = action.payload.status;
            }
        },
        clearCurrentOrder: (state) => {
            state.currentOrder = null;
        }
    },
});

export const { placeOrder, updateOrderStatus, clearCurrentOrder } = orderSlice.actions;
export default orderSlice.reducer;
