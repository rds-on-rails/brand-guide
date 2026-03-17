import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    imageUrl: string;
    stock: number;
    type: 'digital' | 'physical';
}

interface CartState {
    items: CartItem[];
    subtotal: number;
    tax: number;
    shipping: number;
    total: number; // This is now the grand total
}

const initialState: CartState = {
    items: [],
    subtotal: 0,
    tax: 0,
    shipping: 0,
    total: 0,
};

const calculateTotals = (state: CartState) => {
    state.subtotal = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    
    // 20% Tax rate
    state.tax = parseFloat((state.subtotal * 0.20).toFixed(2));
    
    // Flat 10 Euro shipping if any physical items are in cart, otherwise 0
    const hasPhysicalItems = state.items.some(item => item.type === 'physical');
    state.shipping = hasPhysicalItems ? 10.00 : 0.00;
    
    // Grand total
    state.total = parseFloat((state.subtotal + state.tax + state.shipping).toFixed(2));
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addToCart: (state, action: PayloadAction<CartItem>) => {
            const existingItem = state.items.find(item => item.id === action.payload.id);
            if (existingItem) {
                const newQuantity = existingItem.quantity + action.payload.quantity;
                existingItem.quantity = Math.min(newQuantity, existingItem.stock);
            } else {
                const newItem = { ...action.payload };
                newItem.quantity = Math.min(newItem.quantity, newItem.stock);
                if (newItem.quantity > 0) {
                    state.items.push(newItem);
                }
            }
            calculateTotals(state);
        },
        removeFromCart: (state, action: PayloadAction<string>) => {
            state.items = state.items.filter(item => item.id !== action.payload);
            calculateTotals(state);
        },
        clearCart: (state) => {
            state.items = [];
            calculateTotals(state);
        },
        updateQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
            const item = state.items.find(item => item.id === action.payload.id);
            if (item) {
                if (action.payload.quantity > 0) {
                    item.quantity = Math.min(action.payload.quantity, item.stock);
                } else {
                    state.items = state.items.filter(i => i.id !== action.payload.id);
                }
            }
            calculateTotals(state);
        }
    },
});

export const { addToCart, removeFromCart, clearCart, updateQuantity } = cartSlice.actions;
export default cartSlice.reducer;
