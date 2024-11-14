import { Box, CssBaseline, Toolbar } from "@mui/material";
import React from "react";
import Container from "../components/assistant/layout/Container";
import { AssistantProvider } from "../contexts/AssistantContext";
import { LayoutGroup } from "framer-motion";

const Assistant = () => {
  return (
    <>
      <AssistantProvider>
        <CssBaseline />
        <Toolbar />
        <LayoutGroup>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              flexGrow: 1,
              minHeight: 0,
            }}
          >
            <Container />
          </Box>
        </LayoutGroup>
      </AssistantProvider>
    </>
  );
};

export default Assistant;
