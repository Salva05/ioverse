import React, { useContext } from "react";
import { useMediaQuery } from "@mui/material";
import { Box, Typography, Divider } from "@mui/material";
import { DrawerContext } from "../../../../../contexts/DrawerContext";
import FileSearch from "../settings_components/FileSearch";
import CodeInterpreter from "../settings_components/CodeInterpreter";
import Functions from "../settings_components/Functions";

const drawerWidth = 240;

const ToolsSection = () => {
  const { open, isSmallScreen } = useContext(DrawerContext);
  const isTablet = useMediaQuery(
    isSmallScreen
      ? `(max-width:815px)`
      : `(max-width:${open ? 815 + drawerWidth : 815}px)`
  );
  const isMobile = useMediaQuery(
    isSmallScreen
      ? `(max-width:500px)`
      : `(max-width:${open ? 500 + drawerWidth : 500}px)`
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
    minWidth: isMobile ? "300px" : isTablet ? "375px" : "450px",
    gap: 1,
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
            TOOLS
          </Typography>
        )}
      </Box>

      {!isTablet && <Divider orientation="vertical" flexItem sx={{ mr: 4 }}/>}

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
              TOOLS
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
            <FileSearch />
          </Box>
          <Box sx={{ mb: 2 }}>
            <CodeInterpreter />
          </Box>
          <Box sx={{ mb: 2 }}>
            <Functions />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ToolsSection;
