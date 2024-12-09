import { Avatar, Box, Typography } from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import { DrawerContext } from "../../../../../contexts/DrawerContext";
import aiIcon from "../../../../../assets/ai.png";
import { useAssistantContext } from "../../../../../contexts/AssistantContext";
import { AuthContext } from "../../../../../contexts/AuthContext";
import ImageRenderer from "./ImageRenderer";
import FileRenderer from "./FileRenderer";
import { useWebSocket } from "../../../../../contexts/WebSocketContext";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "prismjs/themes/prism-tomorrow.css";

const Message = ({ who, id, content, attachments }) => {
  const { isSmallScreen } = useContext(DrawerContext);
  const { assistant } = useAssistantContext();
  const { user } = useContext(AuthContext);

  const { files } = useAssistantContext();

  const isUser = who !== "assistant";

  // WebSocket Streaming callback registerer
  const {
    addMessageListener,
    removeMessageListener,
    hasFinished,
    streamMessageId,
  } = useWebSocket();

  // State to hold incoming messages
  const [streamedChunks, setStreamedChunks] = useState("");

  // Handler for incoming WebSocket messages
  const handleIncomingMessage = (message) => {
    if (message.type === "chunk") {
      setStreamedChunks((prevMessages) => prevMessages + message.message);
    }
  };

  useEffect(() => {
    // Register the message handler when the component mounts
    addMessageListener(handleIncomingMessage);

    // Cleanup
    return () => {
      removeMessageListener(handleIncomingMessage);
    };
  }, []);

  // Listen for hasFinished, empty the streamed messages then.
  // This operation is safe since the message will be substituted with the updated
  // cached query data at the stream completion
  useEffect(() => {
    if (hasFinished) setStreamedChunks("");
  }, [hasFinished]);

  const getAvatar = () => {
    if (isUser) {
      return (
        <Avatar
          sx={{
            width: 28,
            height: 28,
          }}
        ></Avatar>
      );
    } else {
      return (
        <Avatar
          src={aiIcon}
          sx={{
            width: 28,
            height: 28,
          }}
        ></Avatar>
      );
    }
  };

  // Function to render streams of text
  const renderStream = () => {
    return (
      <ReactMarkdown
        children={streamedChunks}
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize, rehypeHighlight]}
        components={{
          p: ({ node, ...props }) => (
            <Typography
              sx={{
                fontFamily: "Montserrat, serif",
                fontSize: isSmallScreen ? "0.9rem" : "1rem",
                textAlign: isUser ? "right" : "left",
              }}
              {...props}
            />
          ),
        }}
      />
    );
  };

  // Function to render content based on its type
  const renderContent = (content) => {
    if (typeof content === "string") {
      // If content is a simple string, render it directly
      return (
        <ReactMarkdown
          children={content}
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeSanitize, rehypeHighlight]}
          components={{
            p: ({ node, ...props }) => (
              <Typography
                sx={{
                  fontFamily: "Montserrat, serif",
                  fontSize: isSmallScreen ? "0.9rem" : "1rem",
                  textAlign: isUser ? "right" : "left",
                }}
                {...props}
              />
            ),
          }}
        />
      );
    } else if (Array.isArray(content)) {
      // If content is an array, iterate and render each part
      return content.map((part, index) => {
        if (part.type === "text") {
          return (
            <ReactMarkdown
              key={index}
              children={part.text.value}
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeSanitize, rehypeHighlight]}
              components={{
                p: ({ node, ...props }) => (
                  <Typography
                    sx={{
                      fontFamily: "Montserrat, serif",
                      fontSize: isSmallScreen ? "0.9rem" : "1rem",
                      textAlign: isUser ? "right" : "left",
                    }}
                    {...props}
                  />
                ),
              }}
            />
          );
        }
        return null;
      });
    } else {
      return null;
    }
  };

  // Function to render media content (images)
  const renderMediaContent = (content) => {
    if (Array.isArray(content)) {
      return content.map((part, index) => {
        switch (part.type) {
          case "image_file":
            return (
              <ImageRenderer
                key={index}
                type="image_file"
                id={part.image_file.file_id}
                isUser={isUser}
                isSmallScreen={isSmallScreen}
              />
            );
          case "image_url":
            return (
              <ImageRenderer
                key={index}
                type="image_url"
                url={part.image_url.url}
                isUser={isUser}
                isSmallScreen={isSmallScreen}
              />
            );
          default:
            return null;
        }
      });
    }
    return null;
  };

  // Function to render attachments
  const renderAttachments = () => {
    return attachments.map((attachment, index) => {
      const matchedFile = files.find((file) => file.id === attachment.file_id);
      const fileName = matchedFile?.filename || attachment.file_id;

      return (
        <FileRenderer
          key={index}
          fileId={attachment.file_id}
          fileName={fileName}
          isUser={isUser}
          isDeleted={!matchedFile}
          toolType={attachment.tools[0].type}
        />
      );
    });
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 1,
        alignItems: isUser ? "flex-end" : "flex-start",
        overflowWrap: "break-word",
        whiteSpace: "pre-wrap",
        width: "100%",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          flexDirection: isUser ? "row-reverse" : "row",
        }}
      >
        {getAvatar(who)}
        <Typography
          sx={{
            fontFamily: "Montserrat, serif",
            fontWeight: "bold",
            fontSize: isSmallScreen ? "1rem" : "1.1rem",
          }}
        >
          {isUser ? user.username : assistant?.name || "Unnamed Assistant"}
        </Typography>
      </Box>
      <Box
        elevation={1}
        sx={{
          padding: 1,
          alignSelf: isUser ? "flex-end" : "flex-start",
          borderLeft: isUser ? "none" : "2px solid",
          borderRight: isUser ? "2px solid" : "none",
          borderColor: isUser ? "primary.main" : "secondary.main",
        }}
      >
        {renderAttachments()}
        {/* Needed to align images vertically at the start */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: isUser ? "flex-end" : "flex-start",
          }}
        >
          {renderMediaContent(content)}
        </Box>
        {id === streamMessageId && !hasFinished
          ? renderStream()
          : renderContent(content)}
      </Box>
    </Box>
  );
};

export default Message;
