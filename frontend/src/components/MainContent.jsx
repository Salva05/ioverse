import React from "react";
import { styled } from "@mui/material/styles";

const Main = styled("main", {
  shouldForwardProp: (prop) => prop !== "open" && prop !== "isSmallScreen",
})(({ theme, open, isSmallScreen }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  display: "flex",
  flexDirection: "column",
  height: '100vh',
  transition: theme.transitions.create("margin", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: isSmallScreen ? 0 : `-${240}px`,
  ...(open &&
    !isSmallScreen && {
      marginLeft: 0,
      transition: theme.transitions.create("margin", {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
    }),
  paddingTop: theme.spacing(8),
}));

export default function MainContent({ open, isSmallScreen, children }) {
  return (
    <Main open={open} isSmallScreen={isSmallScreen} >
      {children}
    </Main>
  );
}
