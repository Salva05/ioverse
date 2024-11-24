import { useQuery } from "@tanstack/react-query";
import { vectorStore } from "../../api/assistant";
import { toast } from "react-toastify";

export const useRetrieveVectorStore = async () => {
  return useQuery({
    queryKey: ["vectorStore"],
    queryFn: (id) => vectorStore.retrieve(id),
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to retrieve Vector Store. Please try again later.";
      toast.error(`Error: ${errorMessage}`, {});
      console.error("Error fetching Vector Store:", error);
    },
  });
};
