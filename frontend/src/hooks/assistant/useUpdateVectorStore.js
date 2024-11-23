import { useMutation, useQueryClient } from "@tanstack/react-query";
import { vectorStore } from "../../api/assistant";
import { toast } from "react-toastify";

export const useUpdateVectorStore = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, vectorStoreData }) => vectorStore.update(id, vectorStoreData),
    mutationKey: ["updateVectorStore"],
    onSuccess: (data) => {
      queryClient.setQueryData(['vectorStores'], (oldData) => {
        if (!oldData) return;
        return oldData.map((item) =>
          item.id === data.id ? data : item
        );
      });

      toast.success("Vector Store has been updated.");
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to update vector store. Please try again later.";
      toast.error(`Error: ${errorMessage}`);
    },
  });
};
