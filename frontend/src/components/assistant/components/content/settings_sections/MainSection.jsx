import React, { useContext } from "react";
import { useMediaQuery } from "@mui/material";
import { Box, Typography, Divider } from "@mui/material";
import { DrawerContext } from "../../../../../contexts/DrawerContext";
import Name from "../settings_components/Name";
import SystemInstructions from "../settings_components/SystemInstructions";
import Model from "../settings_components/Model";

const drawerWidth = 240;

const MainSection = () => {
  const { open } = useContext(DrawerContext);
  const isMobile = useMediaQuery(
    `(max-width:${open ? 815 + drawerWidth : 815}px)`
  );

  // Styles for the section container
  const sectionContainerStyles = {
    display: "flex",
    flexDirection: isMobile ? "column" : "row",
    alignItems: "center",
    gap: 3,
    maxWidth: "700px",
  };

  // Styles for the label container
  const labelContainerStyles = {
    width: "150px",
    display: "flex",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  };

// Styles for the content container
const contentContainerStyles = {
  display: "flex",
  flexDirection: "column",
  gap: 1,
  mb: isMobile ? 0 : 1
};

  return (
    <Box sx={sectionContainerStyles}>
      {/* Label */}
      <Box
        sx={{
          ...labelContainerStyles,
          justifyContent: isMobile ? "flex-start" : "flex-end",
        }}
      >
        {!isMobile && (
          <Typography
            component="div"
            sx={{
              fontFamily: "'Montserrat', serif",
            }}
          >
            MAIN
          </Typography>
        )}
      </Box>

      {!isMobile && (
        <Divider orientation="vertical" flexItem />
      )}

      {/* Content Wrapper */}
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Box sx={contentContainerStyles}>
          {isMobile && (
            <Typography
              component="div"
              sx={{
                fontFamily: "'Montserrat', serif",
              }}
            >
              Main
            </Typography>
          )}
          {isMobile && (
            <Divider
              sx={{
                marginBottom: 2,
                width: "100%",
              }}
            />
          )}
          <Box sx={{ mb: 2 }}>
            <Name />
          </Box>
          <Box sx={{ mb: 2 }}>
            <SystemInstructions />
          </Box>
          <Box sx={{ mb: 2 }}>
            <Model />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default MainSection;
