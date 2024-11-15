import React from "react";
import Title from "./content/Title";
import { Box, Divider, useMediaQuery } from "@mui/material";
import Settings from "./content/Settings";

const Content = () => {
  const isMobile = useMediaQuery("(max-width:815px)");

  return (
    <>
      <Box
        sx={{
          display: isMobile ? "flex" : "block",
          justifyContent: isMobile ? "center" : "flex-start",
        }}
      >
        <Title />
      </Box>
      <Divider />
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
        <Settings />
      </Box>
    </>
  );
};

export default Content;
