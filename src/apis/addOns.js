import axios from 'axios';
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

export const getAddOnsData = async () => {
  const response = await axios.get(`${baseUrl}/api/addOns`);
  return response.data;
};
