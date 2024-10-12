import React from "react";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";

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
  return (
    <StyledAppBar position="fixed" open={open && !isSmallScreen}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={handleDrawerOpen}
          edge="start"
          sx={{ mr: 2, display: open && !isSmallScreen ? "none" : "block" }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" noWrap component="div">
          Dark Menu
        </Typography>
        <Button color="inherit">Login</Button>
      </Toolbar>
    </StyledAppBar>
  );
}
