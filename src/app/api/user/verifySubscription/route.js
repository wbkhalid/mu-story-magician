import { NextResponse } from 'next/server';
import connectToDatabase from 'src/lib/mongodb';

import User from 'src/models/User';
import requireAuth from 'src/utils/requireAuth';

export async function GET(req) {
  try {
    await connectToDatabase();

    const userAuth = await requireAuth(req);

    const userId = userAuth._id;

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    const now = new Date();
    if (user.subscriptionExpiryDate <= now) {
      user.subscriptionPlan = null;
      user.numOfStories = 0;
      user.subscriptionExpiryDate = null;
      user.subscriptionStartDate = null;

      await user.save();

      return NextResponse.json({ success: true, message: 'Subscription expired' });
    }

    return NextResponse.json({ success: false, message: 'Subscription is still active' });
  } catch (error) {
    console.error('Error checking subscription:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
