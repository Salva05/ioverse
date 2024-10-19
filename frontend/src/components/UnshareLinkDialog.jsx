import React, { useContext, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Backdrop,
  CircularProgress,
  Box,
  TextField,
  IconButton,
  Tooltip,
} from "@mui/material";
import { styled } from "@mui/system";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { ConversationContext } from "../contexts/ConversationContext";
import ContentCopyTwoToneIcon from "@mui/icons-material/ContentCopyTwoTone";

const StyledDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    borderRadius: theme.shape.borderRadius * 2,
    padding: theme.spacing(2),
    backgroundColor: "#2d2d2d",
    boxShadow: theme.shadows[5],
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  color: "#ffffff",
  backgroundColor: theme.palette.error.main,
  "&:hover": {
    backgroundColor: theme.palette.error.dark,
  },
}));

const StyledCancelButton = styled(Button)(({ theme }) => ({
  color: "#ffffff",
  borderColor: "#ffffff",
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
}));

const StyledLinkField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    color: "#ffffff",
    borderRadius: theme.shape.borderRadius,
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "#ffffff",
  },
  "& .MuiInputBase-input": {
    color: "#ffffff",
  },
}));

const StyledOutlinedIconButton = styled(IconButton)(({ theme }) => ({
  borderColor: "#ffffff",
  borderWidth: "1px",
  borderStyle: "solid",
  borderRadius: theme.shape.borderRadius,
  height: "100%",
  color: "#ffffff",
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
}));

export default function ShareDetailsDialog({
  open,
  onClose,
  onConfirm,
  TransitionComponent,
  isUnsharing,
  remainingHours,
}) {
  const { activeConversation } = useContext(ConversationContext);

  // Generate the shared link
  const baseDomain = window.location.origin; // Detects the current domain
  const sharedLink = `${baseDomain}/shared-conversation/${activeConversation?.share_token}`;

  // State to show copy success message
  const [copySuccess, setCopySuccess] = useState(false);

  // Function to copy link to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(sharedLink).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000); // Reset after 2 seconds
    });
  };

  return (
    <StyledDialog
      open={open}
      onClose={onClose}
      TransitionComponent={TransitionComponent}
      maxWidth="xs"
      fullWidth
    >
      <Backdrop
        open={isUnsharing}
        sx={{ position: "absolute", zIndex: 1301, color: "#fff" }}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      <DialogTitle
        sx={{ textAlign: "center", fontWeight: "bold", color: "#ffffff" }}
      >
        Sharing Details
      </DialogTitle>
      <DialogContent>
        <Box sx={{ textAlign: "center", mb: 2 }}>
          <Typography variant="body1" gutterBottom sx={{ color: "#e0e0e0" }}>
            This conversation will be available for the next{" "}
            <Typography
              component="span"
              variant="body1"
              sx={{
                fontWeight: "bold",
                color: "yellow",
                fontSize: "1.2rem",
              }}
            >
              {remainingHours} hour(s)
            </Typography>
            .
          </Typography>
          <Typography variant="body2" sx={{ color: "#e0e0e0", mb: 2 }}>
            You can view and share this link:
          </Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <StyledLinkField
              value={sharedLink}
              fullWidth
              InputProps={{
                readOnly: true,
              }}
              variant="outlined"
              size="small"
            />
            <Tooltip title={copySuccess ? "Copied!" : "Copy to clipboard"}>
              <StyledOutlinedIconButton onClick={handleCopy} sx={{ ml: 1 }}>
                {copySuccess ? <ContentCopyTwoToneIcon /> : <ContentCopyIcon />}
              </StyledOutlinedIconButton>
            </Tooltip>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions
        sx={{ justifyContent: "space-between", padding: "0 24px 16px 24px" }}
      >
        <StyledCancelButton
          onClick={onClose}
          variant="outlined"
          disabled={isUnsharing}
        >
          Close
        </StyledCancelButton>
        <StyledButton
          onClick={onConfirm}
          variant="contained"
          disabled={isUnsharing}
        >
          Stop Sharing
        </StyledButton>
      </DialogActions>
    </StyledDialog>
  );
}
