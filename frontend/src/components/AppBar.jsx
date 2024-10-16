import React from "react";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import Button from "@mui/material/Button";
import SettingsIcon from "@mui/icons-material/Settings";
import { styled, useTheme } from "@mui/material/styles";
import { useLocation, useNavigate } from "react-router-dom";
import { useMediaQuery } from "@mui/material";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import ChatOptionsMenu from "./ChatOptionsMenu";

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

export default function AppBar({ open, isSmallScreen, handleDrawerOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const them = useTheme();

  // Use media query to detect when screen width is below 1109px
  const isNarrowScreen = useMediaQuery("(max-width:1109px)");

  // Check if the current page is '/chat'
  const isChatPage = location.pathname === "/chat";

  // Conditionally render the IconButton to access chat options
  const shouldShowChatOptions = isNarrowScreen && isChatPage;

  return (
    <StyledAppBar position="fixed" open={open && !isSmallScreen}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
          >
            <MenuIcon />
          </IconButton>
          {shouldShowChatOptions && (
            <>
              <Divider
                orientation="vertical"
                variant="middle"
                flexItem
                sx={{ backgroundColor: "white" }}
              />
              <IconButton color="inherit">
                <ChatOptionsMenu />
              </IconButton>
            </>
          )}
        </Box>
        <Typography variant="h6" noWrap component="div">
          Dark Menu
        </Typography>
        <Button color="inherit" onClick={() => navigate("login")}>
          Login
        </Button>
      </Toolbar>
    </StyledAppBar>
  );
}
