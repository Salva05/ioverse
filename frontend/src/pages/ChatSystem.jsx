import React, { useState, useRef, useEffect, useContext, useMemo } from "react";
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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import chat from "../api/chat";
import ChatDial from "../components/chat/ChatDial";
import TypingEffect from "../components/chat/TypingEffect";
import MessageItem from "../components/chat/MessageItem";
import { toast } from "react-toastify";

const drawerWidth = 240;

export default function ChatSystem() {
  const { activeConversationId, activateConversation } =
    useContext(ConversationContext);
  const [tempMessage, setTempMessage] = useState(null);
  const [typing, setTyping] = useState(false);
  const queryClient = useQueryClient();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { open: drawerOpen } = useContext(DrawerContext);

  // Ensure that onload, any previous temp message is removed
  // Has to be done here to prevent flickering effect
  useEffect(() => {
    setTempMessage(null);
  }, [activeConversationId]);

  // Fetch conversation from existing query
  const conversation = useMemo(() => {
    return queryClient
      .getQueryData(["conversations"])
      ?.results.find((conv) => conv.id === activeConversationId);
  }, [activeConversationId, queryClient.getQueryData(["conversations"])]);

  const sendMessageMutation = useMutation({
    mutationKey: ["sendMessage"],
    mutationFn: async ({ message_body, conversation_id }) => {
      return await chat.sendMessage({ message_body, conversation_id });
    },
    onMutate: async ({ message_body }) => {
      // Cancel outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries(["conversations"]);

      const previousConversations = queryClient.getQueryData(["conversations"]);

      const optimisticMessage = {
        id: Date.now(),
        conversation_id: activeConversationId,
        message_body,
        sender: "user",
        timestamp: new Date().toISOString(),
      };

      // If new conversation mock a conversation
      if (!conversation) {
        setTempMessage(optimisticMessage.message_body);
      }

      queryClient.setQueryData(["conversations"], (oldData) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          results: oldData.results.map((conv) =>
            conv.id === activeConversationId
              ? { ...conv, messages: [...conv.messages, optimisticMessage] }
              : conv
          ),
        };
      });

      // Set typing indicator
      setTyping(true);

      return { previousConversations, optimisticMessage };
    },
    onSuccess: async (data, variables, context) => {
      const { optimisticMessage } = context;

      if (!conversation) {
        await queryClient.invalidateQueries(["conversations"]);
        activateConversation(data.user_message.conversation_id);
      } else {
        queryClient.setQueryData(["conversations"], (oldData) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            results: oldData.results.map((conv) =>
              conv.id === activeConversationId
                ? {
                    ...conv,
                    messages: [
                      ...conv.messages.filter(
                        (msg) => msg.id !== optimisticMessage.id
                      ),
                      data.user_message,
                      data.ai_message,
                    ],
                  }
                : conv
            ),
          };
        });
      }

      setTyping(false);
    },
    onError: (error, variables, context) => {
      if (context?.previousConversations) {
        queryClient.setQueryData(
          ["conversations"],
          context.previousConversations
        );
      }

      const errorMessage =
        error.response?.data?.detail ||
        "An error occurred while sending the message.";
      toast.error("Error: " + errorMessage);
    },
    onSettled: () => {
      setTyping(false);
    },
  });

  // Function to handle sending a message
  const handleSend = async (message) => {
    if (!message.trim()) return;

    sendMessageMutation.mutate({
      message_body: message,
      conversation_id: activeConversationId,
    });

    setInput("");
    scrollToBottom();

    if (!activeConversationId) queryClient.invalidateQueries(["conversations"]);
  };

  // Function to scroll to the bottom of the messages
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Function to listen for 'enter' key and send message
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Prevent the new line
      handleSend(input);
    }
  };

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  return (
    <>
      <ChatDial />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
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
            paddingBottom: "80px",
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
              {conversation?.messages && conversation.messages.length > 0 ? (
                conversation.messages.map((msg) => (
                  <MessageItem
                    key={msg.id}
                    sender={msg.sender}
                    message={msg.message_body}
                  />
                ))
              ) : tempMessage ? (
                <MessageItem
                  key={Date.now()}
                  sender={"user"}
                  message={tempMessage}
                />
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
            backgroundColor: theme.palette.background.default,
            position: "fixed",
            bottom: 0,
            width: `calc(100% - ${
              drawerOpen && !isMobile ? drawerWidth : 0
            }px)`,
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
            onKeyDown={handleKeyPress}
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
