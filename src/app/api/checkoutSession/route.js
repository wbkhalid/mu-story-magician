import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import SubscriptionPlan from 'src/models/SubscriptionPlan';
import User from 'src/models/User';
import requireAuth from 'src/utils/requireAuth';
import moment from 'moment';

const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15',
});

export async function POST(req) {
  try {
    const { token, userId, subscriptionPlanSlug, name, numOfStories } = await req.json();

    const userAuth = await requireAuth(req);

    const user = await User.findById(userId).exec();
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    let customer;
    if (user.stripeCustomerId) {
      customer = await stripe.customers.retrieve(user.stripeCustomerId);
    } else {
      customer = await stripe.customers.create({
        email: user.email,
        source: token.id,
        name,
      });

      user.stripeCustomerId = customer.id;
      await user.save();
    }

    const plan = await SubscriptionPlan.findOne({ slug: subscriptionPlanSlug }).exec();
    if (!plan) {
      return NextResponse.json(
        { success: false, message: 'Subscription plan not found' },
        { status: 404 }
      );
    }

    const priceId = plan.stripePriceId;
    if (!priceId) {
      return NextResponse.json(
        { success: false, message: 'Price ID not found for the subscription plan' },
        { status: 404 }
      );
    }

    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      expand: ['latest_invoice.payment_intent'],
    });

    user.subscriptionPlan = plan._id;
    user.numOfStories = numOfStories;
    const currentDate = new Date();
    const endDate = moment(currentDate).add(1, 'month').toDate();
    user.subscriptionStartDate = currentDate;
    user.subscriptionExpiryDate = endDate;
    user.stripeSubscriptionId = subscription.id;

    await user.save();

    return NextResponse.json({ success: true, subscriptionId: subscription.id, user });
  } catch (error) {
    console.error('Error processing subscription:', error);
    return NextResponse.json(
      { success: false, message: 'Subscription creation failed', error: error.message },
      { status: 500 }
    );
  }
}
