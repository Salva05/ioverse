import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { files } from "../../api/assistant";

export const useDeleteFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => files.delete(id),
    onSuccess: (_, id) => {
      queryClient.setQueryData(["files"], (oldFiles) =>
        oldFiles ? oldFiles.filter((file) => file.id !== id) : []
      );
      toast.success("File deleted successfully.");

      // Update vector stores
      setTimeout(() => {
        queryClient.invalidateQueries(["vectorStores"])
      }, 2000);
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to delete the file. Please try again later.";

      // Check for specific error patterns
      if (error.response?.data?.error) {
        const errorDetail = error.response.data.error.toLowerCase();
        if (errorDetail.includes("error code: 404")) {
          toast.error("File not found. It might have been already deleted.");
          return;
        }
      }
      toast.error(errorMessage);
    },
  });
};
