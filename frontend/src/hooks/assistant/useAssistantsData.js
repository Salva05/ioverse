import { useQuery, useQueryClient } from "@tanstack/react-query";
import { assistant } from "../../api/assistant";
import { toast } from "react-toastify";

const fetchAssistants = async () => {
    try {
      const data = await assistant.get();
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
    staleTime: 9 * 60 * 1000, // 9 minutes
    cacheTime: 14 * 60 * 1000, // 14 minutes
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
