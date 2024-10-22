import React, { useEffect, useState, useRef } from "react";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import { List, ListItem, ListItemText, Container, Alert, useTheme, useMediaQuery } from "@mui/material";
import chatService from "../services/chatService";
import { useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import he from "he";

const drawerWidth = 240;

const StyledAppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  backgroundColor: "#1e1e1e",
  transition: theme.transitions.create(["margin", "width"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
  }),
}));

const MessageItem = ({ sender, message }) => {
  const isUser = sender.toLowerCase() === "you" || sender.toLowerCase() === "user";
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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
          borderRadius: isUser ? "15px 0 15px 15px" : "0 15px 15px 15px",
          maxWidth: "560px",
          width: "auto",
          wordBreak: "break-word",
          overflowWrap: "break-word",
        }}
      >
        <ListItemText
          sx={{
            "& code": {
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            },
          }}
        >
          <ReactMarkdown
            rehypePlugins={[rehypeSanitize]}
            remarkPlugins={[remarkGfm]}
          >
            {he.decode(message)}
          </ReactMarkdown>
        </ListItemText>
      </Paper>
    </ListItem>
  );
};

export default function SharedConversation() {
  const [conversationTitle, setConversationTitle] = useState("");
  const [conversation, setConversation] = useState([]);
  const [error, setError] = useState(null);
  const { share_token } = useParams();
  const messagesEndRef = useRef(null);
  const theme = useTheme();

  useEffect(() => {
    const fetchConversation = async () => {
      try {
        const response = await chatService.getSharedConversation(share_token);
        setConversation(response.messages);
        setConversationTitle(response.title || "Untitled");
        scrollToBottom();
      } catch (error) {
        setError("Conversation not found.");
        console.error("An error occurred while fetching the conversation:", error);
      }
    };

    fetchConversation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [share_token]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Auto-scroll when conversation updates
  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  return (
    <>
      <StyledAppBar position="fixed" open={false}>
        <Toolbar sx={{ display: "flex", justifyContent: "center" }}>
          <Typography variant="h6" noWrap component="div">
            IOverse
          </Typography>
        </Toolbar>
      </StyledAppBar>

      {/* Outer Container with Full Page Scroll */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          height: "100vh",
          paddingTop: "64px", // Height of AppBar
          backgroundColor: theme.palette.background.default,
          overflowY: "auto", // Enable scrolling on the entire page
        }}
      >
        <Container
          maxWidth="md"
          sx={{
            width: "100%",
            padding: { xs: "8px", sm: "16px" },
            display: "flex",
            flexDirection: "column",
          }}
        >
          {error ? (
            <Box sx={{ textAlign: "center", marginTop: "20px" }}>
              <Alert
                severity="warning"
                variant="filled"
                sx={{ marginBottom: "20px" }}
              >
                {error}
              </Alert>
              <Typography variant="h6" color="textSecondary">
                It looks like the conversation you're trying to access is either
                expired or does not exist.
              </Typography>
            </Box>
          ) : conversation.length > 0 ? (
            <List
              sx={{
                width: "100%",
                paddingX: { sm: "16px" },
                display: "flex",
                flexDirection: "column",
              }}
            >
              {conversation.map((msg, index) => (
                <MessageItem
                  key={index}
                  sender={msg.sender}
                  message={msg.message_body}
                />
              ))}
              <div ref={messagesEndRef} />
            </List>
          ) : (
            <Typography
              variant="body1"
              color="textSecondary"
              sx={{ textAlign: "center", mt: 2 }}
            >
              No messages in this conversation.
            </Typography>
          )}
        </Container>
      </Box>
    </>
  );
}
