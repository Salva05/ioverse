import React, { useContext } from "react";
import { useMediaQuery } from "@mui/material";
import { Box, Typography, Divider } from "@mui/material";
import { DrawerContext } from "../../../../../contexts/DrawerContext";
import FileSearchTool from "../settings_components/FileSearchTool";

const drawerWidth = 240;

const ToolsSection = () => {
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
            Tools
          </Typography>
        )}
      </Box>

      {!isTablet && <Divider orientation="vertical" flexItem />}

      {/* Content Wrapper */}
      <Box
        sx={{
          flexGrow: 1,
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
              Tools
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
          <Box>
            <FileSearchTool />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ToolsSection;
