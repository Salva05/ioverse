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

  // DELETE
  delete: async (id) => {
    const response = await axiosInstance.delete(`/assistant/${id}/delete/`);
    return response.data;
  },

  // POST
  create: async (assistantData) => {
    const response = await axiosInstance.post(
      "/assistant/create/",
      assistantData
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

  // POST
  create: async () => {
    const response = await axiosInstance.post("/assistant/thread/create/");
    return response.data;
  },

  // PUT
  update: async (threadId, threadData) => {
    const response = await axiosInstance.put(
      `/assistant/thread/${threadId}/update/`,
      threadData
    );
    return response.data;
  },

  // DELETE
  delete: async (threadId) => {
    const response = await axiosInstance.delete(
      `/assistant/thread/${threadId}/delete/`
    );
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

  // POST
  create: async (vectorStoreData) => {
    const response = await axiosInstance.post(
      "/assistant/vector_store/create/",
      vectorStoreData
    );
    return response.data;
  },

  // PUT
  update: async (id, vectorStore) => {
    const response = await axiosInstance.put(
      `/assistant/vector_store/${id}/update/`,
      vectorStore
    );
    return response.data;
  },

  // DELETE
  delete: async (id) => {
    const response = await axiosInstance.delete(
      `/assistant/vector_store/${id}/delete/`,
      vectorStore
    );
    return response.data;
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

// Service for Vector Store File-related API calls
export const vectorStoreFile = {
  // GET
  get: async (vectorStoreId) => {
    const response = await axiosInstance.get(
      `/assistant/vector_store_file/${vectorStoreId}/list/`
    );
    return response.data;
  },
};

// Service for Vector Store Batch-related API calls
export const vectorStoreBatch = {
  // POST
  create: async (batchData) => {
    const response = await axiosInstance.post(
      "/assistant/vector_store_batch/create/",
      batchData
    );
    return response.data;
  },
};

// Service for generations
export const generate = {
  // POST - System Instructions
  sys: async (message) => {
    const response = await axiosInstance.post(
      "/assistant/generate/system_instructions/",
      message
    );
    return response.data;
  },
  // POST - Function Tool
  fn: async (message) => {
    const response = await axiosInstance.post(
      "/assistant/generate/function/",
      message
    );
    return response.data;
  },
  // POST - Response Format
  schema: async (message) => {
    const response = await axiosInstance.post(
      "/assistant/generate/schema/",
      message
    );
    return response.data;
  },
};

// Service for Messages-related API calls
export const messages = {
  // GET
  get: async (threadId) => {
    const response = await axiosInstance.get(
      `/assistant/message/${threadId}/list/`,
      {
        params: { limit: 100, order: "asc" },
      }
    );
    return response.data;
  },

  // POST
  create: async (threadId, message) => {
    const response = await axiosInstance.post(
      `/assistant/message/${threadId}/create/`,
      message
    );
    return response.data;
  },
};

// Service for File images-related API calls
export const fileImage = {
  // GET
  get: async (id) => {
    const response = await axiosInstance.get(
      `/assistant/file_image/${id}/retrieve/`
    );
    return response.data;
  },
};
