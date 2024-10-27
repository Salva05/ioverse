import axiosInstance from "./axiosInstance";

// Service for chat-related API calls
const textToImage = {
  // GET
  getImages: async () => {
    const response = await axiosInstance.get(
      "/text-to-image/image-generations"
    );
    return response.data;
  },
  // POST
  createImage: async (payload) => {
    const response = await axiosInstance.post(
      "/text-to-image/image-generations/",
      payload
    );
    return response.data;
  },
};

export default textToImage;
