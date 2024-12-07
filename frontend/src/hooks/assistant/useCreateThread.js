import { useMutation, useQueryClient } from "@tanstack/react-query";
import { thread } from "../../api/assistant";
import { toast } from "react-toastify";

export const useCreateThread = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => thread.create(),
    onSuccess: (newThreads) => {
      queryClient.setQueryData(["threads"], (oldThreads) => {
        return oldThreads ? [...oldThreads, newThreads] : [newThreads];
      });
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data ||
        "Failed to create the thread. Please try again later.";
      toast.error(errorMessage);
    },
  });

  return mutation;
};
