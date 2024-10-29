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
  Fade,
} from "@mui/material";
import { styled } from "@mui/system";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { CopyToClipboard } from "react-copy-to-clipboard";
import ContentCopyTwoToneIcon from "@mui/icons-material/ContentCopyTwoTone";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Fade {...props} ref={ref} timeout={800} />;
});

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

export default function UnshareDialog({
  state,
  setOpenState,
}) {
  // Generate the shared link
  const baseDomain = window.location.origin; // Detects the current domain
  const sharedLink = `${baseDomain}/shared-conversation/${"mock"}`;
  const [isUnsharing, setIsUnsharing] = useState(false);

  // State to show copy success message
  const [copySuccess, setCopySuccess] = useState(false);

  const handleClose = (event, reason) => {
    if (event) {
      event.stopPropagation();
    }
    setOpenState(false);
  };

  const handleConfirm = (event) => {
    if (event) {
      event.stopPropagation();
    }
    
    // ...
    setOpenState(false);
  };

  return (
    <StyledDialog
      open={state}
      onClose={handleClose}
      TransitionComponent={Transition}
      maxWidth="xs"
      fullWidth
      onClick={(e) => e.stopPropagation()}
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
      <DialogContent onClick={(e) => e.stopPropagation()}>
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
              Mock Remaining Hours
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
            <CopyToClipboard
              text={sharedLink}
              onCopy={() => {
                setCopySuccess(true);
                setTimeout(() => setCopySuccess(false), 2000);
              }}
            >
              <Tooltip title={copySuccess ? "Copied!" : "Copy to clipboard"}>
                <StyledOutlinedIconButton sx={{ ml: 1 }}>
                  {copySuccess ? (
                    <ContentCopyTwoToneIcon />
                  ) : (
                    <ContentCopyIcon />
                  )}
                </StyledOutlinedIconButton>
              </Tooltip>
            </CopyToClipboard>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions
        sx={{ justifyContent: "space-between", padding: "0 24px 16px 24px" }}
      >
        <StyledCancelButton
          onClick={handleClose}
          variant="outlined"
          disabled={isUnsharing}
        >
          Close
        </StyledCancelButton>
        <StyledButton
          onClick={handleConfirm}
          variant="contained"
          disabled={isUnsharing}
        >
          Stop Sharing
        </StyledButton>
      </DialogActions>
    </StyledDialog>
  );
}
