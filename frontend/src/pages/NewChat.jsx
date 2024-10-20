import React, { useState, useRef, useEffect, useContext } from "react";
import {
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  TextField,
  IconButton,
  InputAdornment,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import he from "he";
import { DrawerContext } from "../contexts/DrawerContext";

const drawerWidth = 240;

const MessageItem = ({ sender, message }) => {
  const isUser = sender === "user";
  const theme = useTheme();

  return (
    <ListItem
      sx={{
        justifyContent: isUser ? "flex-end" : "flex-start",
        display: "flex",
        paddingX: { xs: "4px", sm: "8px", md: "12px" },
        width: "100%",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          marginY: "8px",
          padding: { xs: "8px 12px", sm: "10px 15px", md: "12px 18px" },
          backgroundColor: isUser
            ? theme.palette.primary.main
            : theme.palette.grey[300],
          color: isUser
            ? theme.palette.primary.contrastText
            : theme.palette.text.primary,
          borderRadius: isUser
            ? "15px 0 15px 15px"
            : "0 15px 15px 15px",
          maxWidth: "560px",
          width: "auto",
          wordBreak: "break-word",
        }}
      >
        <ListItemText>
          <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
            {he.decode(message).replace(/<br\s*\/?>/gi, "\n")}
          </ReactMarkdown>
        </ListItemText>
      </Paper>
    </ListItem>
  );
};

export default function ChatSystem() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { open: drawerOpen } = useContext(DrawerContext);

  // Function to handle sending a message
  const sendMessage = async () => {
    if (input.trim() === "") return;

    const userMessage = {
      sender: "user",
      message_body: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Scroll to the bottom after sending
    scrollToBottom();

    // Simulate AI response --> To be replaced
    const aiResponse = await getAIResponse(input.trim());
    if (aiResponse) {
      const aiMessage = {
        sender: "ai",
        message_body: aiResponse,
      };
      setMessages((prev) => [...prev, aiMessage]);

      // Scroll to the bottom after AI response
      scrollToBottom();
    }
  };

  // Function to simulate AI response --> To be replaced
  const getAIResponse = async (userInput) => {
    // Simulate a delay for AI response
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`You said: "${userInput}". This is a simulated AI response.`);
      }, 1000);
    });
  };

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
              message={msg.message_body}
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
      sendMessage();
    }}
    sx={{
      padding: isMobile ? "8px 12px" : "10px 16px",
      borderTop: `1px solid ${theme.palette.divider}`,
      backgroundColor: theme.palette.background.paper,
      position: "fixed",
      bottom: 0,
      width: `calc(100% - ${drawerOpen ? drawerWidth : 0}px)`,
      maxWidth: "800px",
      zIndex: 1000,
    }}
  >
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
              onClick={sendMessage}
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

  );
}
