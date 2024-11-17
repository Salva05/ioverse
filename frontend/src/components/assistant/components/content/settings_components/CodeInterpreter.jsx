import { Box, Button, Divider, Typography, useMediaQuery } from "@mui/material";
import React, { useContext, useRef, useState } from "react";
import Switch from "../../../../Switch";
import { RiInformation2Line } from "react-icons/ri";
import { GoPlus } from "react-icons/go";
import { DrawerContext } from "../../../../../contexts/DrawerContext";
import InfoPopover from "./InfoPopover";
import FileSearchAddDialog from "./FileSearchAddDialog";

const drawerWidth = 240;

const CodeInterpreter = () => {
  const { open, isSmallScreen } = useContext(DrawerContext);
  const isMobile = useMediaQuery(
    isSmallScreen
      ? `(max-width:815px)`
      : `(max-width:${open ? 815 + drawerWidth : 815}px)`
  );

  // Info Popover State
  const infoPopoverAnchor = useRef(null);
  const [infoOpenedPopover, setOpenedInfoPopover] = useState(false);

  // Add Files Dialog
  const [addFilesOpen, setAddFilesOpen] = useState(false);

  // Add Files states
  const addFilesDialogOpen = () => {
    setAddFilesOpen(true);
  };

  const addFilesDialogClose = () => {
    setAddFilesOpen(false);
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
        Code Interpreter
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
      <InfoPopover
        infoOpenedPopover={infoOpenedPopover}
        infoPopoverAnchor={infoPopoverAnchor}
        infoPopoverEnter={infoPopoverEnter}
        infoPopoverLeave={infoPopoverLeave}
        text="Code Interpreter enables the assistant to write and run code. 
        This tool can process files with diverse data and formatting, 
        and generate files such as graphs."
        link="https://platform.openai.com/docs/assistants/overview"
      />

      {/* Add Files Dialog */}
      <FileSearchAddDialog openDialog={addFilesOpen} handleClose={addFilesDialogClose} vectorStoreButton={false} />
    </Box>
  );
};

export default CodeInterpreter;
