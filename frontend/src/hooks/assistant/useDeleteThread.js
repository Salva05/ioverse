import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { thread } from "../../api/assistant";

export const useDeleteThread = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => thread.delete(id),
    onSuccess: (_, id) => {
      queryClient.setQueryData(["threads"], (oldThreads) =>
        oldThreads ? oldThreads.filter((thread) => thread.id !== id) : []
      );
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to delete the thread. Please try again later.";

      // Check for specific error patterns
      if (error.response?.data?.error) {
        const errorDetail = error.response.data.error.toLowerCase();
        if (errorDetail.includes("error code: 404")) {
          toast.error("Thread not found. It might have been already deleted.");
          return;
        }
      }
      toast.error(errorMessage);
    },
  });
};
