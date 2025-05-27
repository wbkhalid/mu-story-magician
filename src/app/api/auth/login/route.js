import { NextResponse } from 'next/server';
import connectToDatabase from 'src/lib/mongodb';
import User from 'src/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import SubscriptionPlan from 'src/models/SubscriptionPlan';
import AddOns from 'src/models/AddOns';

export async function POST(req) {
  console.log('Request received');
  const { email, password } = await req.json();

  console.log('Request body:', { email, password });

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
  }

  try {
    await connectToDatabase();
    console.log('Database connected');

    const user = await User.findOne({ email }).populate('subscriptionPlan').populate('addOns');
    console.log('User found:', user);

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('Password valid:', isPasswordValid);

    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const token = jwt.sign({ userId: user._id }, process.env.NEXT_PUBLIC_JWT_SECRET, {
      expiresIn: '360h',
    });

    console.log('Token generated:', token);

    return NextResponse.json({ success: true, user: user, token }, { status: 200 });
  } catch (error) {
    console.error('Internal server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
