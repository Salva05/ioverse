import React, { useContext, useRef, useState } from "react";
import { Menu, MenuItem, IconButton, Box, Tooltip, Fade } from "@mui/material";
import { styled } from "@mui/system";
import { useQueryClient } from "@tanstack/react-query";
import SaveIcon from "@mui/icons-material/Save";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import ShareIcon from "@mui/icons-material/Share";
import CancelScheduleSendIcon from "@mui/icons-material/CancelScheduleSend";
import SettingsSharpIcon from "@mui/icons-material/SettingsSharp";
import { ConversationContext } from "../contexts/ConversationContext";
import ShareLinkDialog from "./ShareLinkDialog";
import UnshareLinkDialog from "./UnshareLinkDialog";
import shareConversation from "../utils/shareConversation";
import unshareConversation from "../utils/unshareConversation";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Fade {...props} ref={ref} timeout={800} />;
});

export default function ChatOptionsMenu({ conversationId }) {
  const { setActiveConversation, activeConversation, activateConversation } =
    useContext(ConversationContext);
  const queryClient = useQueryClient();
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [unshareDialogOpen, setUnshareDialogOpen] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isUnsharing, setIsUnsharing] = useState(false);
  const isSharingRef = useRef(false);
  const isUnsharingRef = useRef(false);

  const isShared = activeConversation?.is_shared;

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  // Share Handlers
  const handleOpenShareDialog = () => setShareDialogOpen(true);
  const handleCloseShareDialog = () => setShareDialogOpen(false);

  const handleConfirmShareDialog = async (duration) => {
    if (isSharingRef.current) return;
    isSharingRef.current = true;
    setIsSharing(true);
    try {
      const data = await shareConversation(activeConversation.id, duration);
      activateConversation(activeConversation.id) // This causes the rerender and update of the icon
      console.log(`Sharing link duration set to: ${duration} hours`);
      console.log("Share URL:", data.share_url);
      // Optionally notify success
    } catch (error) {
      console.error("Error sharing conversation:", error);
    } finally {
      isSharingRef.current = false;
      setIsSharing(false);
      setShareDialogOpen(false);
    }
  };

  // Unshare Handlers
  const handleOpenUnshareDialog = () => setUnshareDialogOpen(true);
  const handleCloseUnshareDialog = () => setUnshareDialogOpen(false);

  const handleConfirmUnshareDialog = async () => {
    if (isUnsharingRef.current) return;
    isUnsharingRef.current = true;
    setIsUnsharing(true);
    try {
      await unshareConversation(activeConversation.id);
      activateConversation(activeConversation.id)
      console.log(
        `Conversation with ID ${activeConversation.id} unshared successfully`
      );
    } catch (error) {
      console.error("Error unsharing conversation:", error);
    } finally {
      isUnsharingRef.current = false;
      setIsUnsharing(false);
      setUnshareDialogOpen(false);
    }
  };

  const calculateRemainingHours = () => {
    if (!activeConversation?.expires_at) return 0;
  
    const expiresAt = new Date(activeConversation.expires_at);
    const now = new Date();
    // Calculate the difference in milliseconds
    const remainingMs = expiresAt - now;
    // Convert milliseconds to hours
    const remainingHours = remainingMs / (1000 * 60 * 60);  
    return remainingHours > 0 ? Math.ceil(remainingHours) : 0;
  };

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
    isShared
      ? {
          name: "Unshare",
          icon: (
            <CancelScheduleSendIcon fontSize="small" sx={{ marginRight: 1 }} />
          ),
          handleClick: () => {
            handleOpenUnshareDialog();
            handleMenuClose();
          },
        }
      : {
          name: "Share",
          icon: <ShareIcon fontSize="small" sx={{ marginRight: 1 }} />,
          handleClick: () => {
            handleOpenShareDialog();
            handleMenuClose();
          },
        },
    {
      name: "Save",
      icon: <SaveIcon fontSize="small" sx={{ marginRight: 1 }} />,
      handleClick: () => {
        // Implement save functionality
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
        TransitionComponent={Transition}
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

      {/* Share Dialog */}
      {!isShared && activeConversation && (
        <ShareLinkDialog
          open={shareDialogOpen}
          onClose={handleCloseShareDialog}
          onConfirm={handleConfirmShareDialog}
          TransitionComponent={Transition}
          isSharing={isSharing}
        />
      )}

      {/* Unshare Dialog */}
      {isShared && activeConversation && (
        <UnshareLinkDialog
          open={unshareDialogOpen}
          onClose={handleCloseUnshareDialog}
          onConfirm={handleConfirmUnshareDialog}
          TransitionComponent={Transition}
          isUnsharing={isUnsharing}
          remainingHours={calculateRemainingHours()}
        />
      )}
    </>
  );
}
