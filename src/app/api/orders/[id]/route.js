import { NextResponse } from 'next/server';
import connectToDatabase from 'src/lib/mongodb';
import Order from 'src/models/Order';

export async function GET(req, { params }) {
  const { id } = params;
  if (!id) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    await connectToDatabase();

    console.log(id);

    const orders = await Order.find({ userId: id });
    console.log(orders);

    return NextResponse.json(orders, { status: 200 });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
