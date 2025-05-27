import axios from 'axios';
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

export const verifyPassword = async (data) => {
  const response = await axios.post(`${baseUrl}/api/profile/verifyPassword`, data, {
    contentType: 'application/json',
  });
  return response.data;
};

export const updateProfile = async (data) => {
  const accessToken = localStorage.getItem('accessToken');
  if (!accessToken) {
    throw new Error('No token found in local storage');
  }
  const response = await axios.put(`${baseUrl}/api/profile/updateProfile`, data, {
    headers: { authorization: `Bearer ${accessToken}` },
  });

  return response.data;
};
