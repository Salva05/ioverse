import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import { useContext, useEffect, useState } from "react";
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator,
} from "@chatscope/chat-ui-kit-react";
import { ConversationContext } from "../contexts/ConversationContext";
import { mapMessages } from "../utils/mapMessages";
import chatService from "../services/chatService";

const Chat = () => {
  const { activeConversation, activateConversation } =
    useContext(ConversationContext);
  const [typing, setTyping] = useState(false);
  const [localMessages, setLocalMessages] = useState([]);

  useEffect(() => {
    if (activeConversation && activeConversation.messages) {
      updateLocalState();
    } else {
      setLocalMessages([]);
    }
  }, [activeConversation]);

  const updateLocalState = () => {
    const mappedMessages = mapMessages(activeConversation.messages);
    setLocalMessages(mappedMessages);
  };

  const addLocalMessage = (message, isAi) => {
    setLocalMessages((prevMessages) => [
      ...prevMessages,
      {
        message: message,
        sentTime: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        sender: isAi ? "Chatbot" : "You",
        direction: isAi ? "incoming" : "outgoing",
      },
    ]);
  };

  const handleSend = async (messageText) => {
    // Manually upadate the local state
    // To get immediate visual feedback wihout waiting backend response
    // This will also prevent re-render of all messages
    addLocalMessage(messageText, false);

    // Show typing indicator
    setTyping(true);

    const backend_message = {
      conversation_id: activeConversation ? activeConversation.id : null,
      message_body: messageText,
    };

    // Process the message and get AI response
    const ai_message = await processMessageToBackend(backend_message);

    addLocalMessage(ai_message.message_body, true);

    // Hide typing indicator
    setTyping(false);
  };

  async function processMessageToBackend(message) {
    try {
      const response = await chatService.sendMessage(message);
      return response.ai_message;
    } catch (error) {
      console.error("Error sending message:", error);
    }
  }

  return (
    <div
      style={{
        position: "relative",
        height: "100%",
        width: "100%",
        display: "flex",
      }}
    >
      <MainContainer style={{ flex: 1 }}>
        <ChatContainer>
          <MessageList
            typingIndicator={
              typing ? <TypingIndicator content="Reasoning" /> : null
            }
          >
            {localMessages.map((message, id) => (
              <Message
                key={id}
                model={message}
                style={{ paddingTop: 10, paddingBottom: 10 }}
              />
            ))}
          </MessageList>
          <MessageInput placeholder="Type message here" onSend={handleSend} />
        </ChatContainer>
      </MainContainer>
    </div>
  );
};

export default Chat;
