import { Box, Button, Typography, useMediaQuery } from "@mui/material";
import React, { useContext } from "react";
import Switch from "../../../../Switch";
import { RiInformation2Line } from "react-icons/ri";
import { GoPlus } from "react-icons/go";
import { IoSettingsOutline } from "react-icons/io5";
import { DrawerContext } from "../../../../../contexts/DrawerContext";

const drawerWidth = 240;

const FileSearchTool = () => {
  const { open, isSmallScreen } = useContext(DrawerContext);
  const isMobile = useMediaQuery(
    isSmallScreen
      ? `(max-width:815px)`
      : `(max-width:${open ? 815 + drawerWidth : 815}px)`
  );

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        flexDirection: "row",
        gap: 1,
        ml: isMobile ? -1 : 0,
      }}
    >
      <Switch />
      <Typography
        variant="body1"
        sx={{
          fontFamily: "'Montserrat', serif",
        }}
      >
        File Search
      </Typography>
      <RiInformation2Line />
      <Box sx={{ marginLeft: "auto", display: "flex", alignItems: "center" }}>
      <Button
          color="inherit"
          sx={{
            textTransform: "none",
            borderRadius: 2.3,
            px: 1,
            py: 0.7,
            mr: 1,
            minWidth: 0,
            backgroundColor: (theme) => theme.palette.action.hover,
            "&:hover": {
              backgroundColor: (theme) => theme.palette.action.selected,
            },
          }}
        >
          <IoSettingsOutline size="1rem"  />
        </Button>

        <Button
          size="small"
          color="inherit"
          sx={{
            textTransform: "none",
            borderRadius: 2.3,
            minWidth: 0,
            pr: 1,
            py: 0.3,
            pl: 0.7,
            backgroundColor: (theme) => theme.palette.action.hover,
            "&:hover": {
              backgroundColor: (theme) => theme.palette.action.selected,
            },
          }}
        >
          <GoPlus size="1rem" style={{ marginRight: 3 }} />
          <Typography
            sx={{
              fontSize: "0.95rem",
              fontFamily: "'Montserrat', serif",
            }}
          >
            Files
          </Typography>
        </Button>
      </Box>
    </Box>
  );
};

export default FileSearchTool;
