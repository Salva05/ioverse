import { Box, IconButton, TextField, Button, useTheme } from "@mui/material";
import React, { useRef, useState } from "react";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import AddIcon from "@mui/icons-material/Add";
import { IoIosImages } from "react-icons/io";

const Input = () => {
  const theme = useTheme();
  const textFieldRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);

  const handleBoxClick = (event) => {
    const target = event.target;
    if (target.closest(".MuiIconButton-root") || target.closest("button")) {
      return;
    }
    if (textFieldRef.current) {
      textFieldRef.current.focus();
      setIsFocused(true);
    }
  };
  const handleFocusOut = () => {
    setIsFocused(false);
  };
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
        {/* Input Field */}
        <Box>
          <TextField
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
              sx={{
                backgroundColor: theme.palette.action.hover,
                borderRadius: "8px",
                height: "30px",
                width: "30px",
              }}
            >
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
    </Box>
  );
};

export default Input;
