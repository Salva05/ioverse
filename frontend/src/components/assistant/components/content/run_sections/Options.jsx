import { Box } from "@mui/material";
import React from "react";
import Clear from "../run_components/Clear";
import ThreadText from "../run_components/ThreadText";

const Options = ({ isThreadPending }) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "90%",
      }}
    >
      <ThreadText isThreadPending={isThreadPending}/>
      <Clear />
    </Box>
  );
};

export default Options;
