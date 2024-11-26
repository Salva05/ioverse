import React, { useContext, useState } from "react";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import { useLocation, useNavigate } from "react-router-dom";
import { Menu, MenuItem, useMediaQuery } from "@mui/material";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import ChatOptionsMenu from "../chat/ChatOptionsMenu";
import { AuthContext } from "../../contexts/AuthContext";
import LogoutButton from "../LogoutButton";
import PersonIcon from "@mui/icons-material/Person";
import { useDarkMode } from "../../contexts/DarkModeContext";
import { SiCircuitverse } from "react-icons/si";
import { DrawerContext } from "../../contexts/DrawerContext";
import { GrSystem } from "react-icons/gr";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";

const StyledAppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  backgroundColor: "#1e1e1e",
  transition: theme.transitions.create(["margin", "width"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - 240px)`,
    marginLeft: "240px",
  }),
}));

export default function AppBar({ handleDrawerOpen }) {
  const { open, isSmallScreen } = useContext(DrawerContext);
  const { themePreference, toggleThemePreference } = useDarkMode();

  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Use media query to detect when screen width is below 1109px
  const isNarrowScreen = useMediaQuery("(max-width:1109px)");

  // Check if the current page is '/chat'
  const isChatPage = location.pathname === "/chat";

  // Conditionally render the IconButton to access chat options
  const shouldShowChatOptions = isNarrowScreen && isChatPage;

  const [anchorEl, setAnchorEl] = useState(null);

  const openMenu = (event) => setAnchorEl(event.currentTarget);
  const closeMenu = () => setAnchorEl(null);

  return (
    <StyledAppBar position="fixed" open={open && !isSmallScreen}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Box
          sx={{ display: "flex", alignItems: "center", position: "relative" }}
        >
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            id="menu-button"
          >
            <MenuIcon fontSize="small" />
          </IconButton>
          <IconButton color="inherit" onClick={openMenu}>
            {themePreference === "light" ? (
              <LightModeIcon fontSize="small" />
            ) : themePreference === "dark" ? (
              <DarkModeIcon fontSize="small" />
            ) : (
              <GrSystem size={17} />
            )}
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={closeMenu}
          >
            <MenuItem
              selected={themePreference === "light"}
              onClick={() => {
                toggleThemePreference("light");
                closeMenu();
              }}
              sx={{
                display: "flex",
                justifyContent: "flex-start",
                alignItems: "center",
                borderRadius: "10px",
                padding: "4px 16px",
                minWidth: "150px",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: "8px",
                }}
              >
                <LightModeIcon fontSize="small" />
              </Box>
              Light Theme
            </MenuItem>
            <MenuItem
              selected={themePreference === "dark"}
              onClick={() => {
                toggleThemePreference("dark");
                closeMenu();
              }}
              sx={{
                display: "flex",
                justifyContent: "flex-start",
                alignItems: "center",
                borderRadius: "10px",
                padding: "4px 16px",
                minWidth: "150px",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: "8px",
                }}
              >
                <DarkModeIcon fontSize="small" />
              </Box>
              Dark Theme
            </MenuItem>
            <MenuItem
              selected={themePreference === "system"}
              onClick={() => {
                toggleThemePreference("system");
                closeMenu();
              }}
              sx={{
                display: "flex",
                justifyContent: "flex-start",
                alignItems: "center",
                borderRadius: "10px",
                padding: "4px 16px",
                minWidth: "150px",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: "8px",
                }}
              >
                <GrSystem size={17} />
              </Box>
              System Theme
            </MenuItem>
          </Menu>
          {shouldShowChatOptions && (
            <>
              <Divider
                orientation="vertical"
                variant="middle"
                flexItem
                sx={{ backgroundColor: "white" }}
              />
              <ChatOptionsMenu />
            </>
          )}
        </Box>
        <Typography variant="h6" noWrap component="div">
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <SiCircuitverse style={{ marginRight: 10, position: "relative" }} />
            IOverse
          </Box>
        </Typography>
        {isAuthenticated ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              overflow: "visible",
            }}
          >
            <IconButton onClick={() => navigate("account")}>
              <PersonIcon sx={{ color: "white" }} fontSize="medium" />
            </IconButton>
            <Divider
              orientation="vertical"
              variant="middle"
              flexItem
              sx={{ backgroundColor: "white", mx: 1 }}
            />
            <LogoutButton />
          </Box>
        ) : (
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Button color="inherit" onClick={() => navigate("register")}>
              Register
            </Button>
            <Divider
              orientation="vertical"
              variant="middle"
              flexItem
              sx={{ backgroundColor: "white", mx: 1 }}
            />
            <Button color="inherit" onClick={() => navigate("login")}>
              Login
            </Button>
          </Box>
        )}
      </Toolbar>
    </StyledAppBar>
  );
}
