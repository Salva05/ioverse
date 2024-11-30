import { useMutation, useQueryClient } from "@tanstack/react-query";
import { assistant } from "../../api/assistant";
import { toast } from "react-toastify";
import { useAssistantContext } from "../../contexts/AssistantContext";

export const useDeleteAssistant = () => {
  const queryClient = useQueryClient();
  const { assistants } = useAssistantContext();
  const { setAssistant } = useAssistantContext();

  return useMutation({
    mutationFn: ({ id }) => assistant.delete(id),
    onSuccess: (_, id) => {
      // Invalidate the "assistants" query to refetch updated data
      queryClient.invalidateQueries(["assistants"]);
      toast.success("Assistant deleted successfully.");

      // Update context with the latest assistant
      queryClient
        .fetchQuery(["assistants"])
        .then((updatedAssistants) => {
          if (updatedAssistants.length > 0) {
            // Select latest assistant after refetch
            const latestAssistant = updatedAssistants.reduce((latest, current) => {
              return current.created_at > latest.created_at ? current : latest;
            });
            setAssistant(latestAssistant);
          } else {
            setAssistant(null);
          }
        })
        .catch((error) => {
          console.error("Error refetching assistants:", error);
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
