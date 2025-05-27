import { NextResponse } from 'next/server';
import connectToDatabase from 'src/lib/mongodb';
import Story from 'src/models/Story';

export async function DELETE(req, { params }) {
  const { id } = params;
  console.log(id);
  try {
    await connectToDatabase();

    const story = await Story.findOne({ _id: id });
    console.log('Story found:', story);

    if (!story) {
      return NextResponse.json({ error: `Story with id ${id} not found ` }, { status: 404 });
    }

    await story.deleteOne();

    return NextResponse.json(
      { success: true, message: 'Story has been successfully Deleted' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleteing story:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
