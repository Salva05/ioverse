import { Modal, Box, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const FullscreenImageModal = ({ open, handleClose, image }) => {
  if (!image) return null;

  const imageSrc =
    image.image_url || image.image_file || "/static/images/placeholder.png";

    const handleClickOutside = (event) => {
        // Check if the click is outside the inner Box
        if (event.target.id === "outer-box") {
          handleClose();
        }
      };
      
  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="fullscreen-image-modal"
      aria-describedby="Displays the image in fullscreen mode"
      closeAfterTransition
      slotProps={{
        backdrop: {
          timeout: 500,
          style: {
            backgroundColor: "rgba(0, 0, 0, 0.85)",
          },
        },
      }}
    >
      {/* Outer Box with Flexbox to Center Content */}
      <Box
        id="outer-box"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          width: "100vw",
          outline: "none",
        }}
        onClick={handleClickOutside}
      >
        {/* Inner Box to Contain Image and Close Button */}
        <Box
          sx={{
            position: "relative",
            maxWidth: "90vw",
            maxHeight: "90vh",
          }}
        >
          {/* Close Button */}
          <IconButton
            onClick={handleClose}
            sx={{
              position: "absolute",
              top: -45,
              right: -5,
              color: "white",
              backgroundColor: "rgba(0,0,0,0.5)",
              zIndex: 1,
              '&:hover': {
                backgroundColor: "rgba(0,0,0,0.7)",
              },
            }}
          >
            <CloseIcon />
          </IconButton>

          {/* Image */}
          <Box
            component="img"
            src={imageSrc}
            alt={image.prompt}
            sx={{
              display: "block",
              maxWidth: "100%",
              maxHeight: "100%",
              width: "auto",
              height: "auto",
              objectFit: "contain",
              boxShadow: 24,
              borderRadius: 2,
            }}
            onError={(e) => {
              e.target.src = "/static/images/placeholder.png";
            }}
          />
        </Box>
      </Box>
    </Modal>
  );
};

export default FullscreenImageModal;
