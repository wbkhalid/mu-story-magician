import { NextResponse } from 'next/server';
import connectToDatabase from 'src/lib/mongodb';
import User from 'src/models/User';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  const { userId, existingPassword } = await req.json();

  if (!userId || !existingPassword) {
    return NextResponse.json(
      { error: 'User ID and existing password are required' },
      { status: 400 }
    );
  }

  try {
    await connectToDatabase();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isPasswordValid = await bcrypt.compare(existingPassword, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid existing password' },
        { status: 401 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Internal server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
