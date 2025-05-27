import { NextResponse } from 'next/server';
import AddOns from 'src/models/AddOns';

import User from 'src/models/User';
import requireAuth from 'src/utils/requireAuth';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY, {
  apiVersion: '2020-08-27',
});

export async function POST(req) {
  try {
    const { amount, token, userId, name } = await req.json();

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

      const addsOn = await AddOns.findOne({ name: name });
      if (!addsOn) {
        return NextResponse.json({ success: false, message: 'Add-on not found' }, 404);
      }

      user.addOns.push(addsOn._id);

      await user.save();

      const updatedUser = await User.findById(userId).populate('addOns');
      if (!updatedUser) {
        return NextResponse.json({ success: false, message: 'Updated user not found' }, 404);
      }

      return NextResponse.json({ success: true, paymentId: charge.id, user: updatedUser });
    } else {
      return NextResponse.json({ success: false, message: 'Payment failed' }, 400);
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Payment failed', error }, 500);
  }
}
