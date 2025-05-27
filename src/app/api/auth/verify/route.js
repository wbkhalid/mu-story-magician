import { NextResponse } from 'next/server';
import connectToDatabase from 'src/lib/mongodb';
import SubscriptionPlan from 'src/models/SubscriptionPlan';
import User from 'src/models/User';

import VerificationToken from 'src/models/Verificationtoken';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Token is required' }, { status: 400 });
  }

  try {
    await connectToDatabase();

    const verificationToken = await VerificationToken.findOne({ token });

    if (!verificationToken || verificationToken.expiresAt < Date.now()) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
    }

    console.log(verificationToken, 'verification token log');

    const { password } = verificationToken.userData;
    const email = verificationToken.email;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    console.log(verificationToken, 'verificationToken.userData');
    const defaultPlan = await SubscriptionPlan.findOne({ slug: 'free' });

    if (!defaultPlan) {
      return NextResponse.json({ error: 'Subscription plan not found' }, { status: 409 });
    }

    const newUser = new User({
      email,
      password,
      noOfStories: 1,
      isVerified: true,
      subscriptionPlan: defaultPlan._id,
      subscriptionStartDate: new Date(),
    });

    await newUser.save();

    await VerificationToken.deleteOne({ token });

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/jwt/login`);
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
