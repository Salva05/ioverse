import React, { useContext } from "react";
import MainBar from "../components/MainBar";
import { Box, Toolbar, useMediaQuery } from "@mui/material";
import MobileMainBar from "../mobile_components/MobileMainBar";
import Content from "../components/Content";
import { Container as MUIContainer } from "@mui/material";
import { DrawerContext } from "../../../contexts/DrawerContext";

const drawerWidth = 240;

const Container = () => {
  const { open } = useContext(DrawerContext);
  const isMobile = useMediaQuery(
    `(max-width:${open ? 815 + drawerWidth : 815}px)`
  );

  return (
    <>
      <Box sx={{ mb: "10px" }}>
        {isMobile ? <MobileMainBar /> : <MainBar />}
      </Box>
      <Toolbar />
      <MUIContainer style={{ height: "100%" }}>
        <Content />
      </MUIContainer>
    </>
  );
};

export default Container;
