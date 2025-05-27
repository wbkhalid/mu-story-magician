import { NextResponse } from 'next/server';
import connectToDatabase from 'src/lib/mongodb';
import Story from 'src/models/Story';
import { paths } from 'src/routes/paths';
import requireAuth from 'src/utils/requireAuth';

export async function POST(req) {
  try {
    await connectToDatabase();
    const user = await requireAuth(req);

    const { storyId } = await req.json();

    if (!user._id) {
      console.error('User ID is undefined');
      return NextResponse.json(
        { success: false, message: `Unauthorized user ${user._id}` },
        { status: 400 }
      );
    }

    const story = await Story.findById(storyId);

    if (!story) {
      return NextResponse.json({ error: 'story not found' }, { status: 403 });
    }

    const shareableLink = `${process.env.NEXT_PUBLIC_BASE_URL}${paths.sharedStory(storyId)}`;

    return NextResponse.json({ shareableLink }, { status: 200 });
  } catch (error) {
    console.error('Error sharing story:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
