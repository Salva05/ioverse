import React from "react";
import { Box, useMediaQuery } from "@mui/material";
import Name from "./settings_components/Name";
import SystemInstructions from "./settings_components/SystemInstructions";

const Settings = () => {
  const isMobile = useMediaQuery("(max-width:815px)");
  return (
    <>
      <Box sx={{ mb: 5 }}>
        <Name />
      </Box>
      <SystemInstructions />
    </>
  );
};

export default Settings;
