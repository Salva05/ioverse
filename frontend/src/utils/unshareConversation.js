import { toast } from "react-toastify";
import axiosInstance from "../api/axiosInstance";

const unshareConversation = async (conversationId) => {
  try {
    const response = await axiosInstance.post(
      `/chatbot/conversations/${conversationId}/unshare/`
    );

    if (response.data.error) {
      throw new Error(response.data.error);
    }

    return response.data;
  } catch (error) {
    console.error(
      `Failed to unshare the conversation with ID: ${conversationId}`,
      error
    );

    const errorMessage =
      error.response?.data?.detail ||
      error.message ||
      "An unexpected error occurred while unsharing the conversation.";

    toast.error(`Error: ${errorMessage}`);
  }
};

export default unshareConversation;
