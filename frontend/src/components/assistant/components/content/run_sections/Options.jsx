import { Box } from "@mui/material";
import React from "react";
import Clear from "../run_components/Clear";
import ThreadText from "../run_components/ThreadText";

const Options = ({ isPending }) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "90%",
      }}
    >
      <ThreadText isPending={isPending}/>
      <Clear />
    </Box>
  );
};

export default Options;
