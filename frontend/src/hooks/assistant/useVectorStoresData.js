import { useQuery, useQueryClient } from "@tanstack/react-query";
import { vectorStore } from "../../api/assistant";
import { toast } from "react-toastify";

const fetchVectorStores = async () => {
  try {
    const data = await vectorStore.get();
    return data || [];
  } catch (error) {
    console.error("Error fetching vector stores:", error);
    throw error;
  }
};

export const useVectorStoresData = () => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["vectorStores"],
    queryFn: fetchVectorStores,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to load Vector Stores data. Please try again later.";
      toast.error(`Error: ${errorMessage}`, {});
      console.error("Error fetching Vector Stores data:", error);
    },
  });
};
