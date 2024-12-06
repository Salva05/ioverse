import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  IconButton,
  Tooltip,
  Fade,
} from "@mui/material";
import { styled } from "@mui/system";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { CopyToClipboard } from "react-copy-to-clipboard";
import ContentCopyTwoToneIcon from "@mui/icons-material/ContentCopyTwoTone";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Fade {...props} ref={ref} timeout={600} />;
});

const StyledDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    padding: theme.spacing(2),
    boxShadow: theme.shadows[5],
  },
}));

export default function UnshareDialog({
  open,
  image,
  setOpenState,
  onUnshare,
}) {
  // Generate the shared link
  const baseDomain = window.location.origin; // Detects the current domain
  const shareUrl = `${baseDomain}/shared-image/${image.share_token}/`;

  // State to show copy success message
  const [copySuccess, setCopySuccess] = useState(false);

  const handleClose = (event, reason) => {
    if (event) {
      event.stopPropagation();
    }
    setOpenState(false);
  };

  const handleConfirm = async () => {
    onUnshare();
  };

  const calculateRemainingHours = () => {
    if (!image.expires_at) return 0;
    const expiresAt = new Date(image.expires_at);
    const now = new Date();
    const diffMs = expiresAt - now;
    const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
    return diffHours > 0 ? diffHours : 0;
  };

  return (
    <StyledDialog
      open={open}
      onClose={handleClose}
      TransitionComponent={Transition}
      maxWidth="xs"
      fullWidth
      onClick={(e) => e.stopPropagation()}
      sx={{
        "& *": {
          fontFamily: "'Montserrat', serif",
        },
      }}
    >
      <DialogTitle sx={{ textAlign: "center", fontWeight: "bold" }}>
        Sharing Details
      </DialogTitle>
      <DialogContent onClick={(e) => e.stopPropagation()}>
        <Box
          sx={{
            textAlign: "center",
            mb: 2,
            "& *": {
              fontFamily: "'Montserrat', serif",
            },
          }}
        >
          <Typography variant="body1" gutterBottom>
            This image will be available for the next{" "}
            <Typography
              component="span"
              variant="body1"
              sx={{
                fontWeight: "bold",
                fontSize: "1.2rem",
              }}
            >
              {calculateRemainingHours()} hour(s)
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
              value={shareUrl}
              fullWidth
              InputProps={{
                readOnly: true,
              }}
              variant="outlined"
              size="small"
            />
            <CopyToClipboard
              text={shareUrl}
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
          size="small"
          sx={{ fontFamily: "'Montserrat', serif", textTransform: "none" }}
        >
          Close
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="error"
          size="small"
          sx={{ fontFamily: "'Montserrat', serif", textTransform: "none" }}
        >
          Stop Sharing
        </Button>
      </DialogActions>
    </StyledDialog>
  );
}
