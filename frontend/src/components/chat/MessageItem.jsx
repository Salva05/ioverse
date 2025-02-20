import React from "react";
import { ListItem, ListItemText, Paper, useTheme } from "@mui/material";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import he from "he";

const MessageItem = ({ sender, message, isOptimistic }) => {
  const isUser = sender === "user";
  const theme = useTheme();

  const backgroundColorUser =
    theme.palette.mode === "dark"
      ? theme.palette.grey[800]
      : theme.palette.grey[200];

  const backgroundColorAi =
    theme.palette.mode === "dark"
      ? theme.palette.grey[800]
      : theme.palette.grey[200];

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
            ? theme.palette.mode === "dark"
              ? theme.palette.grey[300]
              : theme.palette.primary.main
            : theme.palette.mode === "dark"
            ? theme.palette.grey[800]
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
            fontFamily: "'Montserrat', serif",
            whiteSpace: "pre-wrap",
            "& *": {
              fontFamily: "'Montserrat', serif !important",
            },
            "& code": {
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            },
          }}
        >
          <ReactMarkdown
            rehypePlugins={[rehypeSanitize]}
            remarkPlugins={[remarkGfm]}
            breaks={true}
          >
            {he.decode(message)}
          </ReactMarkdown>
        </ListItemText>
      </Paper>
    </ListItem>
  );
};

export default MessageItem;
