// Extracts the message content of OpenAI's JSON error response
export function extractOpenAIError(errorString) {
  const messageRegex = /'message':\s*'([^']+)'/;
  const match = errorString.match(messageRegex);
  return match ? match[1] : errorString;
}
