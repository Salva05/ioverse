import * as React from "react";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import AppBar from "./AppBar";
import DrawerMenu from "./DrawerMenu";
import MainContent from "./MainContent";
import { Outlet } from "react-router-dom";
import { useMediaQuery, ThemeProvider, createTheme } from "@mui/material";
import { AuthProvider } from "../../contexts/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { DrawerContext } from "../../contexts/DrawerContext";
import { useDarkMode } from "../../contexts/DarkModeContext";

export default function Layout() {
  const { darkMode } = useDarkMode();
  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
      ...(darkMode
        ? {
          background: {
            default: "#1e1e1e",
            paper: "#2c2c2c",
          }
        }
        : {
          background: {
            default: "#f5f5f5",
            paper: "#f9f9f9"
          }
        }
      )
    },
  });

  // Changes the custom scrollbar's palette
  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
  }, [darkMode]);

  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [open, setOpen] = React.useState(false); // Initialize based on screen size

  const handleDrawerOpen = () => setOpen(true);
  const handleDrawerClose = () => {
    const menuButton = document.getElementById("menu-button");
    if (menuButton) {
      menuButton.focus();
    }
    setOpen(false);
  };

  return (
    <AuthProvider>
      <DrawerContext.Provider value={{ open, isSmallScreen }}>
      <ThemeProvider theme={theme}>
        <Box sx={{ display: "flex", width: "100%"}}>
          <CssBaseline />
          <AppBar
            handleDrawerOpen={handleDrawerOpen}
          />
          <DrawerMenu
            handleDrawerClose={handleDrawerClose}
          />
          <MainContent>
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
        </ThemeProvider>
      </DrawerContext.Provider>
    </AuthProvider>
  );
}
