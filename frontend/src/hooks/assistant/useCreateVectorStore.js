import { useMutation, useQueryClient } from "@tanstack/react-query";
import { vectorStore } from "../../api/assistant";
import { toast } from "react-toastify";

export const useCreateVectorStore = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vectorStoreData) => vectorStore.create(vectorStoreData),
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to create Vector Store. Please try again later.";

      if (error.response?.data?.error) {
        const errorDetail = JSON.stringify(error.response.data.error);

        // Extract unsupported file extensions
        const match = errorDetail.match(/Files with extensions \[(.*?)\]/);
        const unsupportedFiles = match ? match[1] : null;

        if (unsupportedFiles) {
          toast.error(
            `The following file types are not supported for retrieval: ${unsupportedFiles}.`,
            {}
          );
          return;
        }

        if (errorDetail.toLowerCase().includes("not supported for retrieval")) {
          toast.error("File not supported for retrieval.");
          return;
        }
      }

      toast.error(`Error: ${errorMessage}`, {});
      console.error("Error creating Vector Store:", error);
    },
  });
};
