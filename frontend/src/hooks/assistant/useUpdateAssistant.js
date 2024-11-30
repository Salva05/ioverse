import { useMutation, useQueryClient } from "@tanstack/react-query";
import { assistant } from "../../api/assistant";
import { toast } from "react-toastify";
import { useAssistantContext } from "../../contexts/AssistantContext";

export const useUpdateAssistant = () => {
  const queryClient = useQueryClient();
  const { setAssistant } = useAssistantContext();

  return useMutation({
    mutationFn: ({ id, assistantData}) => assistant.update(id, assistantData),
    mutationKey: ["updateAssistant"],
    onMutate: async ({ id, assistantData }) => {
      await queryClient.cancelQueries(["assistants"]);

      const previousAssistants = queryClient.getQueryData(["assistants"]);

      queryClient.setQueryData(["assistants"], (oldData) => {
        if (!oldData) return [];
        return oldData.map((item) => (item.id === id ? assistantData : item));
      });

      return { previousAssistants };
    },
    onError: (error, { customOnError }, context) => {
      console.log(error);

      // Rollback the cached data
      if (context?.previousAssistants) {
        queryClient.setQueryData(["assistants"], context.previousAssistants);
      }

      if (customOnError) {
        customOnError(error); // Component-specific callback for error handling
      } else {
        const errorMessage =
          error.response?.data?.message ||
          "Failed to update assistant. Please try again later.";
        toast.error(`Error: ${errorMessage}`);
      }
    },
  });
};
