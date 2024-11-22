import TokenManager from "../services/tokenManager";

export const connectToSSE = (url, onMessage, onError, onComplete) => {
  // Retrieve the access token
  const accessToken = TokenManager.getAccessToken();
  if (!accessToken) {
    console.error("Access token is missing. Unable to establish SSE connection.");
    return;
  }

  // Append the token as a query parameter
  const sseUrl = `${url}?token=${encodeURIComponent(accessToken)}`;

  const eventSource = new EventSource(sseUrl);

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (onMessage) onMessage(data);
      if (data.status === "completed") {
        eventSource.close();
        if (onComplete) onComplete(data);
      }
    } catch (err) {
      console.error("Error parsing SSE message:", err);
    }
  };

  eventSource.onerror = (error) => {
    console.error("SSE error:", error);
    if (onError) onError(error);
    eventSource.close();
  };

  return eventSource;
};
