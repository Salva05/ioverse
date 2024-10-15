import * as React from "react";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import AppBar from "./AppBar";
import DrawerMenu from "./DrawerMenu";
import MainContent from "./MainContent";
import { Outlet } from "react-router-dom";
import { useMediaQuery, useTheme } from "@mui/material";

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Layout() {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [open, setOpen] = React.useState(false);

  const handleDrawerOpen = () => setOpen(true);
  const handleDrawerClose = () => setOpen(false);
  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
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
  );
}
