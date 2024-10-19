import React from "react";
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
} from "@mui/material";
import { styled } from "@mui/system";

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

export default function UnshareLinkDialog({
  open,
  onClose,
  onConfirm,
  TransitionComponent,
  isUnsharing,
  remainingHours,
}) {
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
        Unshare Conversation
      </DialogTitle>
      <DialogContent>
        <Box sx={{ textAlign: "center", mb: 2 }}>
          <Typography variant="body1" gutterBottom sx={{ color: "#e0e0e0" }}>
            This conversation is currently shared for another {remainingHours}{" "}
            hour(s).
          </Typography>
          <Typography variant="body2" sx={{ color: "#e0e0e0" }}>
            Are you sure you want to unshare it now?
          </Typography>
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
          Cancel
        </StyledCancelButton>
        <StyledButton
          onClick={onConfirm}
          variant="contained"
          disabled={isUnsharing}
        >
          {isUnsharing ? "Unsharing..." : "Confirm"}
        </StyledButton>
      </DialogActions>
    </StyledDialog>
  );
}
