import { IconButton, Tooltip } from "@mui/material";
import React from "react";
import { AiOutlineClear } from "react-icons/ai";
import { styled } from "@mui/material/styles";
import { useAssistantContext } from "../../../../../contexts/AssistantContext";
import { useDeleteThread } from "../../../../../hooks/assistant/useDeleteThread";

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  backgroundColor:
    theme.palette.mode === "light"
      ? theme.palette.grey[400]
      : theme.palette.grey[700],
  borderRadius: "6px",
  padding: 5,
  fontSize: 20,
  color: "inherit",
}));

const Clear = () => {
  const { thread, setThread } = useAssistantContext();
  const { mutate } = useDeleteThread();

  const handleDelete = () => {
    mutate(thread.id);
    setThread(null);
  };

  return (
    <>
      <Tooltip title="Clear" placement="top">
        <StyledIconButton onClick={handleDelete}>
          <AiOutlineClear style={{ color: "inherit" }} />
        </StyledIconButton>
      </Tooltip>
    </>
  );
};

export default Clear;
