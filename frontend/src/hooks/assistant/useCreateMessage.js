import { useMutation, useQueryClient } from "@tanstack/react-query";
import { messages } from "../../api/assistant";
import { toast } from "react-toastify";

export const useCreateMessage = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ threadId, message }) => messages.create(threadId, message),
    onMutate: async ({ threadId, message }) => {
      await queryClient.cancelQueries(["messages", threadId]);

      // Snapshot the current cache value
      const previousMessages =
        queryClient.getQueryData(["messages", threadId]) || [];

      // Create an optimistic message object
      const optimisticMessage = {
        id: "temp-id-" + Date.now(),
        thread_id: message.thread_id,
        role: message.role,
        content: message.content,
        created_at: Math.floor(Date.now() / 1000),
        attachments: [],
      };

      // Optimistically update the cache
      queryClient.setQueryData(["messages", threadId], (old) => [
        ...(old || []),
        optimisticMessage,
      ]);

      // Return context with the previous messages data
      return { previousMessages };
    },
    onSuccess: (newMessage, { threadId }) => {
      queryClient.setQueryData(["messages", threadId], (oldMessages) => {
        // Replace the optimistic message
        const filteredMessages = (oldMessages || []).filter(
          (msg) => !String(msg.id).startsWith("temp-id")
        );
        return [...filteredMessages, newMessage];
      });
    },
    onError: (error, { threadId }, context) => {
      // Rollback
      queryClient.setQueryData(
        ["messages", threadId],
        context.previousMessages
      );

      const errorMessage =
        error.response?.data ||
        "Failed to create the message. Please try again later.";
      toast.error(errorMessage);
    },
  });

  return mutation;
};
