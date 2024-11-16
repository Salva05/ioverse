import React from "react";
import { Box } from "@mui/material";
import MainSection from "./settings_sections/MainSection";
import ToolsSection from "./settings_sections/ToolsSection";

const drawerWidth = 240;

const Settings = () => {

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 5,
        pb: 5,
        width: "100%",
      }}
    >
      {/* First Section: Main */}
      <MainSection />

      {/* Second Section: Tools */}
      <ToolsSection />
    </Box>
  );
};

export default Settings;
