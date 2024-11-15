import React from "react";
import MainBar from "../components/MainBar";
import { useMediaQuery } from "@mui/material";
import MobileMainBar from "../mobile/MobileMainBar";

const Container = () => {
  const isMobile = useMediaQuery("(max-width:815px)");
  return (
    <>
      {isMobile ? <MobileMainBar /> : <MainBar />}
    </>
  );
};

export default Container;
