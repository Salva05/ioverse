import { useMutation, useQueryClient } from "@tanstack/react-query";
import { assistant } from "../../api/assistant";
import { toast } from "react-toastify";
import { useAssistantContext } from "../../contexts/AssistantContext";

export const useDeleteAssistant = () => {
  const queryClient = useQueryClient();
  const { setAssistant, setHasItems, setSelectedTab } = useAssistantContext();

  return useMutation({
    mutationFn: ({ id }) => assistant.delete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries(["assistants"]);
      toast.success("Assistant deleted successfully.");

      // Update context with the latest assistant
      queryClient.setQueryData(["assistants"], (oldAssistants) => {
        const updatedAssistants = oldAssistants?.filter(
          (assistant) => assistant.id !== id
        );
        if (updatedAssistants?.length > 0) {
          // Select the latest assistant
          const latestAssistant = updatedAssistants.reduce((latest, current) =>
            current.created_at > latest.created_at ? current : latest
          );
          setAssistant(latestAssistant);
        } else {
          setAssistant(null);
          setSelectedTab("Create");
          setHasItems(false);
        }
        return updatedAssistants;
      });
    },
    onError: (error) => {
      console.log(error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to delete assistant. Please try again later.";
      toast.error(`Error: ${errorMessage}`);
    },
  });
};
