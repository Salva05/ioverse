export const mapMessages = (backendMessages) => {
  return backendMessages.map((msg) => ({
    message: msg.message_body,
    sentTime: new Date(msg.timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    sender: msg.sender === "user" ? "You" : "Chatbot",
    direction: msg.sender === "user" ? "outgoing" : "incoming",
  }));
};
