import React from "react";
import MainBar from "../components/MainBar";
import { Box, useMediaQuery } from "@mui/material";
import MobileMainBar from "../mobile_components/MobileMainBar";
import Content from "../components/Content";
import { Container as MUIContainer } from "@mui/material";

const Container = () => {
  const isMobile = useMediaQuery("(max-width:815px)");
  return (
    <>
      <Box sx={{ mb: "10px" }}>
        {isMobile ? <MobileMainBar /> : <MainBar />}
      </Box>
      <MUIContainer>
        <Content />
      </MUIContainer>
    </>
  );
};

export default Container;
