import React, { useContext } from "react";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import { useLocation, useNavigate } from "react-router-dom";
import { useMediaQuery } from "@mui/material";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import ChatOptionsMenu from "../chat/ChatOptionsMenu";
import { AuthContext } from "../../contexts/AuthContext";
import LogoutButton from "../LogoutButton";
import PersonIcon from "@mui/icons-material/Person";

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
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Use media query to detect when screen width is below 1109px
  const isNarrowScreen = useMediaQuery("(max-width:1109px)");

  // Check if the current page is '/chat'
  const isChatPage = location.pathname === "/chat";

  // Conditionally render the IconButton to access chat options
  const shouldShowChatOptions = isNarrowScreen && isChatPage;

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
              <ChatOptionsMenu />
            </>
          )}
        </Box>
        <Typography variant="h6" noWrap component="div">
          IOverse
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
