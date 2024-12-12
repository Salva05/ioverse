import { useQuery } from "@tanstack/react-query";
import { files } from "../../api/assistant";
import { toast } from "react-toastify";

export const useRetrieveFile = (fileId) => {
  return useQuery({
    queryKey: ["file", fileId],
    queryFn: () => files.retrieve(fileId),
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to retrieve File. Please try again later.";
      toast.error(`Error: ${errorMessage}`, {});
      console.error("Error fetching File:", error);
    },
    enabled: !!fileId, // Only run the query if fileId is provided
  });
};