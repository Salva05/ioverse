import axiosInstance from "../api/axiosInstance";

// Service object for chat-related API calls
const chatService = {
  // GET: Fetch Conversations
  getConversations: async () => {
    const response = await axiosInstance.get("/chatbot/conversations");
    return response.data;
  },

  // POST: Send a Message
  sendMessage: async (messageData) => {
    const response = await axiosInstance.post("/chatbot/send", messageData);
    return response.data;
  },
};

export default chatService;
