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
  Fade,
} from "@mui/material";
import { styled } from "@mui/system";

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
  backgroundColor: theme.palette.primary.main,
  "&:hover": {
    backgroundColor: theme.palette.primary.dark,
  },
}));

const StyledCancelButton = styled(Button)(({ theme }) => ({
  color: "#ffffff",
  borderColor: "#ffffff",
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
}));

export default function ShareDialog({ state, setOpenState, setUnshareDialogOpen }) {
  const [duration, setDuration] = useState(24);
  const [isSharing, setIsSharing] = useState(false);
  
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
    setOpenState(false)
  };

  const handleConfirm = (event) => {
    if (event) {
      event.stopPropagation();
    }
    
    // ...
    setUnshareDialogOpen(true);
    setOpenState(false);
    console.log("mock action..");
  };

  return (
    <StyledDialog
      open={state}
      onClose={handleCancel}
      TransitionComponent={Transition}
      maxWidth="xs"
      fullWidth
      onClick={(e) => e.stopPropagation()}
    >
      <Backdrop
        open={isSharing}
        sx={{ position: "absolute", zIndex: 1301, color: "#fff" }}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <DialogTitle
        sx={{ textAlign: "center", fontWeight: "bold", color: "#ffffff" }}
      >
        Share Link Duration
      </DialogTitle>
      <DialogContent onClick={(e) => e.stopPropagation()}>
        <Box sx={{ textAlign: "center", mb: 2 }}>
          <Typography variant="body1" gutterBottom sx={{ color: "#e0e0e0" }}>
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
              color: "#ffffff",
              ".MuiSlider-markLabel": {
                color: "#e0e0e0",
              },
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
              input: { color: "#ffffff" },
              label: { color: "#e0e0e0" },
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "#e0e0e0",
                },
                "&:hover fieldset": {
                  borderColor: "#ffffff",
                },
              },
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
        <StyledCancelButton
          onClick={handleCancel}
          variant="outlined"
          disabled={isSharing}
        >
          Cancel
        </StyledCancelButton>
        <StyledButton
          onClick={handleConfirm}
          variant="contained"
          disabled={isSharing}
        >
          Share
        </StyledButton>
      </DialogActions>
    </StyledDialog>
  );
}
