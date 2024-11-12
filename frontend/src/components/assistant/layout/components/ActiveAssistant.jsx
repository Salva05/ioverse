import React, { useState } from "react";

// Material UI components
import {
  Box,
  Button,
  Typography,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
} from "@mui/material";

// Material UI icons
import CheckIcon from "@mui/icons-material/Check";
import AddIcon from "@mui/icons-material/Add";

// React Icons
import { FaRobot } from "react-icons/fa";
import { HiOutlineSelector } from "react-icons/hi";

const ActiveAssistant = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  // Handle opening the menu
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Handle closing the menu
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      {/* Current Assistant Button */}
      <Button
        color="inherit"
        sx={{ textTransform: "none" }}
        onClick={handleClick}
      >
        <FaRobot size="1.5em" style={{ marginRight: 15, paddingBottom: 5 }} />
        <Typography variant="h6" sx={{ fontWeight: "bold", fontSize: "1rem" }}>
          Secret Retriever
        </Typography>
        <HiOutlineSelector size="1.1em" style={{ marginLeft: 5 }} />
      </Button>
      {/* Selectable Assistant's Menu */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        sx={{
          "& .MuiMenu-paper": {
            borderRadius: 2.5,
            minWidth: "190px",
            border: "1px solid",
            borderColor: (theme) => theme.palette.divider,
          },
        }}
      >
        <MenuItem
          selected
          onClick={handleClose}
          sx={{
            mx: 1,
            borderRadius: 2,
            fontSize: "0.93rem",
            padding: "4px 8px",
            my: -0.2,
          }}
        >
          <ListItemIcon>
            <CheckIcon sx={{ fontSize: "1.1rem", mb: 0.4 }} />
          </ListItemIcon>
          Secret Retriever
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={handleClose}
          sx={{
            mx: 1,
            borderRadius: 1,
            fontSize: "0.93rem",
            padding: "4px 8px",
            my: -0.2,
          }}
        >
          <ListItemIcon>
            <AddIcon sx={{ fontSize: "1.1rem" }} />
          </ListItemIcon>
          Create assistant
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ActiveAssistant;
