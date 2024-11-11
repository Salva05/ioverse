import React, { useContext, useState } from "react";
import { useTheme } from "@mui/material/styles";
import SpeedDialIcon from "@mui/material/SpeedDialIcon";
import SpeedDialAction from "@mui/material/SpeedDialAction";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import { useMediaQuery, SpeedDial } from "@mui/material";
import { DrawerContext } from "../../contexts/DrawerContext";
import { ConversationContext } from "../../contexts/ConversationContext";
import { useDarkMode } from "../../contexts/DarkModeContext";

export default function ChatDial() {
  const { darkMode } = useDarkMode();

  const { setActiveConversationId } = useContext(ConversationContext);
  const theme = useTheme();
  const { open: drawerOpen } = useContext(DrawerContext);

  // Detect when screen width is below 1109px
  const isNarrowScreen = useMediaQuery("(max-width:1109px)");
  const [dialOpen, setDialOpen] = useState(false);

  // Dial logic
  const handleOpen = () => setDialOpen(true);
  const handleClose = () => setDialOpen(false);

  // Dial positioning
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
        setActiveConversationId(null);
      },
    },
  ];

  if (isNarrowScreen) return null;

  return (
    <>
      <SpeedDial
        ariaLabel="SpeedDial playground example"
        icon={<SpeedDialIcon />}
        direction="down"
        FabProps={{
          size: "medium",
        }}
        onClose={handleClose}
        onOpen={handleOpen}
        open={dialOpen}
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
            sx={{
              backgroundColor: darkMode ? theme.palette.grey[800] : "default",
              "&:hover": {
                backgroundColor: darkMode ? theme.palette.grey[700] : "default",
              },
            }}
          />
        ))}
      </SpeedDial>
    </>
  );
}
