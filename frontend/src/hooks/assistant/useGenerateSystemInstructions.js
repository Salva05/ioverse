import { useMutation } from "@tanstack/react-query";
import { generate } from "../../api/assistant";
import { toast } from "react-toastify";

export const useGenerateSystemInstructions = (onSuccessCallback) => {
  const mutation = useMutation({
    mutationFn: (message) => generate.sys(message),
    onSuccess: (data) => {
      if (onSuccessCallback) {
        onSuccessCallback(data);
      }
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to generate system instructions. Please try again later.";
      toast.error(errorMessage);
    },
  });

  return mutation;
};
