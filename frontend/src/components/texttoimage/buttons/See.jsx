// See.jsx
import React, { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import PropTypes from "prop-types";
import { dataURLtoBlob } from "../../../utils/dataURLtoBlob";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";

const modalStyle = {
  position: "fixed",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "transparent",
  boxShadow: 24,
  outline: "none",
  borderRadius: "0",
};

const See = ({ src }) => {
  const [href, setHref] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let blobUrl = null;

    if (src.startsWith("data:image/")) {
      const blob = dataURLtoBlob(src);
      if (blob) {
        blobUrl = URL.createObjectURL(blob);
        setHref(blobUrl);
      }
    } else {
      setHref(src);
    }

    // Cleanup the Blob URL when the component unmounts or src changes
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [src]);

  if (href === null) {
    return null;
  }

  if (!href) {
    console.error("No valid source provided for the image.");
    return null;
  }

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      <Tooltip placement="top" title="See">
        <Button
          onClick={handleOpen}
          aria-label="See Image"
          sx={{
            textTransform: "none",
            padding: "6px",
          }}
        >
          <RemoveRedEyeOutlinedIcon fontSize="small" />
        </Button>
      </Tooltip>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="image-modal"
        aria-describedby="modal-to-display-image"
      >
        <Box sx={modalStyle}>
          <img
            src={href}
            alt="Preview"
            style={{
              width: "auto",
              height: "auto",
              maxWidth: "100vw",
              maxHeight: "90vh",
              display: "block",
              margin: "0 auto",
            }}
          />
        </Box>
      </Modal>
    </>
  );
};

See.propTypes = {
  src: PropTypes.string.isRequired,
};

export default See;
