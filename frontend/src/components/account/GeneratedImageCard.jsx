// src/components/account/GeneratedImageCard.jsx
import React, { useState } from "react";
import {
  Card,
  CardMedia,
  CardActions,
  IconButton,
  Tooltip,
  Box,
  Typography,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogActions,
  Button,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import Share from "./Share";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import textToImage from "../../api/textToImage";
import { toast } from "react-toastify";

const GeneratedImageCard = ({ image, onViewDetails, onViewFullscreen }) => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  // Mutation for image deletion
  const deleteMutation = useMutation({
    mutationFn: async () => await textToImage.deleteImage(image.id),
    onSuccess: () => {
      // Update the cached query
      queryClient.setQueryData(["generatedImages"], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          results: oldData.results.filter((img) => img.id !== image.id),
        };
      });
      toast.success("Image deleted successfully!");
    },
    onError: (error) => {
      console.error("Error deleting image:", error);
      const errorMessage =
        error.response?.data?.detail ||
        error.message ||
        "Failed to delete the image. Please try again.";
      toast.error(errorMessage);
    },
  });

  const handleDelete = (e) => {
    e.stopPropagation();
    setConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    deleteMutation.mutate();
    setConfirmOpen(false);
  };

  // Share function is handled internally to the component..

  const handleFullscreen = () => {
    if (onViewFullscreen) {
      onViewFullscreen();
    }
  };

  const handleImageError = (e) => {
    e.target.src = "/static/images/placeholder.png"; // Fallback image
    setIsLoading(false); // Stop loading spinner on error
  };

  const handleImageLoad = () => {
    setIsLoading(false); // Stop loading spinner when image loads
  };

  return (
    <>
      <Card
        sx={{
          width: 256,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          height: "auto",
        }}
      >
        <Box sx={{ position: "relative", height: 256 }}>
          {isLoading && (
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 1,
              }}
            >
              <CircularProgress />
            </Box>
          )}
          <CardMedia
            component="img"
            height="256"
            src={
              image.image_url ||
              image.image_file ||
              "/static/images/placeholder.png"
            }
            alt={image.prompt}
            sx={{
              objectFit: "cover",
              cursor: "pointer",
              display: isLoading ? "none" : "block",
            }}
            onClick={onViewDetails}
            onError={handleImageError}
            onLoad={handleImageLoad}
          />
        </Box>

        {/* Informational Section */}
        <Box sx={{ p: 1 }}>
          <Typography variant="body2" color="text.primary" noWrap>
            {image.prompt}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {new Date(image.created_at).toLocaleDateString()}
          </Typography>
        </Box>

        <CardActions disableSpacing>
          <Tooltip title="Delete">
            <IconButton
              aria-label="delete"
              onClick={handleDelete}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
          <Share image={image} />
          <Tooltip title="Fullscreen">
            <IconButton aria-label="fullscreen" onClick={handleFullscreen}>
              <FullscreenIcon />
            </IconButton>
          </Tooltip>
        </CardActions>
      </Card>
      {/* Confirmation Dialog for Delete */}
      <Dialog
        open={confirmOpen}
        onClose={(e, reason) => {
          if (e) e.stopPropagation();
          setConfirmOpen(false);
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <DialogTitle>Are you sure you want to delete?</DialogTitle>
        <DialogActions>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              setConfirmOpen(false);
            }}
            color="primary"
          >
            Cancel
          </Button>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleConfirmDelete();
            }}
            color="error"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default GeneratedImageCard;
