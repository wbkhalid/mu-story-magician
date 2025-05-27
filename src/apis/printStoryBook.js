import axios from 'axios';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

export const generateTokenAndGetPrintCost = async (data, authToken) => {
  try {
    const response = await axios.post(`${baseUrl}/api/printStoryBook/generateToken`, data, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error in generateTokenAndGetPrintCost:', error.response?.data || error.message);
    throw new Error('Failed to get access token from lulu.');
  }
};

export const printStoryBook = async (authToken, payload) => {
  try {
    const response = await axios.post(`${baseUrl}/api/printStoryBook`, payload, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error) {
    console.log(error, 'error from print cost api');
  }
};

export const shippingInfo = async (data, accessToken) => {
  const response = await axios.post(`${baseUrl}/api/printStoryBook/getShippingOptions`, data, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.data;
};

export const updateOrderStatus = async (id, status, accessToken) => {
  const response = await axios.put(`${baseUrl}/api/orders/update/${id}`, status, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });
  return response?.data;
};
