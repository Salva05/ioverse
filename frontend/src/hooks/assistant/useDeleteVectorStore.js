import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { vectorStore } from "../../api/assistant";

export const useDeleteVectorStore = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => vectorStore.delete(id),
    onSuccess: (_, id) => {
      queryClient.setQueryData(["vectorStores"], (oldFiles) =>
        oldFiles ? oldFiles.filter((vs) => vs.id !== id) : []
      );
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to delete the Vector Store. Please try again later.";

      if (error.response?.data?.error) {
        const errorDetail = error.response.data.error.toLowerCase();
        if (errorDetail.includes("error code: 404")) {
          toast.error("Vector Store not found. It might have been already deleted.");
          return;
        }
      }
      toast.error(errorMessage);
    },
  });
};
