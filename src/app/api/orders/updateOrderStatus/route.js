import { NextResponse } from 'next/server';
import connectToDatabase from 'src/lib/mongodb';
import Order from 'src/models/Order';

await connectToDatabase();

export async function POST(req) {
  try {
    const requestBody = await req.json();
    console.log(requestBody, 'requestBody');
    const { order_id, status, external_id } = requestBody.data;

    if (!order_id || !status || !external_id) {
      return NextResponse.json(
        { success: false, message: 'Order ID and status are required' },
        { status: 400 }
      );
    }

    const orderStatus = status.name;
    console.log(orderStatus);

    const result = await Order.updateOne({ _id: external_id }, { $set: { status: orderStatus } });
    console.log(result);

    console.log('updatedorder', result);

    if (result.nModified === 0) {
      return NextResponse.json(
        { success: false, message: 'Order not found or status unchanged' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Status updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Internal server error:', error);

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
