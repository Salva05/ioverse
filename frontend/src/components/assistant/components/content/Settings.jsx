import React from "react";
import { useMediaQuery } from "@mui/material";
import Name from "./settings_components/Name";

const Settings = () => {
  const isMobile = useMediaQuery("(max-width:815px)");
  return (
    <Name/>
  );
};

export default Settings;
