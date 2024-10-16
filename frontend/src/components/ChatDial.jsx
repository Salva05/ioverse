import React, { useContext } from "react";
import { useTheme } from "@mui/material/styles";
import SpeedDialIcon from "@mui/material/SpeedDialIcon";
import SpeedDialAction from "@mui/material/SpeedDialAction";
import SaveIcon from "@mui/icons-material/Save";
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import ShareIcon from '@mui/icons-material/Share';
import { useMediaQuery, SpeedDial } from "@mui/material";
import { DrawerContext } from "../contexts/DrawerContext";

const actions = [
  { icon: <AddOutlinedIcon />, name: "New" },
  { icon: <ShareIcon />, name: "Share" },
  { icon: <SaveIcon />, name: "Save" },
];

export default function ChatDial() {
  const theme = useTheme();
  const { open: drawerOpen, isSmallScreen } = useContext(DrawerContext);

  // Use media query to detect when screen width is below 900px
  const isNarrowScreen = useMediaQuery('(max-width:1109px)');

  if (isNarrowScreen) return null;

  const drawerWidth = 240; // Ensure this matches your DrawerMenu
  const spacing = parseInt(theme.spacing(2), 10);

  // Base left position remains constant
  const leftPosition = spacing;

  // Calculate transformX based on drawer state
  const transformX = drawerOpen ? drawerWidth : 0;

  // Use consistent transition duration and easing
  const transitionDuration = theme.transitions.duration.enteringScreen; // Match with drawer
  const transitionEasing = theme.transitions.easing.sharp; // Match with drawer

  return (
    <SpeedDial
      ariaLabel="SpeedDial playground example"
      icon={<SpeedDialIcon />}
      direction="down"
      sx={{
        position: 'fixed',
        top: theme.spacing(10),
        left: `${leftPosition}px`,
        zIndex: 99,
        transform: `translateX(${transformX}px)`,
        transition: theme.transitions.create('transform', {
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
        />
      ))}
    </SpeedDial>
  );
}
