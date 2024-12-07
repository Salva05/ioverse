import { Box, CircularProgress, useTheme } from "@mui/material";
import React, { useState, useEffect } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { fileImage } from "../../../../../api/assistant";

// Separate component for rendering images
const ImageRenderer = ({ type, id, url, isUser, isSmallScreen }) => {
  const theme = useTheme();
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(type === "image_file");
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true; // To avoid setting state if the component is unmounted

    const fetchImage = async () => {
      try {
        if (type === "image_url") {
          setImageUrl(url);
          setLoading(false);
        } else if (type === "image_file") {
          const fetchedUrl = await fileImage.get(id);
          if (isMounted) {
            if (fetchedUrl) {
              setImageUrl(fetchedUrl.image_file);
            } else {
              setError(true);
            }
            setLoading(false);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(true);
          setLoading(false);
        }
      }
    };

    fetchImage();

    return () => {
      isMounted = false;
    };
  }, [type, id, url]);

  if (loading) {
    return (
      <Box
        sx={{
          position: "relative",
          width: isSmallScreen ? "80%" : "200px",
          maxWidth: "100%",
          height: isSmallScreen ? "auto" : "15 0px",
          marginTop: 1,
          borderRadius: "8px",
          overflow: "hidden",
          border: `1px solid ${isUser ? "primary.main" : "secondary.main"}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f0f0f0",
        }}
      >
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (error || !imageUrl) {
    return (
      <Box
        sx={{
          position: "relative",
          width: isSmallScreen ? "150px" : "200px",
          maxWidth: "100%",
          height: isSmallScreen ? "100px" : "150px",
          borderRadius: "8px",
          overflow: "hidden",
          marginBottom: 1,
          border: `1px solid ${isUser ? "primary.main" : "secondary.main"}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(255, 0, 0, 0.2)",
        }}
      >
        <CloseIcon color="error" />
      </Box>
    );
  }

  return (
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
        backgroundColor: theme.palette.mode === "dark" ? "#f0f0f0" : "#424242"
      }}
    />
  );
};

export default ImageRenderer;
