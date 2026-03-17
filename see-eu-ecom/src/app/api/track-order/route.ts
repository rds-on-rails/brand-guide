import { NextResponse } from 'next/server';
import { OrderStatus } from '@/store/orderSlice';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('id');
    const orderType = searchParams.get('type') || 'digital';

    if (!orderId) {
        return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const digitalStatuses: OrderStatus[] = ['Payment Pending', 'Payment Done', 'Confirmed'];
    const physicalStatuses: OrderStatus[] = ['Ordered', 'Shipped', 'Out for Delivery', 'Delivered', 'Return Picked', 'Return Completed'];

    const statuses = orderType === 'digital' ? digitalStatuses : physicalStatuses;

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Return a random status based on type
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

    return NextResponse.json({ id: orderId, status: randomStatus });
}
