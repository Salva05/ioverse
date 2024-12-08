import React, { useState } from "react";
import Paper from "@mui/material/Paper";
import MenuList from "@mui/material/MenuList";
import MenuItem from "@mui/material/MenuItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import LinkIcon from "@mui/icons-material/Link";
import { Box, Typography, useTheme } from "@mui/material";
import ImageInputUrlDialog from "./ImageInputUrlDialog";

const ImageInputMenu = ({
  triggerFileInput,
  closeImageMenu,
  handleInsertImageFromUrl,
}) => {
  const theme = useTheme();
  const borderColor =
    theme.palette.mode === "light"
      ? theme.palette.grey[500]
      : theme.palette.divider;

  // State and logic for Image Url insertion dialog
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Paper
      sx={{
        paddingX: 1,
        pb: 0.6,
        border: "1px solid",
        borderColor: borderColor,
      }}
    >
      <MenuList>
        <MenuItem
          onClick={triggerFileInput}
          sx={{
            alignItems: "center",
          }}
        >
          <ListItemIcon>
            <FileUploadIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            sx={{
              "& *": { fontFamily: "'Montserrat', serif", fontSize: "0.9rem" },
            }}
          >
            Upload Image
          </ListItemText>
        </MenuItem>
        <MenuItem onClick={handleClickOpen}>
          <ListItemIcon>
            <LinkIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            sx={{
              "& *": { fontFamily: "'Montserrat', serif", fontSize: "0.9rem" },
            }}
          >
            Link to image
          </ListItemText>
        </MenuItem>
        <Box sx={{ display: "flex", flexDirection: "column", ml: 2 }}>
          <Typography
            sx={{
              fontFamily: "'Montserrat', serif",
              fontSize: "0.85rem",
              color: "text.secondary",
            }}
          >
            Supported formats:
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "row", gap: 0.5 }}>
            {[".jpeg", ".jpg", ".gif", ".png"].map((element, index) => (
              <Typography
                key={index}
                sx={{
                  fontFamily: "'Montserrat', serif",
                  fontSize: "0.8rem",
                  color: "text.secondary",
                }}
              >
                {element}
              </Typography>
            ))}
          </Box>
        </Box>
      </MenuList>
      <ImageInputUrlDialog
        open={open}
        onClose={handleClose}
        closeImageMenu={closeImageMenu}
        handleInsertImageFromUrl={handleInsertImageFromUrl}
      />
    </Paper>
  );
};

export default ImageInputMenu;
