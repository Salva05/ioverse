import * as React from "react";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import AppBar from "./AppBar";
import DrawerMenu from "./DrawerMenu";
import MainContent from "./MainContent";
import { Outlet } from "react-router-dom";
import { useMediaQuery, useTheme } from "@mui/material";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { DrawerContext } from "../contexts/DrawerContext";

export default function Layout() {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [open, setOpen] = React.useState(false); // Initialize based on screen size

  const handleDrawerOpen = () => setOpen(true);
  const handleDrawerClose = () => {
    setOpen(false);
    const menuButton = document.getElementById("menu-button");
    if (menuButton) {
      menuButton.focus();
    }
  };

  return (
    <DrawerContext.Provider value={{ open, isSmallScreen }}>
      <Box sx={{ display: "flex", height: "100vh", width: "100%" }}>
        <CssBaseline />
        <AppBar
          open={open}
          isSmallScreen={isSmallScreen}
          handleDrawerOpen={handleDrawerOpen}
        />
        <DrawerMenu
          open={open}
          isSmallScreen={isSmallScreen}
          handleDrawerClose={handleDrawerClose}
        />
        <MainContent open={open} isSmallScreen={isSmallScreen}>
          <Outlet />
        </MainContent>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
      </Box>
    </DrawerContext.Provider>
  );
}
