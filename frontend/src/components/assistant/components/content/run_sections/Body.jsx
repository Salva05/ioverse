import { Box, CircularProgress } from "@mui/material";
import React, { useContext, useEffect, useRef } from "react";
import Message from "../run_components/Message";
import { DrawerContext } from "../../../../../contexts/DrawerContext";
import { useIsFetching, useQueryClient } from "@tanstack/react-query";
import { useAssistantContext } from "../../../../../contexts/AssistantContext";

const Body = ({ messages }) => {
  const { isSmallScreen } = useContext(DrawerContext);
  const { thread } = useAssistantContext();
  const queryClient = useQueryClient();

  const cachedMessages = queryClient.getQueryData(["messages", thread?.id]);
  const isFetching = useIsFetching(["messages", thread?.id]);

  // For scroll
  const messageEndRef = useRef(null);
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <Box
      sx={{
        mt: 5,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 4,
        width: isSmallScreen ? "90%" : "80%",
        pb: 20,
        overflowY: "auto",
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
          />
        ))
      )}
      <div ref={messageEndRef} />
    </Box>
  );
};

export default Body;
