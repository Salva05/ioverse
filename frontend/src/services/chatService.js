import axiosInstance from "../api/axiosInstance";

// Service for chat-related API calls
const chatService = {
  // GET: Fetch Conversations
  getConversations: async () => {
    const response = await axiosInstance.get("/chatbot/conversations");
    return response.data;
  },

  // GET: Fetch a single conversation
  getConversation: async (id) => {
    const response = await axiosInstance.get(`/chatbot/conversations/${id}`);
    return response.data;
  },

  // POST: Send a Message
  sendMessage: async (messageData) => {
    const response = await axiosInstance.post("/chatbot/messages/", messageData); // Requires trailing slash for POSTs
    return response.data;
  },
};

export default chatService;
