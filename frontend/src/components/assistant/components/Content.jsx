import React from "react";
import Title from "./content/Title";
import { Box, Divider, useMediaQuery } from "@mui/material";
import Settings from "./content/Settings";
import { useAssistantContext } from "../../../contexts/AssistantContext";
import Create from "./content/Create";
import Help from "./content/Help";
import Run from "./content/Run";
import Storage from "./content/Storage";

const Content = () => {
  const isMobile = useMediaQuery("(max-width:815px)");
  const { selectedTab } = useAssistantContext();

  const renderTabContent = () => {
    switch (selectedTab) {
      case "Settings":
        return <Settings />;
      case "Create":
        return <Create />;
      case "Run":
        return <Run />;
      case "Storage":
        return <Storage />;
      default:
        return <Help />;
    }
  };

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
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          mt: 5,
          height: "calc(100% - 100px)",
        }}
      >
        {renderTabContent()}
      </Box>
    </>
  );
};

export default Content;
