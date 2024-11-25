import { useQuery, useQueryClient } from "@tanstack/react-query";
import { vectorStoreFile } from "../../api/assistant";
import { toast } from "react-toastify";

const fetchVectorStoreFiles = async (vectorStoreId) => {
  try {
    const data = await vectorStoreFile.get(vectorStoreId);
    return data || [];
  } catch (error) {
    console.error("Error fetching Vector Store Files:", error);
    throw error;
  }
};

export const useVectorStoreFilesData = (vectorStoreId) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["vectorStoreFiles", vectorStoreId],
    queryFn: () => fetchVectorStoreFiles(vectorStoreId), 
    staleTime: 6 * 60 * 1000, // 6 minutes
    cacheTime: 11 * 60 * 1000, // 11 minutes
    refetchOnWindowFocus: false,
    enabled: !!vectorStoreId, // only run when vectorStoreId is defined
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to load Vector Store Files data. Please try again later.";
      toast.error(`Error: ${errorMessage}`, {});
      console.error("Error fetching Vector Stores Files:", error);
    },
  });
};
