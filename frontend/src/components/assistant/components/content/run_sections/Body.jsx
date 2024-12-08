import { Box, CircularProgress } from "@mui/material";
import React, { useContext } from "react";
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
            who={message.role}
            content={message.content}
            attachments={message?.attachments || []}
          />
        ))
      )}
    </Box>
  );
};

export default Body;
