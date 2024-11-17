import React from "react";
import { Popover, Typography, Link } from "@mui/material";

const FileSearchInfoPopover = ({
  infoOpenedPopover,
  infoPopoverAnchor,
  infoPopoverEnter,
  infoPopoverLeave,
  text,
  link
}) => {
  return (
    <Popover
      id="info-popover"
      open={infoOpenedPopover}
      anchorEl={infoPopoverAnchor.current}
      sx={{
        pointerEvents: "none",
        "& .MuiPaper-root": {
          maxWidth: "270px",
          wordWrap: "break-word",
          borderRadius: "8px",
          padding: "4px 8px",
          p: 1.5,
        },
      }}
      anchorOrigin={{
        vertical: -10,
        horizontal: "center",
      }}
      transformOrigin={{
        vertical: "bottom",
        horizontal: "center",
      }}
      disableRestoreFocus
      aria-hidden={false}
      onMouseEnter={infoPopoverEnter}
      onMouseLeave={infoPopoverLeave}
      slotProps={{ paper: { sx: { pointerEvents: "auto" } } }}
    >
      <Typography
        variant="body2"
        sx={{
          fontSize: "0.77rem",
          wordWrap: "break-word",
          whiteSpace: "normal",
          fontFamily: "'Montserrat', serif",
        }}
      >
        {text}{" "}
        <Link
          href={link}
          target="_blank"
          rel="noopener"
          sx={{
            fontSize: "inherit",
            textDecoration: "none",
            "&:hover": {
              textDecoration: "underline",
            },
          }}
        >
          Learn more.
        </Link>
      </Typography>
    </Popover>
  );
};

export default FileSearchInfoPopover;
