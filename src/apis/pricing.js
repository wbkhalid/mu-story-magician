import axios from 'axios';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

export const getPricingData = async () => {
  try {
    const response = await axios.get(`${baseUrl}/api/subscriptionPlan`);
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch pricing data.');
  }
};

export const stripeCharge = async (
  slug,
  amount,
  token,
  userId,
  name,
  numOfStories,
  accessToken
) => {
  try {
    const response = await axios.post(
      `${baseUrl}/api/checkoutSession`,
      {
        token: token,
        userId: userId,
        subscriptionPlanSlug: slug,
        amount: amount,
        description: name,
        numOfStories: numOfStories,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error('Failed to process payment. Please try again.');
  }
};

export const stripeChargeForAddsOn = async (name, amount, quantity, token, userId, accessToken) => {
  try {
    const response = await axios.post(
      `${baseUrl}/api/addOns/checkoutSession`,
      {
        token: token,
        userId: userId,
        name: name,
        amount: amount,
        quantity: quantity,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error('Failed to process payment. Please try again.');
  }
};
export const stripeChargeForHardCoverBook = async (
  name,
  amount,
  quantity,
  token,
  userId,
  accessToken
) => {
  try {
    const response = await axios.post(
      `${baseUrl}/api/printStoryBook/checkoutSession`,
      {
        token: token,
        userId: userId,
        name: name,
        amount: amount,
        quantity: quantity,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error) {
    throw new Error('Failed to process payment. Please try again.');
  }
};
