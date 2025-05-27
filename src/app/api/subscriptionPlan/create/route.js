import { NextResponse } from 'next/server';
import connectToDatabase from 'src/lib/mongodb';
import SubscriptionPlan from 'src/models/SubscriptionPlan';

export async function POST(req) {
  const { name, price, category, description, abilityToPurchase, slug, numOfStories } =
    await req.json();

  if (!name || price < 0 || !description || !abilityToPurchase) {
    return NextResponse.json({ error: 'Fields are required' }, { status: 400 });
  }

  try {
    await connectToDatabase();

    const planExists = await SubscriptionPlan.findOne({ name });

    if (planExists) {
      return NextResponse.json(
        { error: `Subscription plan with name ${name} already exists` },
        { status: 409 }
      );
    }

    const newSubscriptionPlan = new SubscriptionPlan({
      name,
      price,
      category: category || 'free',
      description,
      slug,
      abilityToPurchase,
      numOfStories: numOfStories || 1,
    });

    await newSubscriptionPlan.save();

    return NextResponse.json(
      { success: true, message: 'Subscription plan has been successfully created' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error creating subscription plan:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
