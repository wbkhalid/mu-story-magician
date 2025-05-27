import { NextResponse } from 'next/server';
import connectToDatabase from 'src/lib/mongodb';
import StoryBook from 'src/models/Story';
import User from 'src/models/User';

export async function GET(req, { params }) {
  const { id } = params;
  try {
    await connectToDatabase();

    const story = await StoryBook.findOne({ _id: id });

    if (!story) {
      return NextResponse.json({ error: `story with id ${id} not found ` }, { status: 404 });
    }

    return NextResponse.json({ success: true, story }, { status: 200 });
  } catch (error) {
    console.error('Error fetching strory:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
