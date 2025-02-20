import React, { useEffect, useRef, useMemo, useState, useContext } from "react";
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
import {
  MoreVert,
  DeleteOutlineOutlined as DeleteOutlineOutlinedIcon,
  DriveFileRenameOutlineOutlined as DriveFileRenameOutlineOutlinedIcon,
  SendOutlined as SendOutlinedIcon,
  FileDownloadOutlined as FileDownloadOutlinedIcon,
  ScheduleSendOutlined as ScheduleSendOutlinedIcon,
} from "@mui/icons-material";
import PopupState, { bindMenu } from "material-ui-popup-state";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import ShareLinkDialog from "./ShareLinkDialog";
import UnshareLinkDialog from "./UnshareLinkDialog";
import handleDownload from "../../services/handleDownload";
import chat from "../../api/chat";
import shareConversation from "../../utils/shareConversation";
import unshareConversation from "../../utils/unshareConversation";
import { toast } from "react-toastify";
import { ConversationContext } from "../../contexts/ConversationContext";
import sortedConversation from "../../utils/sortedConversation";
import { useTheme } from "@emotion/react";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Fade {...props} ref={ref} timeout={500} />;
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

// Handler for errors
const handleError = (msg, genericMsg, error) => {
  console.error(msg, error);
  const errorMessage = error.response?.data?.detail || genericMsg;
  toast.error(msg + errorMessage);
};

export default function OptionsMenu({ conversationId, onRename }) {
  const theme = useTheme();
  const { activeConversationId, activateConversation } =
    useContext(ConversationContext);
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
      setShareDialogOpen(false);
      setUnshareDialogOpen(true);
    },
    onError: (error) => {
      handleError(
        "Error sharing conversation: ",
        "An error occurred while sharing the conversation.",
        error
      );
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
      handleError(
        "Error unsharing conversation: ",
        "An error occurred while unsharing the conversation.",
        error
      );
    },
    onSettled: () => {
      setIsUnsharing(false);
      isUnsharingRef.current = false;
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async () => await chat.deleteConversation(conversationId),
    onSuccess: async () => {
      // Invalidate the conversations query to refetch updated data
      await queryClient.invalidateQueries(["conversations"]);

      // Get cached conversations data
      const conversationsData = queryClient.getQueryData(["conversations"]);

      // Update the active conversation
      if (conversationId == activeConversationId && conversationsData) {
        const latestConversation = sortedConversation(conversationsData);
        activateConversation(latestConversation?.id);
      }

      setConfirmOpen(false);
    },
    onError: (error) => {
      handleError(
        "Failed to delete conversation: ",
        "An error occurred while deleting the conversation.",
        error
      );
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
                <MoreVert fontSize="small" />
              </IconButton>
            </Tooltip>
            <Menu
              {...bindMenu(popupState)}
              sx={{
                "& .MuiPaper-root": {
                  borderRadius: "15px",
                  border: "0.4px solid rgba(255, 255, 255, 0.19)",
                },
              }}
              onClose={(e, reason) => {
                setOptionMenuOpen(false);
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
                            : theme.palette.action.hover,
                      },
                      color: action.name === "Delete" ? "red" : "inherit",
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
