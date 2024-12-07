import { Box } from "@mui/material";
import React, { useEffect, useState } from "react";
import Options from "./run_sections/Options";
import Body from "./run_sections/Body";
import Input from "./run_sections/Input";
import { useAssistantContext } from "../../../../contexts/AssistantContext";
import { useMessagesData } from "../../../../hooks/assistant/useMessagesData";
import selectMostRecent from "../../../../utils/selectMostRecent";
import { useCreateThread } from "../../../../hooks/assistant/useCreateThread";
import { useCreateMessage } from "../../../../hooks/assistant/useCreateMessage";
const Run = () => {
  const { thread, threads, setThread } = useAssistantContext();
  const { mutateAsync: createThread, isPending: isThreadPending } =
    useCreateThread();
  const { mutate: createMessage } = useCreateMessage();

  const { data: rawMessages } = useMessagesData(thread?.id);
  const [sortedMessages, setSortedMessages] = useState([]);

  useEffect(() => {
    if (!threads || threads.length === 0) return;
    const recentThread = selectMostRecent(threads);
    setThread(recentThread);
  }, [threads]);

  // Update sorted messages whenever rawMessages changes
  useEffect(() => {
    if (rawMessages && rawMessages.length) {
      // Sort messages by creation time and store them in state
      const updatedSortedMessages = [...rawMessages].sort(
        (a, b) => a.created_at - b.created_at
      );
      setSortedMessages(updatedSortedMessages);
    } else {
      setSortedMessages([]);
    }
  }, [rawMessages]);

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
      <Options isThreadPending={isThreadPending} />
      {/* Main Body */}
      <Body
        messages={sortedMessages}/>
      {/* Input */}
      <Input createThread={createThread} createMessage={createMessage} />
    </Box>
  );
};

export default Run;
