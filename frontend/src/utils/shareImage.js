import { toast } from "react-toastify";
import axiosInstance from "../api/axiosInstance";

const shareImage = async (imageId, hours) => {
  try {
    const response = await axiosInstance.post(
      `/text-to-image/image-generations/${imageId}/share/`,
      { hours }
    );

    if (response.data.error) {
      throw new Error(response.data.error);
    }
    return response.data;
  } catch (error) {
    console.error(
      `Failed to share the image with ID: ${imageId}`,
      error
    );

    const errorMessage =
      error.response?.data?.detail ||
      error.message ||
      "An unexpected error occurred while sharing the image.";

    toast.error(`Error: ${errorMessage}`);
  }
};

export default shareImage;
