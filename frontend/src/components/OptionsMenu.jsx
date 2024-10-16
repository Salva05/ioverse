import * as React from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import PopupState, { bindTrigger, bindMenu } from "material-ui-popup-state";
import DeleteIcon from "@mui/icons-material/Delete";
import InventoryIcon from "@mui/icons-material/Inventory";
import { IconButton, Box, Tooltip } from "@mui/material";
import { MoreVert } from "@mui/icons-material";
import { useQueryClient } from "@tanstack/react-query";
import chatService from "../services/chatService";
import { useNavigate } from "react-router-dom";

export default function OptionsMenu({ conversationId }) {
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

  const handleDelete = async (id, popupState, event) => {
    try {
        event.stopPropagation();
        const response = await chatService.deleteConversation(id);
        console.log("Deleted conversation with ID: " + id + "\n\n" + response);
        popupState.close();
        queryClient.invalidateQueries(["conversations"]); // Trigger the TanQuery refetch()
    } catch (error) {
      console.error("Failed to delete conversation: ", error);
    }
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
              <MoreVert fontSize="small" sx={{ color: "#a6a6a6" }} />
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
            <MenuItem
              onClick={handleMenuItemClick(popupState)}
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
                <InventoryIcon fontSize="small" sx={{ marginRight: 1 }} />
                Archive
              </Box>
            </MenuItem>
            <MenuItem
              onClick={(event) =>
                handleDelete(conversationId, popupState, event)
              }
              sx={{
                color: "red",
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
                    backgroundColor: "rgba(255, 0, 0, 0.15)",
                  },
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <DeleteIcon fontSize="small" sx={{ marginRight: 1 }} />
                Delete
              </Box>
            </MenuItem>
          </Menu>
        </React.Fragment>
      )}
    </PopupState>
  );
}
