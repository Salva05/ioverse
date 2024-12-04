import { IconButton, Tooltip } from "@mui/material";
import React from "react";
import { AiOutlineClear } from "react-icons/ai";
import { styled } from "@mui/material/styles";

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
  return (
    <>
      <Tooltip title="Clear" placement="top">
        <StyledIconButton>
          <AiOutlineClear style={{ color: "inherit" }} />
        </StyledIconButton>
      </Tooltip>
    </>
  );
};

export default Clear;
