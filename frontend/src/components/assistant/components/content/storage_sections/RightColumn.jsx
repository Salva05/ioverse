import React from "react";
import { Box } from "@mui/material";
import Files from "../storage_components/Files";
import VectorStores from "../storage_components/VectorStores";

const RightColumn = ({
  selected,
  file,
  setFile,
  lockedFile,
  setLockedFile,
}) => {
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
      {selected === "Files" ? (
        <Files
          file={file}
          setFile={setFile}
          lockedFile={lockedFile}
          setLockedFile={setLockedFile}
        />
      ) : (
        <VectorStores />
      )}
    </Box>
  );
};

export default RightColumn;
