import { NextResponse } from 'next/server';
import connectToDatabase from 'src/lib/mongodb';
import Story from 'src/models/Story';

export async function GET(req) {
  const { storyId } = req.query;

  try {
    await connectToDatabase();

    const story = await Story.findById(storyId);

    if (!story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    return NextResponse.json({ story }, { status: 200 });
  } catch (error) {
    console.error('Error fetching story:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
