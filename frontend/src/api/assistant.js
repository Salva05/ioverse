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
      assistant
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