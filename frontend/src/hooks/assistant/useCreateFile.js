import { useMutation, useQueryClient } from "@tanstack/react-query";
import { files } from "../../api/assistant";
import { toast } from "react-toastify";
import { truncateText } from "../../utils/textUtils";

export const useCreateFile = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (fileData) => files.create(fileData),
    onSuccess: (newFile) => {
      queryClient.setQueryData(["files"], (oldFiles) => {
        return oldFiles ? [...oldFiles, newFile] : [newFile];
      });

      toast.success(
        `File "${truncateText(newFile.filename, 14)}" uploaded successfully.`
      );
    },
    onError: (error) => {
      const errorData = error.response?.data;
      let errorMessage = "Failed to upload the file. Please try again later.";
      if (
        errorData?.file &&
        errorData.file[0].toLowerCase().includes("unsupported file extension")
      ) {
        errorMessage = "Unsupported file format.";
      } else if (
        errorData?.file &&
        errorData.file[0].toLowerCase().includes("the submitted file is empty.")
      ) {
        errorMessage = "The submitted file is empty.";
      }
      toast.error(errorMessage);
    },
  });

  return mutation;
};
