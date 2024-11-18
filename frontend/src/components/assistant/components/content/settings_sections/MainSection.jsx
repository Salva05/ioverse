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
  const isTablet = useMediaQuery(
    `(max-width:${open ? 815 + drawerWidth : 815}px)`
  );
  const isMobile = useMediaQuery(
    `(max-width:${open ? 500 + drawerWidth : 500}px)`
  );

  // Styles for the section container
  const sectionContainerStyles = {
    display: "flex",
    flexDirection: isTablet ? "column" : "row",
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
    minWidth: isMobile ? "300px" : isTablet ? "375px" : "450px",
    mb: isTablet ? 0 : 1,
  };

  return (
    <Box sx={sectionContainerStyles}>
      {/* Label */}
      <Box
        sx={{
          ...labelContainerStyles,
          justifyContent: isTablet ? "flex-start" : "flex-end",
        }}
      >
        {!isTablet && (
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

      {!isTablet && <Divider orientation="vertical" flexItem  sx={{ mr: 5 }}/>}

      {/* Content Wrapper */}
      <Box
        sx={{
          display: "flex",
        }}
      >
        <Box sx={contentContainerStyles}>
          {isTablet && (
            <Typography
              component="div"
              sx={{
                fontFamily: "'Montserrat', serif",
              }}
            >
              MAIN
            </Typography>
          )}
          {isTablet && (
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
