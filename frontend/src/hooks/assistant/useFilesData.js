import { useQuery, useQueryClient } from "@tanstack/react-query";
import { files } from "../../api/assistant";
import { toast } from "react-toastify";

const fetchFiles = async () => {
    try {
      const data = await files.get();
      return data || [];
    } catch (error) {
      console.error("Error fetching files:", error);
      throw error;
    }
  };

export const useFilesData = () => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["files"],
    queryFn: fetchFiles,
    staleTime: 8 * 60 * 1000, // 8 minutes
    cacheTime: 13 * 60 * 1000, // 13 minutes
    refetchOnWindowFocus: false,
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to load files data. Please try again later.";
      toast.error(`Error: ${errorMessage}`, {});
      console.error("Error fetching files data:", error);
    }
  });
};
