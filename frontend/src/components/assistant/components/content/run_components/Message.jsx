import { Avatar, Box, Typography } from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import { DrawerContext } from "../../../../../contexts/DrawerContext";
import aiIcon from "../../../../../assets/ai.png";
import { useAssistantContext } from "../../../../../contexts/AssistantContext";
import { AuthContext } from "../../../../../contexts/AuthContext";
import ImageRenderer from "./ImageRenderer";
import FileRenderer from "./FileRenderer";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "prismjs/themes/prism-tomorrow.css";
import rehypeRaw from "rehype-raw";
import { fileContent } from "../../../../../api/assistant";

const Message = ({
  who,
  id,
  content,
  attachments,
  hasFinished,
  streamMessageId,
  streamedChunks,
  assistant_id,
}) => {
  const { isSmallScreen } = useContext(DrawerContext);
  const { assistant, assistants } = useAssistantContext();
  const { user } = useContext(AuthContext);

  const { files } = useAssistantContext();

  const isUser = who !== "assistant";

  const [annotationUrls, setAnnotationUrls] = useState({});

  // Fetch URLs for annotations of type "file_path"
  const fetchAnnotationUrls = async (annotations) => {
    const urlMapping = {};
    for (const annotation of annotations) {
      if (annotation.type === "file_path" && annotation.file_path?.file_id) {
        try {
          const response = await fileContent.getContent(
            annotation.file_path.file_id
          );
          urlMapping[annotation.file_path.file_id] = {
            url: response?.file_content_url || "#",
            filename: response?.filename || "download",
          };
        } catch (error) {
          console.error(
            `Failed to fetch file content for file_id ${annotation.file_path.file_id}`,
            error
          );
          urlMapping[annotation.file_path.file_id] = {
            url: "#",
            filename: "unavailable",
          };
        }
      }
    }
    setAnnotationUrls((prev) => ({ ...prev, ...urlMapping }));
  };

  // Helper function to convert text with annotations to links
  const convertToLink = (text, annotations) => {
    if (!annotations) return text;

    // Process only annotations with type "file_path"
    const fileAnnotations = annotations.filter(
      (annotation) => annotation.type === "file_path"
    );

    return text.replace(
      /\[([^\]]+)\]\(sandbox:[^\)]+\)/g,
      (match, linkText) => {
        // Find the corresponding annotation based on the text content
        const annotation = fileAnnotations.find((a) => match.includes(a.text));
        if (annotation && annotation.file_path?.file_id) {
          const fileData = annotationUrls[annotation.file_path.file_id];
          if (fileData) {
            const { url, filename } = fileData;
            return `<a href="${url}" download="${filename}">${linkText}</a>`;
          }
        }
        return linkText; // Return plain text if no matching URL is found
      }
    );
  };

  useEffect(() => {
    if (Array.isArray(content)) {
      const annotations = content
        .filter((part) => part.type === "text" && part.text?.annotations)
        .flatMap((part) => part.text.annotations);

      if (annotations.length > 0) {
        fetchAnnotationUrls(annotations);
      }
    }
  }, [content]);

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
    // Tags to be allowed for the render
    const customSanitize = {
      tagNames: ["a", "p", "strong", "em", "code", "ul", "ol", "li"],
      attributeNames: ["href", "download", "src"],
    };

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
          const initialText = part.text.value;
          const processedText = convertToLink(
            initialText,
            part.text?.annotations
          );

          return (
            <ReactMarkdown
              key={index}
              children={processedText}
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[
                rehypeSanitize(customSanitize),
                rehypeHighlight,
                rehypeRaw,
              ]}
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
                a: ({ node, ...props }) => (
                  <Typography
                    component="a"
                    sx={{
                      color: "primary.main",
                      textDecoration: "none",
                      fontWeight: "medium",
                      fontFamily: "'Montserrat', serif",
                      "&:hover": {
                        color: "secondary.main",
                        textDecoration: "none",
                      },
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
          {isUser
            ? user.username
            : assistants.find((a) => a.id === assistant_id)?.name ||
              "Unnamed Assistant"}
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
