import { NextResponse } from 'next/server';
import connectToDatabase from 'src/lib/mongodb';
import SubscriptionPlan from 'src/models/SubscriptionPlan';

export async function PUT(req, { params }) {
  const { id } = params;

  const { name, price, category, description, abilityToPurchase, numOfStories } = await req.json();

  try {
    await connectToDatabase();

    const subscriptionPlan = await SubscriptionPlan.findOne({ _id: id });
    console.log('Subscription Plan found:', subscriptionPlan);

    if (!subscriptionPlan) {
      return NextResponse.json(
        { error: `SubscriptionPlan with id ${id} not found ` },
        { status: 404 }
      );
    }

    subscriptionPlan.name = name;
    subscriptionPlan.price = price;
    subscriptionPlan.category = category || 'free';
    subscriptionPlan.description = description;
    subscriptionPlan.abilityToPurchase = abilityToPurchase;
    subscriptionPlan.numOfStories = numOfStories || 1;

    await subscriptionPlan.save();

    return NextResponse.json(
      { success: true, message: 'Subscription plan has been successfully updated' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating subscription plan:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
