import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Button,
  Box,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ActiveAssistant from "./components/ActiveAssistant";
import Tabs from "./components/Tabs";

const Container = () => {
  

  return (
    <AppBar
      position="static"
      color="transparent"
      enableColorOnDark
      sx={{ boxShadow: "none" }}
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <ActiveAssistant />
        <Tabs/>

        {/* Right section with more options and a circular icon button */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <IconButton color="inherit" sx={{ mr: 1 }}>
            <MoreVertIcon />
          </IconButton>
          <Button
            variant="contained"
            color="secondary"
            sx={{ borderRadius: "80%" }}
          >
            -
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Container;
