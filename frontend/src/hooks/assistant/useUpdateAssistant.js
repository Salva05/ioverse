import { useMutation, useQueryClient } from "@tanstack/react-query";
import { assistant } from "../../api/assistant";
import { toast } from "react-toastify";

export const useUpdateAssistant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, assistantData }) => assistant.update(id, assistantData),
    mutationKey: ["updateAssistant"],
    onSuccess: (data, { customOnSuccess }) => {
      // Update the specific assistant in the cache
      queryClient.setQueryData(["assistants"], (oldData) => {
        if (!oldData) return;
        return oldData.map((item) => (item.id === data.id ? data : item));
      });

      toast.success("Assistant has been updated.");
      if (customOnSuccess) {
        customOnSuccess();
      }
    },
    onError: (error, { customOnError }) => {
      console.log(error);
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
