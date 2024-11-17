import {
  Box,
  Button,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, { useContext, useRef, useState, useEffect } from "react";
import Switch from "../../../../Switch";
import { RiInformation2Line } from "react-icons/ri";
import { GoPlus } from "react-icons/go";
import { IoSettingsOutline } from "react-icons/io5";
import { DrawerContext } from "../../../../../contexts/DrawerContext";
import FileSearchPopover from "./FileSearchPopover";
import FileSearchInfoPopover from "./FileSearchInfoPopover";
import FileSearchAddDialog from "./FileSearchAddDialog";

const drawerWidth = 240;

const FileSearchTool = () => {
  const theme = useTheme();
  const { open, isSmallScreen } = useContext(DrawerContext);
  const isMobile = useMediaQuery(
    isSmallScreen
      ? `(max-width:815px)`
      : `(max-width:${open ? 815 + drawerWidth : 815}px)`
  );

  // Info Popover State
  const infoPopoverAnchor = useRef(null);
  const [infoOpenedPopover, setOpenedInfoPopover] = useState(false);

  // Settings popover
  const [settingsAnchorEl, setSettingsAnchorEl] = useState(null);
  const settingsOpen = Boolean(settingsAnchorEl);

  // Add Files Dialog
  const [addFilesOpen, setAddFilesOpen] = useState(false);

  // Add Files states
  const addFilesDialogOpen = () => {
    setAddFilesOpen(true);
  };

  const addFilesDialogClose = () => {
    setAddFilesOpen(false);
  };

  // Settings popover states
  const settingsPopoverClick = (event) => {
    setSettingsAnchorEl(event.currentTarget);
  };

  const settingsPopoverClose = () => {
    setSettingsAnchorEl(null);
  };

  // Info popover states
  const infoPopoverEnter = () => {
    setOpenedInfoPopover(true);
  };
  const infoPopoverLeave = () => {
    setOpenedInfoPopover(false);
  };

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
      <Box
        component="span"
        ref={infoPopoverAnchor}
        aria-owns={infoOpenedPopover ? "info-popover" : undefined}
        aria-haspopup="true"
        onMouseEnter={infoPopoverEnter}
        onMouseLeave={infoPopoverLeave}
        sx={{ display: "inline-flex" }}
      >
        <RiInformation2Line />
      </Box>
      <Box sx={{ marginLeft: "auto", display: "flex", alignItems: "center" }}>
        <Button
          color="inherit"
          onClick={settingsPopoverClick}
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
          <IoSettingsOutline size="1rem" />
        </Button>

        <Button
          size="small"
          color="inherit"
          onClick={addFilesDialogOpen}
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

      {/* Info Popover */}
      <FileSearchInfoPopover
        infoOpenedPopover={infoOpenedPopover}
        infoPopoverAnchor={infoPopoverAnchor}
        infoPopoverEnter={infoPopoverEnter}
        infoPopoverLeave={infoPopoverLeave}
      />

      {/* Settings Popover */}
      <FileSearchPopover
        settingsAnchorEl={settingsAnchorEl}
        settingsPopoverClose={settingsPopoverClose}
        settingsOpen={settingsOpen}
      />

      {/* Add Files Dialog */}
      <FileSearchAddDialog openDialog={addFilesOpen} handleClose={addFilesDialogClose} />
    </Box>
  );
};

export default FileSearchTool;
