import axiosInstance from "./axiosInstance";

// Service for chat-related API calls
const textToImage = {
  // GET
  getImages: async () => {
    const response = await axiosInstance.get(
      "/text-to-image/image-generations/"
    );
    return response.data;
  },

  // POST for generating images
  generateImages: async (payload) => {
    const response = await axiosInstance.post(
      "/text-to-image/image-generations/generate/",
      payload
    );
    return response.data;
  },

  // POST for saving images
  createImage: async (payload) => {
    const response = await axiosInstance.post(
      "/text-to-image/image-generations/",
      payload
    );
    return response.data;
  },

  // DELETE
  deleteImage: async (id) => {
    const response = await axiosInstance.delete(
      `/text-to-image/image-generations/${id}/`
    );
  },

  // GET Shared image
  getSharedImage: async (share_token) => {
    const response = await axiosInstance.get(`/text-to-image/shared/${share_token}/`);
    return response.data;
  },
};

export default textToImage;
