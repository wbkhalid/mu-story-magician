import axios from 'axios';
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

export const getSharedStory = async (id) => {
  const response = await axios.get(`${baseUrl}/api/stories/${id}`);
  return response?.data;
};

export const createShareStorylink = async (storyId, accessToken) => {
  const response = await axios.post(`${baseUrl}/api/stories/share`, storyId, {
    headers: {
      contentType: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response?.data;
};
