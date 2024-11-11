import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Slider,
  Typography,
  Backdrop,
  CircularProgress,
  Box,
} from "@mui/material";
import { styled } from "@mui/system";

const StyledDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    padding: theme.spacing(2),
    boxShadow: theme.shadows[5],
  },
}));

export default function ShareLinkDialog({
  open,
  onClose,
  onConfirm,
  TransitionComponent,
  isSharing,
}) {
  const [duration, setDuration] = useState(24);

  const handleSliderChange = (event, newValue) => {
    setDuration(newValue);
  };

  const handleTextFieldChange = (event) => {
    const value = event.target.value;
    setDuration(value === "" ? "" : Number(value));
  };

  const handleCancel = (event, reason) => {
    if (event) {
      event.stopPropagation();
    }
    onClose();
  };

  const handleConfirm = (event) => {
    if (event) {
      event.stopPropagation();
    }
    onConfirm(duration);
  };

  return (
    <StyledDialog
      open={open}
      onClose={handleCancel}
      TransitionComponent={TransitionComponent}
      maxWidth="xs"
      fullWidth
      onClick={(e) => e.stopPropagation()}
    >
      <Backdrop open={isSharing} sx={{ position: "absolute", zIndex: 1301 }}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <DialogTitle sx={{ textAlign: "center", fontWeight: "bold" }}>
        Share Link Duration
      </DialogTitle>
      <DialogContent onClick={(e) => e.stopPropagation()}>
        <Box sx={{ textAlign: "center", mb: 2 }}>
          <Typography variant="body1" gutterBottom>
            Select the duration (in hours)
          </Typography>
        </Box>

        <Box sx={{ px: 2, py: 1 }}>
          <Slider
            value={typeof duration === "number" ? duration : 0}
            onChange={handleSliderChange}
            step={1}
            min={1}
            max={72}
            valueLabelDisplay="auto"
            marks={[
              { value: 1, label: "1h" },
              { value: 24, label: "24h" },
              { value: 72, label: "72h" },
            ]}
            sx={{
              mb: 2,
            }}
          />
          <TextField
            label="Duration (hours)"
            type="number"
            value={duration}
            onChange={handleTextFieldChange}
            fullWidth
            size="small"
            sx={{
              mb: 1,
            }}
            inputProps={{
              min: 1,
              max: 72,
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions
        sx={{ justifyContent: "space-between", padding: "0 24px 16px 24px" }}
      >
        <Button
          onClick={handleCancel}
          variant="contained"
          color="secondary"
          disabled={isSharing}
          size="small"
        >
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="primary"
          disabled={isSharing}
          size="small"
        >
          Share
        </Button>
      </DialogActions>
    </StyledDialog>
  );
}
