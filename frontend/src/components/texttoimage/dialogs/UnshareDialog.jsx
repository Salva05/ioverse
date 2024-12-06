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
  Tooltip,
  Fade,
} from "@mui/material";
import { styled } from "@mui/system";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { CopyToClipboard } from "react-copy-to-clipboard";
import ContentCopyTwoToneIcon from "@mui/icons-material/ContentCopyTwoTone";
import unshareImage from "../../../utils/unshareImage";
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

export default function UnshareDialog({
  reset,
  imageId,
  state,
  setOpenState,
  sharedUrl,
  remainingHours,
}) {
  // State to show copy success message
  const [copySuccess, setCopySuccess] = useState(false);

  const handleClose = (event) => {
    event.stopPropagation();
    setOpenState(false);
  };

  const handleConfirm = async (event) => {
    event.stopPropagation();

    try {
      const response = await unshareImage(imageId);
      setOpenState(false);
      reset();
    } catch (error) {
      console.log(error);
      toast.error("Failed to unshare the image. Please try again.");
    }
  };

  return (
    <StyledDialog
      open={state}
      onClose={(e) => handleClose(e)}
      TransitionComponent={Transition}
      maxWidth="xs"
      fullWidth
      onClick={(e) => e.stopPropagation()}
    >
      <DialogTitle
        sx={{
          textAlign: "center",
          fontWeight: "bold",
          fontFamily: "Montserrat, serif",
        }}
      >
        Sharing Details
      </DialogTitle>
      <DialogContent onClick={(e) => e.stopPropagation()}>
        <Box sx={{ textAlign: "center", mb: 2 }}>
          <Typography
            variant="body1"
            gutterBottom
            sx={{ fontFamily: "Montserrat, serif" }}
          >
            This image will be available for the next{" "}
            <Typography
              component="span"
              variant="body1"
              sx={{
                fontWeight: "bold",
                fontSize: "1.2rem",
                fontFamily: "Montserrat, serif",
              }}
            >
              {remainingHours} hour(s)
            </Typography>
            .
          </Typography>
          <Typography
            variant="body2"
            sx={{ mb: 2, fontFamily: "Montserrat, serif" }}
          >
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
              value={sharedUrl}
              fullWidth
              slotProps={{
                input: {
                  readOnly: true,
                  sx: {
                    fontFamily: "Montserrat, serif",
                  },
                },
              }}
              sx={{
                "& .MuiInputBase-root": {
                  fontFamily: "Montserrat, serif",
                },
              }}
              variant="outlined"
              size="small"
            />
            <CopyToClipboard
              text={sharedUrl}
              onCopy={() => {
                setCopySuccess(true);
                setTimeout(() => setCopySuccess(false), 2000);
              }}
            >
              <Tooltip title={copySuccess ? "Copied!" : "Copy to clipboard"}>
                <Button sx={{ ml: 1 }} variant="text">
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
          sx={{ fontFamily: "Montserrat, serif", textTransform: "none" }}
        >
          Close
        </Button>
        <Button
          onClick={(e) => handleConfirm(e)}
          variant="contained"
          color="error"
          size="small"
          sx={{ fontFamily: "Montserrat, serif", textTransform: "none" }}
        >
          Stop Sharing
        </Button>
      </DialogActions>
    </StyledDialog>
  );
}
