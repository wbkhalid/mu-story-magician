import { NextResponse } from 'next/server';
import Order from 'src/models/Order';
import User from 'src/models/User';
import requireAuth from 'src/utils/requireAuth';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY, {
  apiVersion: '2020-08-27',
});

export async function POST(req) {
  try {
    const { amount, token, userId, name, quantity } = await req.json();

    const userAuth = await requireAuth(req);

    const charge = await stripe.charges.create({
      amount: amount * 100,
      currency: 'usd',
      source: token.id,
      description: name,
    });

    if (charge.status === 'succeeded') {
      const user = await User.findById(userId);
      if (!user) {
        return NextResponse.json({ success: false, message: 'User not found' }, 404);
      }

      const order = new Order({ amount, quantity, name, userId: user._id, paymentId: charge.id });
      await order.save();
      user.orders.push(order._id);
      await user.save();

      return NextResponse.json({
        success: true,
        paymentId: charge.id,
        user: user,
        orderId: order._id,
      });
    } else {
      return NextResponse.json({ success: false, message: 'Payment failed' }, 400);
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Payment failed', error }, 500);
  }
}
