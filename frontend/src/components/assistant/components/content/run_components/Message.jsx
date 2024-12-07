import { Avatar, Box, Typography, Paper } from "@mui/material";
import React, { useContext } from "react";
import { DrawerContext } from "../../../../../contexts/DrawerContext";
import aiIcon from "../../../../../assets/ai.png";
import { useAssistantContext } from "../../../../../contexts/AssistantContext";
import { AuthContext } from "../../../../../contexts/AuthContext";
import ImageRenderer from "./ImageRenderer";
import { fileImage } from "../../../../../api/assistant";

const Message = ({ who, content }) => {
  const { isSmallScreen } = useContext(DrawerContext);
  const { assistant } = useAssistantContext();
  const { user } = useContext(AuthContext);

  const isUser = who !== "assistant";

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

  // Function to render content based on its type
  const renderContent = (content) => {
    if (typeof content === "string") {
      // If content is a simple string, render it directly
      return (
        <Typography
          sx={{
            fontFamily: "Montserrat, serif",
            fontSize: isSmallScreen ? "0.9rem" : "1rem",
            textAlign: isUser ? "right" : "left",
          }}
        >
          {content}
        </Typography>
      );
    } else if (Array.isArray(content)) {
      // If content is an array, iterate and render each part
      return content.map((part, index) => {
        switch (part.type) {
          case "text":
            // Extract the 'value' from the 'text' object
            return (
              <Typography
                key={index}
                sx={{
                  fontFamily: "Montserrat, serif",
                  fontSize: isSmallScreen ? "0.9rem" : "1rem",
                  textAlign: isUser ? "right" : "left",
                }}
              >
                {part.text.value}
              </Typography>
            );
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
    } else {
      return null;
    }
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
        {renderContent(content)}
      </Box>
    </Box>
  );
};

export default Message;
