import { useMutation, useQueryClient } from "@tanstack/react-query";
import { assistant } from "../../api/assistant";
import { toast } from "react-toastify";
import { useAssistantContext } from "../../contexts/AssistantContext";

export const useCreateAssistant = () => {
  const queryClient = useQueryClient();
  const { setAssistant } = useAssistantContext();

  const mutation = useMutation({
    mutationFn: (assistantData) => assistant.create(assistantData),
    onSuccess: (newAssistant) => {
      queryClient.setQueryData(["assistants"], (oldData) => {
        return oldData ? [...oldData, newAssistant] : [newAssistant];
      });
      toast.success(`Assistant created successfully.`);

      // Update the active assistant
      setAssistant(newAssistant);
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to create assistant. Please try again later.";
      toast.error(errorMessage);
    },
  });

  return mutation;
};
