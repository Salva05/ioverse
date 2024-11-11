import { Box, CssBaseline, Toolbar } from "@mui/material";
import React from "react";
import Container from "../components/assistant/layout/Container";

const Assistant = () => {
  return (
    <>
      <CssBaseline />
      <Toolbar />
      <Box sx={{ display: "flex", flexDirection: "column", flexGrow: 1, minHeight: 0 }}>
        <Container />
      </Box>
    </>
  );
};

export default Assistant;
