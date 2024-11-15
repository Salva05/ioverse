import React from "react";
import Title from "./content/Title";
import { Box, Divider, useMediaQuery } from "@mui/material";

const Content = () => {
  const isMobile = useMediaQuery("(max-width:815px)");

  return (
    <>
      <Box
        sx={{
          display: isMobile ? "flex" : "block",
          justifyContent: isMobile ? "center" : "flex-start",
          ml: isMobile ? 0 : 10,
          mt: 1,
        }}
      >
        <Title />
      </Box>
      <Divider />
    </>
  );
};

export default Content;
