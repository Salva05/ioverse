import {
  Box,
  CircularProgress,
  Modal,
  Typography,
  useTheme,
} from "@mui/material";
import React, { useState, useEffect, useContext } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { fileContent } from "../../../../../api/assistant";
import DownloadIcon from "@mui/icons-material/Download";
import { truncateText } from "../../../../../utils/textUtils";

function extractFilename(url) {
  // Split the string by '/' and get the last part
  return url.split("/").pop();
}

// Separate component for rendering images
const ImageRenderer = ({ type, id, url, isUser, isSmallScreen }) => {
  const theme = useTheme();
  const [imageUrl, setImageUrl] = useState(null);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(type === "image_file");
  const [error, setError] = useState(false);
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  useEffect(() => {
    let isMounted = true; // To avoid setting state if the component is unmounted

    const fetchImage = async () => {
      try {
        if (type === "image_url") {
          // Check if the url is still a valid image (eg. OpenAI's generated images via URL option have a default of 60 min expiring time)
          const img = new Image();
          img.onload = () => {
            if (isMounted) {
              setImageUrl(url);
              setLoading(false);
              setFileName(extractFilename(url));
            }
          };
          img.onerror = () => {
            if (isMounted) {
              setError(true);
              setLoading(false);
            }
          };
          img.src = url;
        } else if (type === "image_file") {
          if (isMounted) setLoading(true);
          const fetchedUrl = await fileContent.getImage(id);
          if (isMounted) {
            setLoading(false);
            if (fetchedUrl) {
              setImageUrl(fetchedUrl.image_file);
              setFileName(extractFilename(fetchedUrl.image_file));
            } else {
              setError(true);
            }
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

  const handleDownload = async () => {
    try {
      const response = await fetch(imageUrl, { mode: "cors" });
      if (!response.ok) {
        throw new Error("Failed to fetch image");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = imageUrl ? extractFilename(imageUrl) : "image.png"; // Set the desired filename
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Release the object URL after download
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading the image:", error);
    }
  };
  if (loading) {
    return (
      <Box
        sx={{
          position: "relative",
          width: isSmallScreen ? "150px" : "200px",
          maxWidth: "100%",
          height: isSmallScreen ? "100px" : "150px",
          marginTop: 1,
          borderRadius: "8px",
          overflow: "hidden",
          border: `1px solid ${isUser ? "primary.main" : "secondary.main"}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor:
            theme.palette.mode === "dark" ? "#f0f0f0" : "#424242",
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
        <CloseIcon color="error" sx={{ fontSize: 30 }} />
      </Box>
    );
  }

  return (
    <Box>
      <Box
        component="img"
        onClick={handleOpen}
        src={imageUrl}
        alt="Message Image"
        sx={{
          cursor: "pointer",
          width: isSmallScreen ? "150px" : "200px",
          height: isSmallScreen ? "100px" : "150px",
          objectFit: "contain",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          marginBottom: 1,
          backgroundColor:
            theme.palette.mode === "dark" ? "#f0f0f0" : "#424242",
          transition: "transform 0.3s ease",
          "&:hover": {
            transform: "scale(1.05)",
          },
        }}
      />
      <Box
        onClick={handleDownload}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: isUser ? "flex-end" : "flex-start",
          gap: 1,
          borderRadius: 2,
          transition: "background-color 0.3s, border 0.3s",
          "&:hover .hover-text": {
            backgroundColor: (theme) => theme.palette.action.hover,
            border: `1px solid ${(theme) => theme.palette.divider}`,
          },
          marginBottom: 1,
        }}
      >
        {isUser && (
          <Typography
            onClick={() => {}}
            className="hover-text"
            sx={{
              cursor: "pointer",
              fontFamily: "'Montserrat', serif",
              fontSize: "0.85rem",
              color: "text.secondary",
              padding: "2px 8px",
              borderRadius: 2,
              transition: "background-color 0.3s, border 0.3s",
            }}
          >
            {fileName}
          </Typography>
        )}

        <DownloadIcon
          fontSize="small"
          sx={{
            cursor: "pointer",
            padding: "2px",
            border: "1px solid",
            borderColor: (theme) => theme.palette.divider,
            backgroundColor: (theme) => theme.palette.action.hover,
            borderRadius: 2,
            minWidth: "24px",
            minHeight: "24px",
          }}
        />
        {!isUser && (
          <Typography
            onClick={() => {}}
            className="hover-text"
            sx={{
              cursor: "pointer",
              fontFamily: "'Montserrat', serif",
              fontSize: "0.85rem",
              color: "text.secondary",
              padding: "2px 8px",
              borderRadius: 2,
              transition: "background-color 0.3s, border 0.3s",
            }}
          >
            {isSmallScreen
              ? truncateText(fileName, 27)
              : truncateText(fileName, 40)}
          </Typography>
        )}
      </Box>
      {/* Full Screen Image View */}
      <Modal
        onClick={handleClose}
        open={open}
        onClose={handleClose}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box
          component="img"
          src={imageUrl}
          alt="Fullscreen Image"
          sx={{
            width: "100%",
            maxWidth: "90vw",
            height: "100%",
            maxHeight: "90vh",
            objectFit: "contain",
            borderRadius: "8px",
            boxShadow:
              theme.palette.mode === "dark" ? "0 0 15px #fff" : "0 0 15px #000",
          }}
        />
      </Modal>
    </Box>
  );
};

export default ImageRenderer;
