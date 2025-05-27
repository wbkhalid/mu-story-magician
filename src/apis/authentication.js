import axios from 'axios';
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

export const signUp = async (data) => {
  const response = await axios.post(`${baseUrl}/api/auth/register`, data, {
    contentType: 'application/json',
  });

  return response.data;
};

export const userLogin = async (data) => {
  const response = await axios.post(`${baseUrl}/api/auth/login`, data, {
    contentType: 'application/json',
  });

  return response.data;
};
