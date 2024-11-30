import React, { useContext } from "react";
import { styled } from "@mui/material/styles";
import { DrawerContext } from "../../contexts/DrawerContext";

const drawerWidth = 240;

const Main = styled("main", {
  shouldForwardProp: (prop) => prop !== "open" && prop !== "isSmallScreen",
})(({ theme, open, isSmallScreen }) => ({
  flexGrow: 1,
  display: "flex",
  flexDirection: "column",
  height: "100%",
  transition: theme.transitions.create(["margin", "width"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: isSmallScreen ? 0 : `-${drawerWidth}px`,
  width: isSmallScreen
    ? "100%"
    : open
    ? `calc(100% - ${drawerWidth}px)`
    : "100%",
  ...(open &&
    !isSmallScreen && {
      transition: theme.transitions.create(["margin", "width"], {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
      width: `calc(100% - ${drawerWidth}px)`,
    }),
}));

export default function MainContent({ children }) {
  const { open, isSmallScreen } = useContext(DrawerContext);
  return (
    <Main open={open} isSmallScreen={isSmallScreen}>
      {children}
    </Main>
  );
}
