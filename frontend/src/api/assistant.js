import axiosInstance from "./axiosInstance";

// Service for Assistant-related API calls
export const assistant = {
  getAssistants: async () => {
    const response = await axiosInstance.get(
      "/assistant/list/"
    );
    return response.data;
  },
  update: async (id, assistant) => {
    const response = await axiosInstance.put(
      `/assistant/${id}/update/`,
      assistant
    );
    return response.data;
  }
};

// Service for Thread-related API calls
export const thread = {
    // This call queries the application's database
    // since OpenAI doesn't provide an API to list Threads
    getThreads: async () => {
        const response = await axiosInstance.get("/assistant/thread/list/");
        return response.data;
    }
}
