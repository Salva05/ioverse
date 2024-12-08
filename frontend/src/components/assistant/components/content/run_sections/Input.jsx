import {
  Box,
  IconButton,
  TextField,
  Button,
  useTheme,
  CircularProgress,
} from "@mui/material";
import React, { useRef, useState } from "react";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import AddIcon from "@mui/icons-material/Add";
import { IoIosImages } from "react-icons/io";
import useInputLogic from "../../../../../hooks/assistant/run_section/useInputLogic";
import Popover from "@mui/material/Popover";
import ImageInputMenu from "../run_components/ImageInputMenu";
import CloseIcon from "@mui/icons-material/Close";

const Input = ({ createThread, createMessage }) => {
  const theme = useTheme();

  // Menu for the type of image to attach
  const [anchorEl, setAnchorEl] = useState(null);

  const handleImageMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleImageMenuClose = () => {
    setAnchorEl(null);
  };

  const isImageMenuOpen = Boolean(anchorEl);

  // Image attachment
  const fileInputRef = useRef(null);
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const {
    textFieldRef,
    isFocused,
    message,
    handleKeyPress,
    handleChange,
    handleBoxClick,
    handleFocusOut,
    handleAddMessage,
    handleFileSelect,
    previewImages,
    handleDeleteImage,
    handleInsertImageFromUrl,
  } = useInputLogic(createThread, createMessage, handleImageMenuClose);

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 0,
        backgroundColor: theme.palette.background.default,
        width: "100%",
        py: 2,
        px: 2,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Box
        onClick={handleBoxClick}
        sx={{
          cursor: "text",
          width: "100%",
          maxWidth: "700px",
          backgroundColor:
            theme.palette.mode === "dark"
              ? theme.palette.background.paper
              : theme.palette.grey[200],
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: "12px",
          padding: "8px",
          display: "flex",
          flexDirection: "column",
          gap: 1,
          transition: "border-color 0.3s ease",
          "&:focus-within": {
            borderColor: isFocused
              ? theme.palette.primary.main
              : theme.palette.divider,
          },
        }}
        onBlur={handleFocusOut}
      >
        {/* Display multiple preview images if available */}
        {previewImages.length > 0 && (
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              marginBottom: "8px",
            }}
          >
            {previewImages.map((image, index) => (
              <Box
                key={image.id}
                sx={{
                  position: "relative",
                  width: "100px",
                  height: "100px",
                  borderRadius: "8px",
                  overflow: "hidden",
                  border: `1px solid ${theme.palette.divider}`,
                }}
              >
                {image.status === "loading" ? (
                  <Box
                    sx={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "rgba(255, 255, 255, 0.5)",
                    }}
                  >
                    <CircularProgress size={24} />
                  </Box>
                ) : image.status === "error" ? (
                  <Box
                    sx={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "rgba(255, 0, 0, 0.2)",
                    }}
                  >
                    <CloseIcon color="error"/>
                  </Box>
                ) : (
                  <Box
                    component="img"
                    src={image.url}
                    alt={`preview-${index}`}
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                )}
                {/* Icon on each preview for manual deletion */}
                <IconButton
                  size="small"
                  onClick={() => {
                    if (image?.data?.id) {
                      handleDeleteImage(index, image?.data?.id, true);
                    } else {
                      handleDeleteImage(index, image?.id, false);
                    }
                  }}
                  sx={{
                    position: "absolute",
                    top: 2,
                    right: 2,
                    backgroundColor: "rgba(0,0,0,0.5)",
                    color: "#fff",
                    padding: "2px",
                    "&:hover": {
                      backgroundColor: "rgba(0,0,0,0.5)",
                    },
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Box>
        )}
        {/* Input Field */}
        <Box>
          <TextField
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyPress}
            inputRef={textFieldRef}
            variant="standard"
            placeholder="Enter your message..."
            fullWidth
            multiline
            slotProps={{
              input: {
                style: {
                  maxHeight: "150px",
                  overflow: "auto",
                },
              },
              root: {
                disableUnderline: true,
              },
            }}
            sx={{
              "& .MuiInputBase-root": {
                paddingX: 1,
                paddingTop: 1,
              },
              "& .MuiInput-underline:before": {
                borderBottom: "none",
              },
              "& .MuiInput-underline:after": {
                borderBottom: "none",
              },
              "& .MuiInput-underline:hover:not(.Mui-disabled):before": {
                borderBottom: "none",
              },
              "& textarea": {
                resize: "none",
              },
            }}
          />
        </Box>

        {/* Buttons below the input field */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 1,
          }}
        >
          {/* Left icons */}
          <Box sx={{ display: "flex", gap: 1, paddingX: 1, paddingBottom: 1 }}>
            <IconButton
              sx={{
                backgroundColor: theme.palette.action.hover,
                borderRadius: "8px",
                height: "30px",
                width: "30px",
              }}
            >
              <AttachFileIcon sx={{ fontSize: "1.3rem" }} />
            </IconButton>

            <IconButton
              onClick={handleImageMenuOpen}
              sx={{
                backgroundColor: theme.palette.action.hover,
                borderRadius: "8px",
                height: "30px",
                width: "30px",
              }}
            >
              <input
                type="file"
                accept=".jpeg,.jpg,.gif,.png"
                style={{ display: "none" }}
                ref={fileInputRef}
                onChange={handleFileSelect}
                multiple
              />
              <Box
                sx={{
                  width: "19px",
                  height: "19px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <IoIosImages />
              </Box>
            </IconButton>
          </Box>

          {/* Right buttons */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              paddingX: 1,
              paddingBottom: 1,
            }}
          >
            <IconButton
              onClick={handleAddMessage}
              sx={{
                backgroundColor: theme.palette.action.hover,
                borderRadius: "8px",
                height: "30px",
                width: "30px",
              }}
            >
              <AddIcon sx={{ fontSize: "1.3rem" }} />
            </IconButton>

            <Button
              variant="contained"
              color="success"
              sx={{
                textTransform: "none",
                borderRadius: "8px",
                height: "30px",
                minWidth: 0,
                width: "50px",
              }}
            >
              Run
            </Button>
          </Box>
        </Box>
      </Box>
      {/* Menu for Image attachment types */}
      <Popover
        open={isImageMenuOpen}
        anchorEl={anchorEl}
        onClose={handleImageMenuClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        <ImageInputMenu
          triggerFileInput={triggerFileInput}
          closeImageMenu={handleImageMenuClose}
          handleInsertImageFromUrl={handleInsertImageFromUrl}
        />
      </Popover>
    </Box>
  );
};

export default Input;
