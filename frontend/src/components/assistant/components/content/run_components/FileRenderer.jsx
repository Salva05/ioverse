import React, { useState } from "react";
import { Box, Typography, useTheme, Popover } from "@mui/material";
import InsertDriveFileOutlined from "@mui/icons-material/InsertDriveFileOutlined";
import UploadedFileMenu from "./UploadedFileMenu";
import { GoXCircle } from "react-icons/go";

const FileRenderer = ({ fileId, fileName, isUser, toolType, isDeleted }) => {
  const theme = useTheme();

  // Menu for file attached
  const [fileMenu, setFileMenu] = useState(null);
  const handleOpen = (event) => {
    setFileMenu(event.currentTarget);
  };
  const handleClose = () => {
    if (document.activeElement) {
      document.activeElement.blur();
    }
    setFileMenu(null);
  };

  return (
    <Box
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
          onClick={isDeleted ? undefined : handleOpen}
          className="hover-text"
          sx={{
            cursor: isDeleted ? "default" : "pointer",
            fontFamily: "'Montserrat', serif",
            fontSize: "0.85rem",
            color: isDeleted ? theme.palette.error.light : "text.secondary",
            padding: "2px 8px",
            borderRadius: 2,
            transition: "background-color 0.3s, border 0.3s",
          }}
        >
          {isDeleted ? "file deleted" : fileName}
        </Typography>
      )}
      {isDeleted ? (
        <GoXCircle
          size={20}
          color={theme.palette.error.light}
          style={{ marginRight: 2.8 }}
        />
      ) : (
        <InsertDriveFileOutlined
          onClick={isDeleted ? undefined : handleOpen}
          sx={{
            cursor: isDeleted ? "default" : "pointer",
            padding: "4px",
            border: "1px solid",
            borderColor: (theme) => theme.palette.divider,
            backgroundColor: (theme) => theme.palette.action.hover,
            borderRadius: 2,
            minWidth: "24px",
            minHeight: "24px",
          }}
        />
      )}
      {!isUser && (
        <Typography
          onClick={isDeleted ? undefined : handleOpen}
          className="hover-text"
          sx={{
            cursor: isDeleted ? "default" : "pointer",
            fontFamily: "'Montserrat', serif",
            fontSize: "0.85rem",
            color: isDeleted ? theme.palette.error.light : "text.secondary",
            padding: "2px 8px",
            borderRadius: 2,
            transition: "background-color 0.3s, border 0.3s",
          }}
        >
          {isDeleted ? "file deleted" : fileName}
        </Typography>
      )}

      {/* File details menu */}
      <Popover
        open={Boolean(fileMenu)}
        anchorEl={fileMenu}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        disableRestoreFocus
      >
        <UploadedFileMenu
          id={fileId}
          handleClose={handleClose}
          currentType={toolType}
          isSent={true}
        />
      </Popover>
    </Box>
  );
};

export default FileRenderer;
