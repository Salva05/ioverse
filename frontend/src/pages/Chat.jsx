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
import { DrawerContext } from "../contexts/DrawerContext";
import ChatDial from "../components/ChatDial";
import { useQueryClient, useQuery } from '@tanstack/react-query';

const Chat = () => {
  const { activeConversation, activateConversation } =
    useContext(ConversationContext);
  const { open, isSmallScreen } = useContext(DrawerContext);
  const [typing, setTyping] = useState(false);
  const [localMessages, setLocalMessages] = useState([]);
  const queryClient = useQueryClient();


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
    // Manually update the local state
    addLocalMessage(messageText, false);

    // Show typing indicator
    setTyping(true);

    const backend_message = {
      conversation_id: activeConversation ? activeConversation.id : null,
      message_body: messageText,
    };

    // Process the message and get AI response
    const ai_message = await processMessageToBackend(backend_message);

    // If is the first message of a new conversation, trigger a refetch() in DrawerMenu
    // To update the menu real time
    if (!activeConversation) queryClient.invalidateQueries(['conversations']);

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
    <>
      <ChatDial />
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          flexGrow: 1,
        }}
      >
        <MainContainer style={{ flex: 1, maxWidth: "700px" }}>
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
    </>
  );
};

export default Chat;
