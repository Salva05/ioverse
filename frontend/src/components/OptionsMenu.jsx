import React, { useState } from "react";
import {
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogActions,
  Button,
  Box,
  Tooltip,
} from "@mui/material";
import {
  MoreVert,
  Delete as DeleteIcon,
  Inventory as InventoryIcon,
} from "@mui/icons-material";
import PopupState, { bindTrigger, bindMenu } from "material-ui-popup-state";
import chatService from "../services/chatService";
import { useQueryClient } from "@tanstack/react-query";

export default function OptionsMenu({ conversationId }) {
  const queryClient = useQueryClient();
  const [confirmOpen, setConfirmOpen] = React.useState(false);

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

  const handleDeleteClick = (event) => {
    event.stopPropagation();
    setConfirmOpen(true);
  };

  const handleConfirmClose = () => {
    setConfirmOpen(false);
  };

  const handleConfirmDelete = async () => {
    try {
      await chatService.deleteConversation(conversationId);
      queryClient.invalidateQueries(["conversations"]);
    } catch (error) {
      console.error("Failed to delete conversation:", error);
    } finally {
      setConfirmOpen(false);
    }
  };

  return (
    <>
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
                onClick={(e) => {
                  popupState.close();
                  handleDeleteClick(e);
                }}
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
      <Dialog
        open={confirmOpen}
        onClose={(e) => {
          e.stopPropagation();
          handleConfirmClose(e);
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <DialogTitle>Are you sure you want to delete?</DialogTitle>
        <DialogActions>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleConfirmClose(e);
            }}
            color="primary"
          >
            Cancel
          </Button>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleConfirmDelete(e);
            }}
            color="error"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
