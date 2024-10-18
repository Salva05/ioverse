import { toast } from "react-toastify";
import axiosInstance from "../api/axiosInstance";

// Async function to share the conversation
const shareConversation = async (conversationId, hours) => {
  try {
    const response = await axiosInstance.post(
      `/chatbot/conversations/${conversationId}/share/`,
      { hours }
    );

    if (response.data.error) {
      throw new Error(response.data.error);
    }

    return response.data;
  } catch (error) {
    console.error(
      `Failed to share the conversation with ID: ${conversationId}`,
      error
    );

    const errorMessage =
      error.response?.data?.detail ||
      error.message ||
      "An unexpected error occurred while sharing the conversation.";

    toast.error(`Error: ${errorMessage}`);
  }
};

export default shareConversation;
