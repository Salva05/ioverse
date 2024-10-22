// OptionsMenu.jsx
import React, { useEffect, useRef, useState } from "react";
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
  Typography,
  Fade,
} from "@mui/material";
import { MoreVert } from "@mui/icons-material";
import PopupState, { bindTrigger, bindMenu } from "material-ui-popup-state";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import ShareLinkDialog from "./ShareLinkDialog";
import UnshareLinkDialog from "./UnshareLinkDialog";
import handleDownload from "../services/handleDownload";
import chatService from "../services/chatService";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import DriveFileRenameOutlineOutlinedIcon from "@mui/icons-material/DriveFileRenameOutlineOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import ScheduleSendOutlinedIcon from "@mui/icons-material/ScheduleSendOutlined";
import shareConversation from "../utils/shareConversation";
import unshareConversation from "../utils/unshareConversation";
import { toast } from "react-toastify";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Fade {...props} ref={ref} timeout={800} />;
});

// Helper function to calculate remaining hours
const calculateRemainingHours = (expires_at) => {
  if (!expires_at) return 0;

  const expiresAt = new Date(expires_at);
  const now = new Date();
  const remainingMs = expiresAt - now;
  const remainingHours = remainingMs / (1000 * 60 * 60);
  return remainingHours > 0 ? Math.ceil(remainingHours) : 0;
};

export default function OptionsMenu({ conversationId, onRename }) {
  const [isOptionMenuOpen, setOptionMenuOpen] = useState(false);
  const queryClient = useQueryClient();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [unshareDialogOpen, setUnshareDialogOpen] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isUnsharing, setIsUnsharing] = useState(false);
  const isSharingRef = useRef(false);
  const isUnsharingRef = useRef(false);

  // Retrieve the specific conversation from the cache
  const conversation = queryClient
    .getQueryData(["conversations"])
    ?.results.find((conv) => conv.id === conversationId);

  // Share Mutation
  const shareMutation = useMutation({
    mutationFn: async (duration) =>
      await shareConversation(conversationId, duration),
    onSuccess: (data) => {
      // Update the specific conversation in the cache
      queryClient.setQueryData(["conversations"], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          results: oldData.results.map((conv) =>
            conv.id === conversationId
              ? { ...conv, is_shared: true, expires_at: data.expires_at }
              : conv
          ),
        };
      });
      // Optionally, you can refetch the active conversation or update it in context
      setShareDialogOpen(false);
      setUnshareDialogOpen(true);
    },
    onError: (error) => {
      console.error("Error sharing conversation:", error);
      const errorMessage = error.response?.data?.detail || "An error occurred while sharing the conversation.";
      toast.error("Error sharing the conversation: " + errorMessage)
    },
    onSettled: () => {
      setIsSharing(false);
      isSharingRef.current = false;
    },
  });

  // Unshare Mutation
  const unshareMutation = useMutation({
    mutationFn: async () => await unshareConversation(conversationId),
    onSuccess: () => {
      // Update the specific conversation in the cache
      queryClient.setQueryData(["conversations"], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          results: oldData.results.map((conv) =>
            conv.id === conversationId
              ? { ...conv, is_shared: false, expires_at: null, shared_at: null }
              : conv
          ),
        };
      });
      setUnshareDialogOpen(false);
    },
    onError: (error) => {
      console.error("Error unsharing conversation:", error);
      const errorMessage = error.response?.data?.detail || "An error occurred while unsharing the conversation.";
      toast.error("Error unsharing the conversation: " + errorMessage)
    },
    onSettled: () => {
      setIsUnsharing(false);
      isUnsharingRef.current = false;
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async () =>
      await chatService.deleteConversation(conversationId),
    onSuccess: () => {
      // Invalidate the conversations query to refetch updated data
      queryClient.invalidateQueries(["conversations"]);
      setConfirmOpen(false);
      // Optionally, handle UI updates or activate another conversation
    },
    onError: (error) => {
      console.error("Failed to delete conversation:", error);
      const errorMessage = error.response?.data?.detail || "An error occurred while deleting the conversation.";
      toast.error("Error deleting the conversation: " + errorMessage)
    },
  });

  useEffect(() => {
    const checkExpiration = async () => {
      if (
        isOptionMenuOpen &&
        conversation &&
        conversation.is_shared &&
        calculateRemainingHours(conversation.expires_at) <= 0
      ) {
        if (isUnsharingRef.current) return;

        isUnsharingRef.current = true;
        setIsUnsharing(true);

        try {
          await unshareMutation.mutateAsync();
          console.log(
            `Conversation with ID ${conversationId} unshared successfully`
          );
        } catch (error) {
          console.error("Error unsharing conversation:", error);
        } finally {
          isUnsharingRef.current = false;
          setIsUnsharing(false);
        }
      }
    };

    checkExpiration();
  }, [isOptionMenuOpen, conversation, conversationId, unshareMutation]);

  // Handler functions
  const handleConfirmShareDialog = (duration) => {
    if (isSharingRef.current) return;
    isSharingRef.current = true;
    setIsSharing(true);
    shareMutation.mutate(duration);
  };

  const handleConfirmUnshareDialog = () => {
    if (isUnsharingRef.current) return;
    isUnsharingRef.current = true;
    setIsUnsharing(true);
    unshareMutation.mutate();
  };

  const handleConfirmDelete = () => {
    deleteMutation.mutate();
  };

  const actions = [
    {
      name: "Rename",
      icon: <DriveFileRenameOutlineOutlinedIcon fontSize="small" />,
      handleAction: (e, popupState) => {
        e.stopPropagation();
        popupState.close();
        // Defer the execution of 'onRename' to the end of the call stack
        // preventing the loss of focus due to menu closure immediately after
        // the rendering of the parent's ListItem component
        setTimeout(() => onRename(conversationId), 0); // Notify the parent to enter in edit mode
      },
    },
    {
      name: conversation?.is_shared ? "Sharing" : "Share",
      icon: conversation?.is_shared ? (
        <ScheduleSendOutlinedIcon fontSize="small" />
      ) : (
        <SendOutlinedIcon fontSize="small" />
      ),
      handleAction: conversation?.is_shared
        ? (e, popupState) => {
            e.stopPropagation();
            popupState.close();
            setUnshareDialogOpen(true);
          }
        : (e, popupState) => {
            e.stopPropagation();
            popupState.close();
            setShareDialogOpen(true);
          },
    },
    {
      name: "Save",
      icon: <FileDownloadOutlinedIcon fontSize="small" />,
      handleAction: (e, popupState) => {
        e.stopPropagation();
        popupState.close();
        handleDownload(conversationId);
      },
    },
    {
      name: "Delete",
      icon: <DeleteOutlineOutlinedIcon fontSize="small" />,
      handleAction: (e, popupState) => {
        e.stopPropagation();
        popupState.close();
        setConfirmOpen(true);
      },
    },
  ];

  return (
    <>
      <PopupState variant="popover" popupId="demo-popup-menu">
        {(popupState) => (
          <React.Fragment>
            <Tooltip title="Options">
              <IconButton
                variant="contained"
                onClick={(e) => {
                  setOptionMenuOpen(true);
                  e.stopPropagation();
                  e.preventDefault();
                  popupState.open(e);
                }}
                onMouseDown={(e) => e.stopPropagation()}
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
              onClose={(e, reason) => {
                setOptionMenuOpen(true);
                if (e) e.stopPropagation();
                popupState.close();
              }}
            >
              {actions.map((action, id) => (
                <MenuItem
                  key={id}
                  onClick={(event) => {
                    event.stopPropagation();
                    action.handleAction(event, popupState);
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
                        backgroundColor:
                          action.name === "Delete"
                            ? "rgba(255, 0, 0, 0.15)"
                            : "#555555",
                      },
                      color: action.name === "Delete" ? "red" : "white",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {action.icon}
                    <Typography sx={{ fontSize: 15, marginLeft: 1 }}>
                      {action.name}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Menu>
          </React.Fragment>
        )}
      </PopupState>

      {/* Confirmation Dialog for Delete */}
      <Dialog
        open={confirmOpen}
        onClose={(e, reason) => {
          if (e) e.stopPropagation();
          setConfirmOpen(false);
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <DialogTitle>Are you sure you want to delete?</DialogTitle>
        <DialogActions>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              setConfirmOpen(false);
            }}
            color="primary"
          >
            Cancel
          </Button>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleConfirmDelete();
            }}
            color="error"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Share Dialog */}
      {!conversation?.is_shared && conversation && (
        <ShareLinkDialog
          open={shareDialogOpen}
          onClose={(e, reason) => {
            if (e) e.stopPropagation();
            setShareDialogOpen(false);
          }}
          onConfirm={handleConfirmShareDialog}
          TransitionComponent={Transition}
          isSharing={isSharing}
        />
      )}

      {/* Unshare Dialog */}
      {conversation?.is_shared && conversation && (
        <UnshareLinkDialog
          open={unshareDialogOpen}
          onClose={(e, reason) => {
            if (e) e.stopPropagation();
            setUnshareDialogOpen(false);
          }}
          onConfirm={handleConfirmUnshareDialog}
          TransitionComponent={Transition}
          isUnsharing={isUnsharing}
          remainingHours={calculateRemainingHours(conversation.expires_at)}
          share_token={conversation.share_token}
        />
      )}
    </>
  );
}
