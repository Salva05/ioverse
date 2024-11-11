import React, { useState } from "react";
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
import { CopyToClipboard } from "react-copy-to-clipboard";
import ContentCopyTwoToneIcon from "@mui/icons-material/ContentCopyTwoTone";

const StyledDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    padding: theme.spacing(2),
    boxShadow: theme.shadows[5],
  },
}));

export default function UnshareDetailsDialog({
  open,
  onClose,
  onConfirm,
  TransitionComponent,
  isUnsharing,
  remainingHours,
  share_token,
}) {
  // Generate the shared link
  const baseDomain = window.location.origin; // Detects the current domain
  const sharedLink = `${baseDomain}/shared-conversation/${share_token}`;

  // State to show copy success message
  const [copySuccess, setCopySuccess] = useState(false);

  const handleClose = (event, reason) => {
    if (event) {
      event.stopPropagation();
    }
    onClose();
  };

  const handleConfirm = (event) => {
    if (event) {
      event.stopPropagation();
    }
    onConfirm();
  };

  return (
    <StyledDialog
      open={open}
      onClose={handleClose}
      TransitionComponent={TransitionComponent}
      maxWidth="xs"
      fullWidth
      onClick={(e) => e.stopPropagation()}
    >
      <Backdrop open={isUnsharing} sx={{ position: "absolute", zIndex: 1301 }}>
        <CircularProgress color="inherit" />
      </Backdrop>

      <DialogTitle sx={{ textAlign: "center", fontWeight: "bold" }}>
        Sharing Details
      </DialogTitle>
      <DialogContent onClick={(e) => e.stopPropagation()}>
        <Box sx={{ textAlign: "center", mb: 2 }}>
          <Typography variant="body1" gutterBottom>
            This conversation will be available for the next{" "}
            <Typography
              component="span"
              variant="body1"
              sx={{
                fontWeight: "bold",
                fontSize: "1.2rem",
              }}
            >
              {remainingHours} hour(s)
            </Typography>
            .
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            You can view and share this link:
          </Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <TextField
              value={sharedLink}
              fullWidth
              InputProps={{
                readOnly: true,
              }}
              variant="outlined"
              size="small"
            />
            <CopyToClipboard
              text={sharedLink}
              onCopy={() => {
                setCopySuccess(true);
                setTimeout(() => setCopySuccess(false), 2000);
              }}
            >
              <Tooltip title={copySuccess ? "Copied!" : "Copy to clipboard"}>
                <Button sx={{ ml: 1 }}>
                  {copySuccess ? (
                    <ContentCopyTwoToneIcon />
                  ) : (
                    <ContentCopyIcon />
                  )}
                </Button>
              </Tooltip>
            </CopyToClipboard>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions
        sx={{ justifyContent: "space-between", padding: "0 24px 16px 24px" }}
      >
        <Button
          onClick={handleClose}
          variant="contained"
          color="primary"
          disabled={isUnsharing}
          size="small"
        >
          Close
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={isUnsharing}
          color="error"
          size="small"
        >
          Stop Sharing
        </Button>
      </DialogActions>
    </StyledDialog>
  );
}
