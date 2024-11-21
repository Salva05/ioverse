import axiosInstance from "./axiosInstance";

// Service for Assistant-related API calls
export const assistant = {
  // GET
  get: async () => {
    const response = await axiosInstance.get("/assistant/list/");
    return response.data;
  },

  // PUT
  update: async (id, assistant) => {
    const response = await axiosInstance.put(
      `/assistant/${id}/update/`,
      assistant
    );
    return response.data;
  },
};

// Service for Thread-related API calls
export const thread = {
  // This call queries the application's database
  // since OpenAI doesn't provide an API to list Threads
  getThreads: async () => {
    const response = await axiosInstance.get("/assistant/thread/list/");
    return response.data;
  },
};

// Service for Vector Stores-related API calls
export const vectorStore = {
  // GET
  get: async () => {
    const response = await axiosInstance.get("/assistant/vector_store/list/");
    return response.data;
  },

  // Retrieve
  retrieve: async (id) => {
    const response = axiosInstance.get(
      `/assistant/vector_store/${id}/retrieve/`
    );
    return (await response).data;
  },
};

// Service for Files-related API calls
export const files = {
  // GET
  get: async () => {
    const response = await axiosInstance.get("/assistant/file/list/");
    return response.data;
  },

  // POST
  create: async (fileData) => {
    const response = await axiosInstance.post(
      "/assistant/file/create/",
      fileData
    );
    return response.data;
  },

  // DELETE
  delete: async (id) => {
    const response = await axiosInstance.delete(
      `/assistant/file/${id}/delete/`
    );
    return response.data;
  },
};
