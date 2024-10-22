import React, { useContext, useState } from "react";
import { Menu, MenuItem, IconButton, Box, Tooltip, Fade } from "@mui/material";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import SettingsSharpIcon from "@mui/icons-material/SettingsSharp";
import { ConversationContext } from "../../contexts/ConversationContext";

export default function ChatOptionsMenu() {
  const { setActiveConversation } =
    useContext(ConversationContext);

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  // Manage menu state
  const handleMenuOpen = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (event) => {
    if (event) event.stopPropagation();
    setAnchorEl(null);
  };

  const options = [
    {
      name: "New",
      icon: <AddCircleIcon fontSize="small" sx={{ marginRight: 1 }} />,
      handleClick: () => {
        setActiveConversation(null);
        handleMenuClose();
      },
    },
  ];

  return (
    <>
      <Tooltip title="Options">
        <IconButton
          onClick={handleMenuOpen}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <SettingsSharpIcon sx={{ color: "#fff" }} />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        sx={{
          "& .MuiPaper-root": {
            backgroundColor: "#404040",
            borderRadius: "15px",
            border: "0.4px solid rgba(255, 255, 255, 0.19)",
          },
        }}
      >
        {options.map((option, id) => (
          <MenuItem
            key={id}
            onClick={(event) => {
              event.stopPropagation();
              option.handleClick();
            }}
            sx={{
              padding: "4px 16px",
              "&:hover": { backgroundColor: "transparent" },
            }}
          >
            <Box
              sx={{
                padding: "4px 8px",
                borderRadius: "8px",
                minWidth: "100px",
                "&:hover": {
                  backgroundColor: "#555555",
                },
                color: "white",
                display: "flex",
                alignItems: "center",
              }}
            >
              {option.icon}
              {option.name}
            </Box>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
