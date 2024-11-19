import { useQuery, useQueryClient } from "@tanstack/react-query";
import { assistant } from "../../api/assistant";
import { toast } from "react-toastify";

const fetchAssistants = async () => {
    try {
      const data = await assistant.getAssistants();
      return data || [];
    } catch (error) {
      console.error("Error fetching assistants:", error);
      throw error;
    }
  };

export const useAssistantsData = () => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["assistants"],
    queryFn: fetchAssistants,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to load assistants data. Please try again later.";
      toast.error(`Error: ${errorMessage}`, {});
      console.error("Error fetching assistants data:", error);
    }
  });
};
