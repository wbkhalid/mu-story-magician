import { NextResponse } from 'next/server';
import connectToDatabase from 'src/lib/mongodb';
import SubscriptionPlan from 'src/models/SubscriptionPlan';

export async function GET() {
  try {
    await connectToDatabase();

    const subscriptionPlans = await SubscriptionPlan.find();

    return NextResponse.json(subscriptionPlans, { status: 200 });
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
