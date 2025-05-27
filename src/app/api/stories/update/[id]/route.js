import { NextResponse } from 'next/server';
import connectToDatabase from 'src/lib/mongodb';
import requireAuth from 'src/utils/requireAuth';
import Story from 'src/models/Story';

export async function PUT(req, { params }) {
  const { id } = params;
  console.log('Story ID:', id);

  try {
    const { title, coverphoto, type, pageContent, dedicationPage, writer } = await req.json();

    await connectToDatabase();

    const user = await requireAuth(req);

    const updateFields = {};
    if (title !== undefined) updateFields.title = title;
    if (writer !== undefined) updateFields.writer = writer;
    if (coverphoto !== undefined) updateFields.coverphoto.bestImageUrl = coverphoto.bestImageUrl;
    if (type !== undefined) updateFields.type = type;
    if (pageContent !== undefined) updateFields.pageContent = pageContent;
    if (dedicationPage !== undefined) updateFields.dedicationPage = dedicationPage;

    const updatedStory = await Story.findOneAndUpdate(
      { _id: id, user: user._id },
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updatedStory) {
      console.log('Story not found or user not authorized');
      return NextResponse.json({ success: false, message: 'Story not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedStory }, { status: 200 });
  } catch (error) {
    console.error('Error updating story:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}
