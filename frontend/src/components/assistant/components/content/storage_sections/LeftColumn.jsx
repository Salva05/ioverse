import { Box } from "@mui/material";
import React from "react";
import SelectionButtons from "../storage_components/SelectionButtons";
import FileDetails from "../storage_components/FileDetails";

const LeftColumn = ({ handleClick, selected, file, lockedFile }) => {
  const activeFile = lockedFile || file;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 3,
      }}
    >
      {/* Entity Selection Buttons */}
      <SelectionButtons handleClick={handleClick} selected={selected} />

      {/* Selected Entity Details */}
      {activeFile && <FileDetails file={activeFile} />}
    </Box>
  );
};

export default LeftColumn;
