import React, { useContext, useState } from "react";
import { useTheme } from "@mui/material/styles";
import SpeedDialIcon from "@mui/material/SpeedDialIcon";
import SpeedDialAction from "@mui/material/SpeedDialAction";
import SaveIcon from "@mui/icons-material/Save";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import ShareIcon from "@mui/icons-material/Share";
import { useMediaQuery, SpeedDial } from "@mui/material";
import { DrawerContext } from "../contexts/DrawerContext";
import { ConversationContext } from "../contexts/ConversationContext";

export default function ChatDial() {
  const { activateConversation, setActiveConversation } =
    useContext(ConversationContext);
  const theme = useTheme();
  const { open: drawerOpen, isSmallScreen } = useContext(DrawerContext);

  // Use media query to detect when screen width is below 1109px
  const isNarrowScreen = useMediaQuery("(max-width:1109px)");
  const [dialOpen, setDialOpen] = useState(false);

  if (isNarrowScreen) return null;


  const handleOpen = () => setDialOpen(true);
  const handleClose = () => setDialOpen(false);

  const drawerWidth = 240;
  const spacing = parseInt(theme.spacing(2), 10);

  const leftPosition = spacing;
  const transformX = drawerOpen ? drawerWidth : 0;

  const transitionDuration = theme.transitions.duration.enteringScreen;
  const transitionEasing = theme.transitions.easing.sharp;

  const actions = [
    {
      icon: <AddOutlinedIcon />,
      name: "New",
      handleAction: () => {
        setActiveConversation(null);
      },
    },
    {
      icon: <ShareIcon />,
      name: "Share",
      handleAction: () => {},
    },
    {
      icon: <SaveIcon />,
      name: "Save",
      handleAction: () => {},
    },
  ];

  return (
    <SpeedDial
      ariaLabel="SpeedDial playground example"
      icon={<SpeedDialIcon />}
      direction="down"
      FabProps={{
        sx: (theme) => ({
          backgroundColor: dialOpen ? "#fff" : "#2d2d2d",
          color: dialOpen ? "black" : "white",
          transition: `${theme.transitions.create(['background-color', 'color'], {
            duration: theme.transitions.duration.shortest,
            easing: theme.transitions.easing.easeInOut,
          })}`,
          "&:hover": {
            backgroundColor: dialOpen ? "#fff" : "#2d2d2d",
            color: "black",
          },
        }),
        size: "medium",
      }}
      onClose={handleClose}
      onOpen={handleOpen}
      open={dialOpen} // Controls the open state
      sx={{
        position: "fixed",
        top: theme.spacing(10),
        left: `${leftPosition}px`,
        zIndex: 99,
        transform: `translateX(${transformX}px)`,
        transition: theme.transitions.create("transform", {
          easing: transitionEasing,
          duration: transitionDuration,
        }),
      }}
    >
      {actions.map((action) => (
        <SpeedDialAction
          key={action.name}
          icon={action.icon}
          tooltipTitle={action.name}
          onClick={action.handleAction}
        />
      ))}
    </SpeedDial>
  );
}
