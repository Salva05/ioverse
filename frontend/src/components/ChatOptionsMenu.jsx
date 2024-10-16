import * as React from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import PopupState, { bindTrigger, bindMenu } from "material-ui-popup-state";
import { IconButton, Box, Tooltip } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import SaveIcon from "@mui/icons-material/Save";
import AddCircleIcon from '@mui/icons-material/AddCircle';
import ShareIcon from '@mui/icons-material/Share';
import SettingsSharpIcon from '@mui/icons-material/SettingsSharp';

const options = [
  {
    name: "New",
    icon: <AddCircleIcon fontSize="small" sx={{ marginRight: 1 }} />,
    handleClick: () => {},
  },
  {
    name: "Share",
    icon: <ShareIcon fontSize="small" sx={{ marginRight: 1 }} />,
    handleClick: () => {},
  },
  {
    name: "Save",
    icon: <SaveIcon fontSize="small" sx={{ marginRight: 1 }} />,
    handleClick: () => {},
  },
];

export default function ChatOptionsMenu({ conversationId }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const handleClick = (event) => {
    event.stopPropagation();
    event.preventDefault();
  };

  const handleMouseDown = (event) => {
    event.stopPropagation();
  };

  const handleClose = (popupState) => (event) => {
    event.stopPropagation();
    popupState.close();
  };

  const handleMenuItemClick = (popupState) => (event) => {
    event.stopPropagation();
    popupState.close();
  };

  return (
    <PopupState variant="popover" popupId="demo-popup-menu">
      {(popupState) => (
        <React.Fragment>
          <Tooltip title="Options">
            <IconButton
              variant="contained"
              onClick={(e) => {
                handleClick(e);
                bindTrigger(popupState).onClick(e);
              }}
              onMouseDown={handleMouseDown}
            >
              <SettingsSharpIcon sx={{ color: "#fff" }} />
            </IconButton>
          </Tooltip>
          <Menu
            {...bindMenu(popupState)}
            sx={{
              "& .MuiPaper-root": {
                backgroundColor: "#404040",
                borderRadius: "15px",
                border: "0.4px solid rgba(255, 255, 255, 0.19)",
              },
            }}
            onClose={handleClose(popupState)}
          >
            {options.map((option, id) => (
              <MenuItem
              key={id}
                onClick={option.handleClick}
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
        </React.Fragment>
      )}
    </PopupState>
  );
}
