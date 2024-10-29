import React, { useState } from "react";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import Snackbar from "@mui/material/Snackbar";
import { styled } from "@mui/material/styles";

const Explosion = styled("div")({
  position: "absolute",
  width: "20px",
  height: "20px",
  borderRadius: "50%",
  backgroundColor: "red",
  animation: "explode 0.3s ease-out",
  pointerEvents: "none",
  "@keyframes explode": {
    "0%": { transform: "scale(0.5)", opacity: 1 },
    "100%": { transform: "scale(2)", opacity: 0 },
  },
});

const Save = () => {
  const [showExplosion, setShowExplosion] = useState(false);
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleFavoriteClick = () => {
    const newIsSaved = !isSaved;
    setIsSaved(newIsSaved);

    if (newIsSaved) {
      // Show explosion and Snackbar when saving
      setShowExplosion(true);
      setIsSnackbarOpen(true);

      // Explosion effect duration
      setTimeout(() => setShowExplosion(false), 300);
    }
  };

  const handleSnackbarClose = () => {
    setIsSnackbarOpen(false);
  };

  return (
    <>
      <Tooltip placement="top" title={isSaved ? "Discard" : "Save"}>
        <Button onClick={handleFavoriteClick}>
          {showExplosion && <Explosion />}
          {isSaved ? (
            <FavoriteIcon fontSize="small" color="error" />
          ) : (
            <FavoriteBorderIcon fontSize="small" />
          )}
        </Button>
      </Tooltip>
      <Snackbar
        open={isSnackbarOpen}
        autoHideDuration={1000}
        onClose={handleSnackbarClose}
        message="Saved"
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      />
    </>
  );
};

export default Save;
