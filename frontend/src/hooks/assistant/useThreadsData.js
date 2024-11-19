import { useQuery, useQueryClient } from "@tanstack/react-query";
import { thread } from "../../api/assistant";
import { toast } from "react-toastify";

const fetchThreads = async () => {
    try {
      const data = await thread.getThreads();
      return data || [];
    } catch (error) {
      console.error("Error fetching threads:", error);
      throw error;
    }
  };

export const useThreadsData = () => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["threads"],
    queryFn: fetchThreads,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to load threads data. Please try again later.";
      toast.error(`Error: ${errorMessage}`, {});
      console.error("Error fetching threads data:", error);
    },
  });
};
