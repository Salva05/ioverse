import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import { useState } from "react";
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator
} from "@chatscope/chat-ui-kit-react";

const Chat = () => {
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
      message: "How can I help you?",
      sentTime: "just now",
      sender: "Chatbot",
      direction: "incoming"
    },
  ]);

  const handleSend = async (message) => {
    const newMessage = {
      message: message,
      sentTime: "one minte ago",
      sender: "user",
      direction: "outgoing"
    }

    const newMessages = [...messages, newMessage]; // all the old messages + the new message

    // update out messages state
    setMessages(newMessages);

    // set typing indicator
    setTyping(true);

    // process message to backend
    await processMessageToBackend(newMessages);
  }

  async function processMessageToBackend(chatMessages) {

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
            typingIndicator={typing ? <TypingIndicator content="Reasoning"/> : null}>
            {messages.map((message, id) => (
              <Message key={id} model={message} />
            ))}
          </MessageList>
          <MessageInput placeholder="Type message here" onSend={handleSend}/>
        </ChatContainer>
      </MainContainer>
    </div>
  );
};

export default Chat;
