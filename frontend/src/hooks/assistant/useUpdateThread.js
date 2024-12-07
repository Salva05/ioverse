import { useMutation, useQueryClient } from "@tanstack/react-query";
import { thread } from "../../api/assistant";
import { toast } from "react-toastify";

export const useUpdateThread = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ threadId, threadData }) => thread.update(threadId, threadData),
    onMutate: async ({ threadId, threadData }) => {
      await queryClient.cancelQueries(["threads"]);

      const previousThreads = queryClient.getQueryData(["threads"]);

      queryClient.setQueryData(["threads"], (oldData) => {
        if (!oldData) return [];
        return oldData.map((item) => (item.id === threadId ? threadData : item));
      });

      return { previousThreads };
    },
    onError: (error, context) => {
      console.log(error);

      // Rollback the cached data
      if (context?.previousThreads) {
        queryClient.setQueryData(["threads"], context.previousThreads);
      }

      const errorMessage =
        error.response?.data?.message ||
        "Failed to update the thread. Please try again later.";
      toast.error(`Error: ${errorMessage}`);
    },
  });
};
