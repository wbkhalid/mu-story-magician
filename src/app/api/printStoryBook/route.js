import { NextResponse } from 'next/server';
import requireAuth from 'src/utils/requireAuth';

export async function POST(req) {
  const {
    contact_email,
    external_id,
    line_items,
    accessToken,
    production_delay,
    shipping_address,
    shipping_level,
  } = await req.json();

  console.log(contact_email, shipping_address, shipping_level, external_id);

  const userAuth = await requireAuth(req);

  const options = {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Cache-Control': 'no-cache',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contact_email,
      external_id,
      line_items,
      production_delay,
      shipping_address,
      shipping_level,
    }),
  };

  try {
    const response = await fetch('https://api.sandbox.lulu.com/print-jobs/', options);
    const data = await response.json();
    if (!response.ok) {
      console.log(data);
      return NextResponse.json({ error: data });
    }
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message });
  }
}
