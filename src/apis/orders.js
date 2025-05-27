import axios from 'axios';
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

export const getOrdersByUserId = async (userId) => {
  const response = await axios.get(`${baseUrl}/api/orders/${userId}`);
  return response?.data;
};
