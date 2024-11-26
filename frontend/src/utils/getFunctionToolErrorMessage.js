import { extractOpenAIError } from "./extractOpenAIError";

// Get errors specific to OpenAI function tool's JSON error structure
export function getFunctionToolErrorMessage(error) {
  const generic = "Failed to save the function.";
  try {
    // Prioritize specific errors
    if (error.response?.data?.tools?.[0]) {
      return error.response.data.tools[0];
    }

    // Extract OpenAI-style error message
    if (error.response?.data?.error) {
      return extractOpenAIError(error.response.data.error);
    }

    // Default fallback
    return generic;
  } catch (e) {
    console.error("Error extracting message:", e);
    return generic;
  }
}
