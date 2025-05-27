import axios from 'axios';
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

export const createStoryApi = async (data, accessToken) => {
  const response = await axios.post(`${baseUrl}/api/stories/create`, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.data;
};

export const getAllStories = async (accessToken) => {
  const response = await axios.get(`${baseUrl}/api/stories`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response?.data;
};

export const getSingleStory = async (id) => {
  const response = await axios.get(`${baseUrl}/api/stories/${id}`);
  return response?.data;
};

export const deleteStory = async (id) => {
  const response = await axios.delete(`${baseUrl}/api/stories/delete/${id}`);
  return response?.data;
};

export const editStory = async (id, data, accessToken) => {
  const response = await axios.put(`${baseUrl}/api/stories/update/${id}`, data, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });
  return response?.data;
};

export const getUpdateStoryImages = async (data, accessToken) => {
  const response = await axios.post(`${baseUrl}/api/stories/updateStoryImage`, data, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });
  return response?.data;
};

export const getUpdatedCoverPhoto = async (data, accessToken) => {
  const response = await axios.post(`${baseUrl}/api/stories/updateCoverphoto`, data, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });
  return response?.data;
};

export const getPublicStories = async (accessToken) => {
  const response = await axios.get(`${baseUrl}/api/stories/publicStories`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response?.data;
};
