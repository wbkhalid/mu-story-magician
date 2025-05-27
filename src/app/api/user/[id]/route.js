import { NextResponse } from 'next/server';
import connectToDatabase from 'src/lib/mongodb';
import User from 'src/models/User';
import SubscriptionPlan from 'src/models/SubscriptionPlan';
import AddOns from 'src/models/AddOns';

export async function GET(req, { params }) {
  const { id } = params;
  try {
    await connectToDatabase();

    const user = await User.findById(id).populate('subscriptionPlan').populate('addOns').exec();

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
