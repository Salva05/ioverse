import React from "react";
import { Box } from "@mui/material";
import Files from "../storage_components/Files";

const RightColumn = ({ file, setFile, lockedFile, setLockedFile }) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        gap: 2,
        padding: 2,
        width: "100%",
      }}
    >
      <Files
        file={file}
        setFile={setFile}
        lockedFile={lockedFile}
        setLockedFile={setLockedFile}
      />
    </Box>
  );
};

export default RightColumn;
