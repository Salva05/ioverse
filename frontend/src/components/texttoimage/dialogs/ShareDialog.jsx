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
  Box,
  Fade,
} from "@mui/material";
import { styled } from "@mui/system";
import shareImage from "../../../utils/shareImage";
import { toast } from "react-toastify";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Fade {...props} ref={ref} timeout={600} />;
});

const StyledDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    padding: theme.spacing(2),
    boxShadow: theme.shadows[5],
  },
}));

export default function ShareDialog({
  state,
  setOpenState,
  handleShare,
  imageId,
}) {
  const [duration, setDuration] = useState(24);

  const handleSliderChange = (event, newValue) => {
    setDuration(newValue);
  };

  const handleTextFieldChange = (event) => {
    const value = event.target.value;
    setDuration(value === "" ? "" : Number(value));
  };

  const handleCancel = (event) => {
    event.stopPropagation();
    setOpenState(false);
  };

  const handleConfirm = async (event) => {
    if (event) {
      event.stopPropagation();

      try {
        const response = await shareImage(imageId, duration);
        setOpenState(false);
        handleShare(response.share_url, response.expires_at);
      } catch (error) {
        console.log(error);
        toast.error("Failed to share the image. Please try again.");
      }
    }
  };

  return (
    <StyledDialog
      open={state}
      onClose={(e) => handleCancel}
      TransitionComponent={Transition}
      maxWidth="xs"
      fullWidth
      onClick={(e) => e.stopPropagation()}
    >
      <DialogTitle
        sx={{
          textAlign: "center",
          fontWeight: "bold",
          fontFamily: "'Montserrat', serif",
        }}
      >
        Share Link Duration
      </DialogTitle>
      <DialogContent onClick={(e) => e.stopPropagation()}>
        <Box sx={{ textAlign: "center", mb: 2 }}>
          <Typography
            variant="body1"
            gutterBottom
            sx={{ fontFamily: "'Montserrat', serif" }}
          >
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
              mb: 3,
              "& .MuiSlider-markLabel": {
                fontFamily: "Montserrat, serif",
              },
              "& .MuiSlider-valueLabel": {
                fontFamily: "Montserrat, serif",
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
              "& .MuiInputLabel-root": {
                fontFamily: "Montserrat, serif",
              },
              "& .MuiInputBase-input": {
                fontFamily: "Montserrat, serif",
              },
            }}
            slotProps={{
              input: {
                min: 1,
                max: 72,
              },
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
          size="small"
          sx={{ fontFamily: "Montserrat, serif", textTransform: "none" }}
        >
          Cancel
        </Button>
        <Button
          onClick={(e) => handleConfirm(e)}
          variant="contained"
          color="primary"
          size="small"
          sx={{ fontFamily: "Montserrat, serif", textTransform: "none" }}
        >
          Share
        </Button>
      </DialogActions>
    </StyledDialog>
  );
}
