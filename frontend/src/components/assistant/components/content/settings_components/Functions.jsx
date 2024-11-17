import { Box, Button, Typography, useMediaQuery } from "@mui/material";
import React, { useContext, useRef, useState } from "react";
import { RiInformation2Line } from "react-icons/ri";
import { GoPlus } from "react-icons/go";
import { DrawerContext } from "../../../../../contexts/DrawerContext";
import InfoPopover from "./InfoPopover";
import FunctionAddDialog from "./FunctionAddDialog";

const drawerWidth = 240;

const Functions = () => {
  const { open, isSmallScreen } = useContext(DrawerContext);
  const isMobile = useMediaQuery(
    isSmallScreen
      ? `(max-width:815px)`
      : `(max-width:${open ? 815 + drawerWidth : 815}px)`
  );

  // Info Popover State
  const infoPopoverAnchor = useRef(null);
  const [infoOpenedPopover, setOpenedInfoPopover] = useState(false);

  // Add Functions Dialog
  const [addFunctions, setAddFunctions] = useState(false);

  // Add Functions states
  const addFunctionsDialogOpen = () => {
    setAddFunctions(true);
  };

  const addFunctionsDialogClose = () => {
    setAddFunctions(false);
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
        ml: isMobile ? 0.4 : 1.2,
        mt: 1,
      }}
    >
      <Typography
        variant="body1"
        sx={{
          fontFamily: "'Montserrat', serif",
        }}
      >
        Functions
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
          onClick={addFunctionsDialogOpen}
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
            Functions
          </Typography>
        </Button>
      </Box>

      {/* Info Popover */}
      <InfoPopover
        infoOpenedPopover={infoOpenedPopover}
        infoPopoverAnchor={infoPopoverAnchor}
        infoPopoverEnter={infoPopoverEnter}
        infoPopoverLeave={infoPopoverLeave}
        text="Function calling lets you describe custom functions of your app or external APIs to the assistant. 
        This allows the assistant to intelligently call those functions 
        by outputting a JSON object containing relevant arguments."
        link="https://platform.openai.com/docs/assistants/overview"
      />

      {/* Add Function Dialog */}
      <FunctionAddDialog
        openDialog={addFunctions}
        handleClose={addFunctionsDialogClose}
        vectorStoreButton={false}
      />
    </Box>
  );
};

export default Functions;
