import React, { useContext, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { DrawerContext } from "../../../../../contexts/DrawerContext";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import isSupportedImageUrl from "../../../../../utils/validateImageFormat";

export default function ImageInputUrlDialog({
  open,
  onClose,
  closeImageMenu,
  handleInsertImageFromUrl,
}) {
  const theme = useTheme();
  const [imageUrl, setImageUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [found, setFound] = useState(false);
  const { isSmallScreen } = useContext(DrawerContext);

  const MIN_LOADING_TIME = 1000;

  const validateImageUrl = (url) => {
    setIsLoading(true);
    setIsError(false);
    setFound(false);

    if (!isSupportedImageUrl(url)) {
      setTimeout(() => {
        setIsLoading(false);
        setIsError(true);
      }, MIN_LOADING_TIME);
      return;
    }

    const startTime = Date.now();

    const img = new Image();
    img.onload = () => {
      const elapsedTime = Date.now() - startTime;
      setTimeout(() => {
        setIsLoading(false);
        setFound(true);
      }, Math.max(0, MIN_LOADING_TIME - elapsedTime));
    };
    img.onerror = () => {
      const elapsedTime = Date.now() - startTime;
      setTimeout(() => {
        setIsLoading(false);
        setIsError(true);
      }, Math.max(0, MIN_LOADING_TIME - elapsedTime));
    };
    img.src = url;
  };

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setImageUrl(url);
    if (url.trim()) {
      validateImageUrl(url);
    } else {
      setIsError(false);
      setFound(false);
    }
  };
  return (
    <Dialog
      onClose={() => {
        closeImageMenu();
        onClose();
      }}
      open={open}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle
        sx={{
          fontFamily: "'Montserrat', serif",
        }}
      >
        Insert Image from URL
      </DialogTitle>
      <DialogContent>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: 2,
            mt: 1,
          }}
        >
          <TextField
            placeholder="Enter image URL"
            type="url"
            value={imageUrl}
            onChange={handleUrlChange}
            variant="outlined"
            size="small"
            sx={{
              width: "100%",
              maxWidth: "400px",
              fontFamily: "'Montserrat', serif",
              "& .MuiInputBase-input::placeholder": {
                fontFamily: "'Montserrat', serif",
                opacity: 0.7,
              },
              "& .MuiOutlinedInput-root": {
                borderRadius: "12px",
              },
            }}
          />
          {isLoading && (
            <Box
              sx={{
                position: "relative",
                width: isSmallScreen ? "150px" : "200px",
                maxWidth: "100%",
                height: isSmallScreen ? "100px" : "150px",
                marginTop: 1,
                borderRadius: "8px",
                overflow: "hidden",
                display: isLoading ? "flex" : "none",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor:
                  theme.palette.mode === "dark" ? "#424242" : "#f0f0f0",
                transition: "opacity 0.5s ease-in-out",
                opacity: isLoading ? 1 : 0,
              }}
            >
              <CircularProgress size={35} />
            </Box>
          )}{" "}
          {isError && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                mt: 1,
              }}
            >
              <ErrorOutlineIcon
                fontSize="small"
                sx={{ color: theme.palette.error.main }}
              />
              <Typography
                sx={{
                  fontFamily: "'Montserrat', serif",
                  fontSize: "0.9rem",
                }}
              >
                Image not found
              </Typography>
            </Box>
          )}
          {found && (
            <Box
              component="img"
              src={imageUrl}
              alt="Message Image"
              sx={{
                width: isSmallScreen ? "150px" : "200px",
                height: isSmallScreen ? "100px" : "150px",
                objectFit: "contain",
                ml: 1,
                borderRadius: "8px",
                backgroundColor:
                  theme.palette.mode === "dark" ? "#f0f0f0" : "#424242",
              }}
            />
          )}
        </Box>
      </DialogContent>
      <DialogActions
        sx={{
          padding: "16px",
          justifyContent: "flex-end",
        }}
      >
        <Button
          onClick={() => {
            closeImageMenu();
            onClose();
          }}
          color="secondary"
          variant="outlined"
          sx={{
            color:
              theme.palette.mode === "dark"
                ? theme.palette.grey[400]
                : theme.palette.text.primary,
            borderColor:
              theme.palette.mode === "dark"
                ? theme.palette.grey[700]
                : theme.palette.grey[300],
            backgroundColor:
              theme.palette.mode === "dark"
                ? theme.palette.grey[700]
                : theme.palette.grey[300],
            "&:hover": {
              borderColor: theme.palette.grey[500],
              backgroundColor: theme.palette.action.hover,
            },
            textTransform: "none",
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={() => {
            handleInsertImageFromUrl(imageUrl);
          }}
          disabled={!found}
          color="primary"
          variant="contained"
          sx={{ fontFamily: "'Montserrat', serif", textTransform: "none" }}
        >
          Insert
        </Button>
      </DialogActions>
    </Dialog>
  );
}
