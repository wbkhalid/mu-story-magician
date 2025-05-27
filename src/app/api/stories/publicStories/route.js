import { NextResponse } from 'next/server';
import connectToDatabase from 'src/lib/mongodb';
import Story from 'src/models/Story';
import User from 'src/models/User';
import requireAuth from 'src/utils/requireAuth';

export async function GET(req) {
  try {
    await connectToDatabase();

    const userAuth = await requireAuth(req);

    const story = await Story.find({ type: 'public' });

    return NextResponse.json(story, { success: true, status: 200 });
  } catch (error) {
    console.error('Error fetching stories:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
