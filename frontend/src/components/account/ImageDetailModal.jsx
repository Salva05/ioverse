import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
  Tooltip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Share as ShareIcon, Lock as LockIcon } from "@mui/icons-material";

// Mapping objects based on pretty formatting
const MODEL_USED_MAP = {
  "dall-e-2": "DALL-E 2",
  "dall-e-3": "DALL-E 3",
};

const QUALITY_MAP = {
  standard: "Standard",
  hd: "HD",
};

const RESPONSE_FORMAT_MAP = {
  url: "URL",
  b64_json: "Base64 JSON",
};

const SIZE_MAP = {
  "256x256": "256x256",
  "512x512": "512x512",
  "1024x1024": "1024x1024",
  "1792x1024": "1792x1024",
  "1024x1792": "1024x1792",
};

const STYLE_MAP = {
  vivid: "Vivid",
  natural: "Natural",
};

const ImageDetailModal = ({ open, handleClose, image }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const imageSrc =
    image.image_url || image.image_file || "/static/images/placeholder.png";

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = "/static/images/placeholder.png";
  };

  // Function to map raw values to display labels
  const getDisplayValue = (field, value) => {
    switch (field) {
      case "model_used":
        return MODEL_USED_MAP[value] || value || "N/A";
      case "quality":
        return QUALITY_MAP[value] || "N/A";
      case "response_format":
        return RESPONSE_FORMAT_MAP[value] || value || "N/A";
      case "size":
        return SIZE_MAP[value] || value || "N/A";
      case "style":
        return STYLE_MAP[value] || "N/A";
      default:
        return value || "N/A";
    }
  };

  const infoItems = [
    { label: "Prompt", value: image.prompt },
    {
      label: "Response Format",
      value: getDisplayValue("response_format", image.response_format),
    },
    {
      label: "Is Shared",
      value: image.is_shared ? "Shared" : "Private",
      icon: image.is_shared ? (
        <ShareIcon color="action" />
      ) : (
        <LockIcon color="action" />
      ),
      tooltip: image.is_shared ? "Shared" : "Private",
    },
    { label: "Size", value: getDisplayValue("size", image.size) },
    { label: "Style", value: getDisplayValue("style", image.style) },
    { label: "Quality", value: getDisplayValue("quality", image.quality) },
    {
      label: "Generated At",
      value: new Date(image.created_at).toLocaleString(),
    },
    {
      label: "Model Used",
      value: getDisplayValue("model_used", image.model_used),
    },
  ];

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="md"
      fullScreen={fullScreen}
      aria-labelledby="image-detail-dialog-title"
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle
        id="image-detail-dialog-title"
        sx={{
          textAlign: "center",
          fontWeight: 600,
        }}
      >
        Image Details
      </DialogTitle>
      <DialogContent dividers sx={{ paddingBottom: 15 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 4,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Image Section */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              p: 2,
              backgroundColor: theme.palette.background.default,
              borderRadius: 2,
              boxShadow: 3,
            }}
          >
            <img
              src={imageSrc}
              alt={image.prompt}
              style={{
                maxWidth: "100%",
                maxHeight: "400px",
                borderRadius: 8,
                objectFit: "cover",
              }}
              onError={handleImageError}
            />
          </Box>

          {/* Information Section */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: 2,
              maxHeight: fullScreen ? "60vh" : "auto",
            }}
          >
            {infoItems.map((item, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  padding: 1,
                  borderRadius: 1,
                  backgroundColor:
                    theme.palette.mode === "light"
                      ? theme.palette.grey[100]
                      : theme.palette.grey[800],
                }}
              >
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{ minWidth: 130, fontWeight: 600 }}
                >
                  {item.label}:
                </Typography>
                {item.icon ? (
                  <Box sx={{ display: "flex", alignItems: "center", ml: 1 }}>
                    <Tooltip title={item.tooltip}>{item.icon}</Tooltip>
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      {item.value}
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    {item.value}
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions
        sx={{
          padding: 2,
          justifyContent: "center",
        }}
      >
        <Button
          onClick={handleClose}
          variant="contained"
          color="primary"
          sx={{
            borderRadius: "5px",
            paddingX: 4,
            paddingY: 1.2,
            fontSize: "1rem",
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImageDetailModal;
