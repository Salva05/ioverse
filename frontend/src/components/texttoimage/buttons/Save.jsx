import React, { useState } from "react";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import Snackbar from "@mui/material/Snackbar";
import { styled } from "@mui/material/styles";
import textToImage from "../../../api/textToImage";
import { toast } from "react-toastify";

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

const Save = ({ payload, src }) => {
  const [showExplosion, setShowExplosion] = useState(false);
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [imageId, setImageId] = useState(0);

  const handleClick = async () => {
    const newIsSaved = !isSaved;

    // the state of 'newIsSaved' will drive the backend call
    if (newIsSaved) {
      // POST
      let imageSrc = src
      if (src.startsWith('data:image')) {
        imageSrc = src.split(',')[1];
      }

      // include the src in the payload
      payload.image_data = imageSrc; // check whether is url or base64

      try {
        const response = await textToImage.createImage(payload);
        setImageId(response.id);  // For eventual removal of the saved image
        console.log("Image saved successfully.");
      } catch (err) {
        console.log("An error occurred while saving the image:", err);
        toast.error(`Error: ${err.response?.statusText || "Request failed"}`);
      }
    } else {
      // DELETE
      try {
        const response = await textToImage.deleteImage(imageId);
        console.log("Image removed successfully.");
      } catch (err) {
        console.log("An error occurred deleting the image:", err);
        toast.error(err);
      }
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
