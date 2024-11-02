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
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ShareIcon from "@mui/icons-material/Share";
import FullscreenIcon from "@mui/icons-material/Fullscreen";

const GeneratedImageCard = ({ image, onViewDetails, onViewFullscreen }) => {
  const [isLoading, setIsLoading] = useState(true);

  const handleDelete = () => {
    // Mock delete functionality
    console.log(`Delete image with ID: ${image.id}`);
    // Implement actual delete logic here
  };

  const handleShare = () => {
    // Mock share functionality
    console.log(`Share image with ID: ${image.id}`);
    // Implement actual share logic here
  };

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
          src={image.image_url || image.image_file || "/static/images/placeholder.png"}
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
          <IconButton aria-label="delete" onClick={handleDelete}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Share">
          <IconButton aria-label="share" onClick={handleShare}>
            <ShareIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Fullscreen">
          <IconButton aria-label="fullscreen" onClick={handleFullscreen}>
            <FullscreenIcon />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
};

export default GeneratedImageCard;
