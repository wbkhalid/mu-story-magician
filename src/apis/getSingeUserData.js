import axios from 'axios';
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

export const getSingleUserData = async (id) => {
  const response = await axios.get(`${baseUrl}/api/user/${id}`);
  return response?.data;
};
