import { toast } from "react-toastify";
import axiosInstance from "../api/axiosInstance";

const unshareImage = async (imageId) => {
  try {
    const response = await axiosInstance.post(
      `/text-to-image/image-generations/${imageId}/unshare/`
    );

    if (response.data.error) {
      throw new Error(response.data.error);
    }

    return response.data;
  } catch (error) {
    console.error(
      `Failed to unshare the conversation with ID: ${imageId}`,
      error
    );

    const errorMessage =
      error.response?.data?.detail ||
      error.message ||
      "An unexpected error occurred while unsharing the image.";

    toast.error(`Error: ${errorMessage}`);
  }
};

export default unshareImage;
