import { Box, CircularProgress } from "@mui/material";
import React, { useContext, useEffect, useRef, useState } from "react";
import Message from "../run_components/Message";
import { DrawerContext } from "../../../../../contexts/DrawerContext";
import { useIsFetching, useQueryClient } from "@tanstack/react-query";
import { useAssistantContext } from "../../../../../contexts/AssistantContext";
import { useWebSocket } from "../../../../../contexts/WebSocketContext";
import throttle from "lodash.throttle";

const Body = ({ messages }) => {
  const { isSmallScreen } = useContext(DrawerContext);
  const { thread } = useAssistantContext();
  const queryClient = useQueryClient();

  const cachedMessages = queryClient.getQueryData(["messages", thread?.id]);
  const isFetching = useIsFetching(["messages", thread?.id]);

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
      if (message.message) {
        setStreamedChunks((prevMessages) => prevMessages + message.message);
      }
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

  // Listen to changes in the message being streamed and reset the text
  useEffect(() => {
    setStreamedChunks("");
  }, [streamMessageId]);

  // Listen for hasFinished, empty the streamed messages then.
  // This operation is safe since the message will be substituted with the updated
  // cached query data at the stream completion
  useEffect(() => {
    if (hasFinished) setStreamedChunks("");
  }, [hasFinished]);

  // For scroll
  const [isAtBottom, setIsAtBottom] = useState(true);
  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    if (isAtBottom) {
      scrollToBottom();
    }
  }, [streamedChunks, messages, isAtBottom]);

  useEffect(() => {
    const handleScroll = throttle(() => {
      const { scrollTop, scrollHeight, clientHeight } =
        document.documentElement;
      const atBottom = scrollTop + clientHeight >= scrollHeight - 80;

      setIsAtBottom(atBottom);
    }, 200); // Throttle delay of 200ms

    window.addEventListener("scroll", handleScroll);

    // Initial check in case content is shorter than the viewport
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <Box
      sx={{
        mt: 5,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        gap: 4,
        width: isSmallScreen ? "90%" : "80%",
        pb: 20,
        flex: 1,
      }}
    >
      {isFetching && !cachedMessages ? (
        <Box
          sx={{
            display: "flex",
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
          }}
        >
          <CircularProgress size={50} />
        </Box>
      ) : (
        (messages || []).map((message) => (
          <Message
            key={message.id}
            id={message.id} // key prop is reserved prop thus not accessible
            who={message.role}
            content={message.content}
            attachments={message?.attachments || []}
            hasFinished={hasFinished}
            streamMessageId={streamMessageId}
            streamedChunks={streamedChunks}
            assistant_id={message?.assistant_id}
          />
        ))
      )}
    </Box>
  );
};

export default Body;
