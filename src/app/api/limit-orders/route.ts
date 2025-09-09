import { NextRequest, NextResponse } from 'next/server';

interface LimitOrder {
  id: string;
  user: string;
  [key: string]: unknown;
}

// Simple in-memory storage for demo purposes
// In production, this would use a proper database
const limitOrders: LimitOrder[] = [];

export async function POST(request: NextRequest) {
  try {
    const order = await request.json();
    
    // Validate the order data
    if (!order.id || !order.user || !order.tokenIn || !order.tokenOut) {
      return NextResponse.json(
        { error: 'Invalid order data' },
        { status: 400 }
      );
    }

    // Store the order
    limitOrders.push(order);

    return NextResponse.json(
      { success: true, orderId: order.id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating limit order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userAddress = searchParams.get('user');

    if (!userAddress) {
      return NextResponse.json(
        { error: 'User address required' },
        { status: 400 }
      );
    }

    // Filter orders by user
    const userOrders = limitOrders.filter(order => order.user === userAddress);

    return NextResponse.json({ orders: userOrders });
  } catch (error) {
    console.error('Error fetching limit orders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('id');

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID required' },
        { status: 400 }
      );
    }

    // Find and remove the order
    const orderIndex = limitOrders.findIndex(order => order.id === orderId);
    
    if (orderIndex === -1) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    limitOrders.splice(orderIndex, 1);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting limit order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
