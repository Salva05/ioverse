import axiosInstance from "../api/axiosInstance";

// Service for chat-related API calls
const chatService = {
  // GET
  getConversations: async () => {
    const response = await axiosInstance.get("/chatbot/conversations");
    return response.data;
  },

  // GET (fetch sinle)
  getConversation: async (id) => {
    const response = await axiosInstance.get(`/chatbot/conversations/${id}`);
    return response.data;
  },

  // GET Shared conversation
  getSharedConversation: async (share_token) => {
    const response = await axiosInstance.get(`/chatbot/shared/${share_token}`);
    return response.data;
  },

  // GET Download the conversation as PDF
  downloadConversation: async (id) => {
    const response = await axiosInstance.get(
      `/chatbot/conversations/${id}/download`,
      {
        responseType: "blob", // Expects a file
      }
    );
    return response.data;
  },

  // DELETE
  deleteConversation: async (id) => {
    const response = await axiosInstance.delete(
      `/chatbot/conversations/${id}/`
    );
    return response.data;
  },

  // POST
  sendMessage: async (messageData) => {
    const response = await axiosInstance.post(
      "/chatbot/messages/",
      messageData
    ); // Requires trailing slash for POSTs
    return response.data;
  },
};

export default chatService;
