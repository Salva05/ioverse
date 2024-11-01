import { toast } from "react-toastify";
import textToImage from "../api/textToImage";

export const imageService = {
  saveImage: async (payload, src) => {
    // POST
    let imageSrc = src;
    if (src.startsWith("data:image")) {
      imageSrc = src.split(",")[1]; // clean if it's base64
    }
    // include the src in the payload
    payload.image_data = imageSrc; // check whether is url or base64
    try {
      const response = await textToImage.createImage(payload);
      console.log("Image saved successfully.");
      return response;
    } catch (err) {
      console.log("An error occurred while saving the image:", err);
      toast.error(`Error: ${err.response?.statusText || "Request failed"}`);
    }
  },
  deleteImage: async (id) => {
    try {
      const response = await textToImage.deleteImage(id);
      console.log("Image removed successfully.");
      return response;
    } catch (err) {
      console.log("An error occurred deleting the image:", err);
      toast.error(err);
    }
  },
};
