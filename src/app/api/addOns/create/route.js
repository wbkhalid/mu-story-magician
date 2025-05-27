import { NextResponse } from 'next/server';
import connectToDatabase from 'src/lib/mongodb';
import AddOns from 'src/models/AddOns';

export async function POST(req) {
  console.log(req);
  const { name, price, description } = await req.json();

  if (!name || price < 0 || !description) {
    return NextResponse.json({ error: 'Fields are required' }, { status: 400 });
  }

  try {
    await connectToDatabase();

    const AddOnExist = await AddOns.findOne({ name });

    if (AddOnExist) {
      return NextResponse.json(
        { error: `AddOn with name ${name} already exists` },
        { status: 409 }
      );
    }

    const newAddOn = new AddOns({
      name,
      price,
      description,
    });

    await newAddOn.save();

    return NextResponse.json(
      { success: true, message: 'AddOn has been successfully created' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error creating AddOn:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
