import { Box } from "@mui/material";
import React from "react";
import Options from "./run_sections/Options";
import Body from "./run_sections/Body";
import Input from "./run_sections/Input";
import { useAssistantContext } from "../../../../contexts/AssistantContext";
import { useMessagesData } from "../../../../hooks/assistant/useMessagesData";

const Run = () => {
  const { thread } = useAssistantContext();
  const { data: rawMessages, isPending } = useMessagesData(thread?.id);

  // Default to an empty array if no messages and sort by creation time
  const sortedMessages = (rawMessages || []).sort(
    (a, b) => a.created_at - b.created_at
  );

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
      }}
    >
      {/* Thread Options */}
      <Options isPending={isPending} />
      {/* Main Body */}
      <Body messages={sortedMessages} />
      {/* Input */}
      <Input />
    </Box>
  );
};

export default Run;
