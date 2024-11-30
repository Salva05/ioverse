import { extractOpenAIError } from "./extractOpenAIError";

export function getResponseFormatErrorMessage(error) {
  const errorData = error?.response?.data;
  if (!errorData) {
    return error?.message || "An unknown error occurred.";
  }

  // Case where errorData contains "response_format"
  if (errorData?.response_format) {
    return errorData.response_format.join(", ");
  }

  // Case where errorData is an object
  if (errorData?.error) {
    // OpenAI-style error message
    if (typeof errorData.error === "string") {
      return extractOpenAIError(errorData.error);
    }
  }
}