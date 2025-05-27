import axios from 'axios';
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
export const verifySubscription = async (accessToken) => {
  const response = await axios.get(`${baseUrl}/api/user/verifySubscription`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response?.data;
};
