import axios from 'axios';
import { NextResponse } from 'next/server';

import requireAuth from 'src/utils/requireAuth';
import User from 'src/models/User';

export async function POST(req) {
  const { shippingAddress } = await req.json();

  const userAuth = await requireAuth(req);

  try {
    const shippingOptions = await getShippingOptions(shippingAddress);
    console.log(shippingOptions);

    return NextResponse.json({
      shippingOptions,
      success: true,
    });
  } catch (error) {
    console.error('Error:', error.message);
    return NextResponse.json({ error: error.message });
  }
}

const getShippingOptions = async (shippingAddress) => {
  let data = JSON.stringify({
    currency: 'USD',
    line_items: [
      {
        page_count: 24 * shippingAddress?.quantity,
        pod_package_id: process.env.NEXT_PUBLIC_LULU_POD_PACKAGE_ID,
        quantity: shippingAddress?.quantity,
      },
    ],
    shipping_address: {
      city: shippingAddress.city,
      country: shippingAddress.country,
      postcode: shippingAddress.postCode,
      state_code: shippingAddress.stateCode,
      street1: shippingAddress.street,
    },
  });

  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://api.sandbox.lulu.com/shipping-options/',
    headers: {
      'Content-Type': 'application/json',
    },
    data: data,
  };
  try {
    const response = await axios.request(config);
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
