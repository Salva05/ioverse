import React, { useEffect, useState } from "react";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import { List, ListItem, ListItemText, Container, Alert } from "@mui/material";
import chatService from "../services/chatService";
import { useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import he from "he";

const StyledAppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  backgroundColor: "#1e1e1e",
  transition: theme.transitions.create(["margin", "width"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - 240px)`,
    marginLeft: "240px",
  }),
}));

const MessageItem = ({ sender, message }) => {
  const isUser = sender === "user";
  return (
    <ListItem
      sx={{
        justifyContent: isUser ? "flex-end" : "flex-start",
        display: "flex",
        paddingX: { xs: "0px", sm: "10px" },
        width: { sx: "100%", sm: "auto" },
      }}
    >
      <Paper
        elevation={3}
        sx={{
          marginY: "10px",
          padding: "10px 15px",
          backgroundColor: isUser ? "#1976d2" : "#f5f5f5",
          color: isUser ? "white" : "black",
          borderRadius: isUser ? "15px 0 15px 15px" : "0 15px 15px 15px",
          maxWidth: { xs: "100%", sm: "70%" }, // Full width on xs
          width: { xs: "100%", sm: "fit-content" },
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

export default function SharedConversation() {
  const [conversation, setConversation] = useState([]);
  const [error, setError] = useState(null);
  const { share_token } = useParams();

  useEffect(() => {
    const fetchConversation = async () => {
      try {
        const response = await chatService.getSharedConversation(share_token);
        setConversation(response.messages);
      } catch (error) {
        // Generic error message for not found or expired cases
        setError("Conversation not found.");
        console.log(
          "An error occurred while fetching the conversation:",
          error
        );
      }
    };

    fetchConversation();
  }, [share_token]);

  return (
    <>
      <StyledAppBar position="fixed">
        <Toolbar sx={{ display: "flex", justifyContent: "center" }}>
          <Typography variant="h6" noWrap component="div">
            Dark Menu
          </Typography>
        </Toolbar>
      </StyledAppBar>

      <Container maxWidth="md" sx={{ marginTop: "50px", padding: "16px" }}>
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
        ) : (
          <List
            sx={{
              width: "100%",
              paddingX: { sm: "16px" },
            }}
          >
            {conversation.length > 0 ? (
              conversation.map((msg, index) => (
                <MessageItem
                  key={index}
                  sender={msg.sender}
                  message={msg.message_body}
                />
              ))
            ) : (
              <Typography
                variant="body1"
                color="textSecondary"
                sx={{ textAlign: "center", mt: 2 }}
              >
                No messages in this conversation.
              </Typography>
            )}
          </List>
        )}
      </Container>
    </>
  );
}
