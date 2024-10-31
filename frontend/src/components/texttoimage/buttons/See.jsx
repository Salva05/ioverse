// See.jsx
import React, { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import PropTypes from "prop-types";
import { dataURLtoBlob } from "../../../utils/dataURLtoBlob";

const See = ({ src }) => {
  const [href, setHref] = useState("");

  useEffect(() => {
    let blobUrl = null;

    if (src.startsWith("data:image/")) {
      blobUrl = dataURLtoBlob(src);
      if (blobUrl) {
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

  if (!href) {
    console.error("No valid source provided for the image.");
    return null;
  }

  return (
    <Tooltip placement="top" title="See">
      <Button
        component="a"
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="See Image"
        sx={{
          textTransform: "none",
          padding: "6px",
        }}
      >
        <RemoveRedEyeOutlinedIcon fontSize="small" />
      </Button>
    </Tooltip>
  );
};

See.propTypes = {
  src: PropTypes.string.isRequired,
};

export default See;
