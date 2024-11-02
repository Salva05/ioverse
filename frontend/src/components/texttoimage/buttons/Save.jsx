import React, { useEffect, useState } from "react";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import Snackbar from "@mui/material/Snackbar";
import { styled } from "@mui/material/styles";
import { imageService } from "../../../services/imageService";
import { useQueryClient } from "@tanstack/react-query";

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

const Save = ({ payload, src, imageId, setImageId }) => {
  const [showExplosion, setShowExplosion] = useState(false);
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    setIsSaved(false);
    setShowExplosion(false);
    setIsSnackbarOpen(false);
  }, [src]);

  const handleClick = async () => {
    const newIsSaved = !isSaved;

    // the state of 'newIsSaved' will drive the backend call
    if (newIsSaved) {
      const response = await imageService.saveImage(payload, src);
      // refetch the query for the images in the Account
      queryClient.invalidateQueries(["generatedImages"]);
      setImageId(response.id);  // For eventual removal or to share
    } else {
      const response = await imageService.deleteImage(imageId);
      setImageId(null);
    }

    setIsSaved(newIsSaved);

    if (newIsSaved) {
      // Show explosion when saving
      setShowExplosion(true);
      
      // Explosion effect duration
      setTimeout(() => setShowExplosion(false), 300);
    }
    setIsSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setIsSnackbarOpen(false);
  };

  return (
    <>
      <Tooltip placement="top" title={isSaved ? "Discard" : "Save"}>
        <Button onClick={handleClick}>
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
        message={isSaved ? "Saved" : "Removed"}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      />
    </>
  );
};

export default Save;
