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

  const handleSend = async (messageText) => {
    // Manually upadate the local state
    // To trigger an immediate visual feedback wihout waiting backend response
    setLocalMessages((prevMessages) => [
      ...prevMessages,
      {
        message: messageText,
        sentTime: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        sender: "You",
        direction: "outgoing",
      },
    ]);

    // Show typing indicator
    setTyping(true);

    const backend_message = {
      conversation_id: activeConversation ? activeConversation.id : null,
      message_body: messageText,
    };

    // Process the message and get AI response
    const ai_message = await processMessageToBackend(backend_message);

    // Update context's conversation
    activateConversation(activeConversation.id);

    // update local messages based on the active updated context
    updateLocalState();

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
              <Message key={id} model={message} />
            ))}
          </MessageList>
          <MessageInput placeholder="Type message here" onSend={handleSend} />
        </ChatContainer>
      </MainContainer>
    </div>
  );
};

export default Chat;
