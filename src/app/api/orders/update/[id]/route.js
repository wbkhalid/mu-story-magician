import { NextResponse } from 'next/server';
import connectToDatabase from 'src/lib/mongodb';
import AddOns from 'src/models/AddOns';
import Order from 'src/models/Order';
import User from 'src/models/User';
import requireAuth from 'src/utils/requireAuth';

export async function PUT(req, { params }) {
  const { id } = params;

  const { status, shippingLevel, dropShipId, orderId, contactEmail } = await req.json();

  const userAuth = await requireAuth(req);

  try {
    await connectToDatabase();

    const order = await Order.findOne({ _id: id });
    console.log('Order found:', order);

    if (!order) {
      return NextResponse.json({ error: `Order with id ${id} not found ` }, { status: 404 });
    }

    order.status = status;
    order.dropShipId = dropShipId;
    order.shippingLevel = shippingLevel;
    order.orderId = orderId;
    order.contactEmail = contactEmail;

    await order.save();

    const user = await User.findById(userAuth._id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const addOnToRemove = await AddOns.findOne({ name: 'Hard cover (print a book)' });
    if (!addOnToRemove) {
      return NextResponse.json({ error: 'Add-on not found' }, { status: 404 });
    }

    console.log('User add-ons before removal:', user.addOns);

    user.addOns = user.addOns.filter((addOnId) => !addOnId.equals(addOnToRemove._id));

    console.log('User add-ons after removal:', user.addOns);
    user.save();

    return NextResponse.json(
      { success: true, message: 'Order has been successfully updated' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating Order:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
