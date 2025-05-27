import { NextResponse } from 'next/server';
import connectToDatabase from 'src/lib/mongodb';
import AddOns from 'src/models/AddOns';

export async function GET() {
  try {
    await connectToDatabase();

    const addOns = await AddOns.find();

    return NextResponse.json(addOns, { status: 200 });
  } catch (error) {
    console.error('Error fetching addOns:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
