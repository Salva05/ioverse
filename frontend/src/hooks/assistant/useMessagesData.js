import { useQuery, useQueryClient } from "@tanstack/react-query";
import { messages } from "../../api/assistant";
import { toast } from "react-toastify";

const fetchMessages = async (threadId) => {
  try {
    const data = await messages.get(threadId);
    return data || [];
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }
};

export const useMessagesData = (threadId) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["messages", threadId],
    queryFn: () => fetchMessages(threadId),
    staleTime: 8 * 60 * 1000, // 8 minutes
    cacheTime: 13 * 60 * 1000, // 13 minutes
    refetchOnWindowFocus: false,
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to load messages data. Please try again later.";
      toast.error(`Error: ${errorMessage}`, {});
      console.error("Error fetching messages data:", error);
    },
    enabled: !!threadId, // Only fetch if threadId is provided
  });
};
