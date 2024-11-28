// Extracts the message content of OpenAI's JSON error response
export function extractOpenAIError(errorString) {
  const messageRegex = /['"]message['"]:\s*(['"])(.*?)\1/;
  const match = errorString.match(messageRegex);
  if (match) {
    let message = match[2];
    // If the message is about an unknown parameter, extract the parameter name
    if (message.startsWith("Unknown parameter:")) {
      const paramRegex = /Unknown parameter: '.*\.([^.']+)'\./;
      const paramMatch = message.match(paramRegex);
      if (paramMatch) {
        const paramName = paramMatch[1];
        return `Unknown parameter: ${paramName}`;
      }
    }
    return message;
  } else {
    return errorString;
  }
}
