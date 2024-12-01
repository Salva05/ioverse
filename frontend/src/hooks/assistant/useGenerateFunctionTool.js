import { useMutation } from "@tanstack/react-query";
import { generate } from "../../api/assistant";
import { toast } from "react-toastify";

export const useGenerateFunctionTool = (onSuccessCallback) => {
  const mutation = useMutation({
    mutationFn: (message) => generate.fn(message),
    onSuccess: (data) => {
      if (onSuccessCallback) {
        onSuccessCallback(data);
      }
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to generate function definition. Please try again later.";
      toast.error(errorMessage);
    },
  });

  return mutation;
};
