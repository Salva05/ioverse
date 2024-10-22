import React, { useState, useRef, useEffect, useContext } from "react";
import {
  Box,
  List,
  TextField,
  IconButton,
  InputAdornment,
  Typography,
  useTheme,
  useMediaQuery,
  Toolbar,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { DrawerContext } from "../contexts/DrawerContext";
import { ConversationContext } from "../contexts/ConversationContext";
import { useQueryClient } from "@tanstack/react-query";
import { mapMessages } from "../utils/mapMessages";
import chat from "../api/chat";
import ChatDial from "../components/chat/ChatDial";
import TypingEffect from "../components/chat/TypingEffect";
import MessageItem from "../components/chat/MessageItem";

const drawerWidth = 240;

export default function ChatSystem() {
  const { activeConversation, activateConversation } =
    useContext(ConversationContext);
  const [typing, setTyping] = useState(false);
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { open: drawerOpen } = useContext(DrawerContext);

  useEffect(() => {
    if (activeConversation && activeConversation.messages) {
      updateLocalState();
    } else {
      setMessages([]);
    }
  }, [activeConversation]);

  const updateLocalState = () => {
    const mappedMessages = mapMessages(activeConversation.messages);
    setMessages(mappedMessages);
  };

  const addMessage = (message, isAi) => {
    const formattedMessage = message.replace(/\n/g, "  \n");

    setMessages((prevMessages) => [
      ...prevMessages,
      {
        message: formattedMessage,
        sentTime: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        sender: isAi ? "Chatbot" : "You",
        direction: isAi ? "incoming" : "outgoing",
      },
    ]);
  };

  // Function to handle sending a message
  const handleSend = async (messageText) => {
    if (!messageText.trim()) return; // Prevent sending empty messages

    addMessage(messageText, false);
    setInput("");

    // Typing indicator
    setTyping(true);
    scrollToBottom();

    const backend_message = {
      conversation_id: activeConversation ? activeConversation.id : null,
      message_body: messageText,
    };

    // Process the message and get AI response
    const ai_message = await processMessageToBackend(backend_message);

    // If it's the first message of a new conversation, trigger a refetch() in DrawerMenu
    if (!activeConversation) queryClient.invalidateQueries(["conversations"]);

    addMessage(ai_message.message_body, true);

    setTyping(false);
    scrollToBottom();
  };

  async function processMessageToBackend(message) {
    try {
      const response = await chat.sendMessage(message);
      return response.ai_message;
    } catch (error) {
      console.error("Error sending message:", error);
    }
  }

  // Function to scroll to the bottom of the messages
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <>
      <ChatDial />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          height: "100vh",
          overflowY: "auto",
        }}
      >
        <Toolbar />
        {/* Chat Container */}
        <Box
          sx={{
            width: "100%",
            maxWidth: "800px",
            display: "flex",
            flexDirection: "column",
            flexGrow: 1,
            paddingBottom: "70px",
          }}
        >
          {/* Scrollable Messages Area */}
          <Box
            sx={{
              flexGrow: 1,
              padding: isMobile ? "8px" : "16px",
              backgroundColor: theme.palette.background.default,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <List sx={{ flexGrow: 1 }}>
              {messages.length > 0 ? (
                messages.map((msg, index) => (
                  <MessageItem
                    key={index}
                    sender={msg.sender}
                    message={msg.message}
                  />
                ))
              ) : (
                <Typography
                  variant={isMobile ? "body2" : "body1"}
                  color="textSecondary"
                  sx={{ textAlign: "center", mt: 2 }}
                >
                  Start the conversation by typing a message below.
                </Typography>
              )}
              <div ref={messagesEndRef} />
            </List>
          </Box>
        </Box>

        {/* Input Bar Fixed at the Bottom */}
        <Box
          component="form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
          sx={{
            padding: isMobile ? "8px 12px" : "10px 16px",
            borderTop: `1px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.background.paper,
            position: "fixed",
            bottom: 0,
            width: `calc(100% - ${drawerOpen && !isMobile ? drawerWidth : 0}px)`,
            maxWidth: "800px",
            zIndex: 1000,
          }}
        >
          {typing && (
            <Box sx={{ position: "absolute", top: "-30px", left: "10px" }}>
              <TypingEffect />
            </Box>
          )}
          <TextField
            fullWidth
            multiline
            maxRows={4}
            variant="outlined"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    color="primary"
                    onClick={() => handleSend(input)}
                    disabled={input.trim() === ""}
                  >
                    <SendIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </Box>
    </>
  );
}
