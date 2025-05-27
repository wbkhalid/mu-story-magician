import { NextResponse } from 'next/server';
import connectToDatabase from 'src/lib/mongodb';
import User from 'src/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function PUT(req) {
  try {
    await connectToDatabase();

    const { name, newPassword } = await req.json();

    const token = req.headers.get('authorization');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const bearerToken = token.split(' ')[1];
    if (!bearerToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let decoded;
    try {
      decoded = jwt.verify(bearerToken, process.env.NEXT_PUBLIC_JWT_SECRET);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (name) {
      user.name = name;
    }

    if (newPassword) {
      user.password = await bcrypt.hash(newPassword, 10);
    }

    await user.save();
    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
