import React, { useState, useEffect } from "react";
import {
  Box,
  Link,
  Popover,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import Slider from "../../../../Slider";

const FileSearchPopover = ({
  settingsAnchorEl,
  settingsOpen,
  settingsPopoverClose,
}) => {
  const theme = useTheme();

  const [sliderValue, setSliderValue] = useState(20);
  const [isSliderHovered, setIsSliderHovered] = useState(false);
  const [isTextFieldHovered, setIsTextFieldHovered] = useState(false);
  const [isTextFieldFocused, setIsTextFieldFocused] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const handleSliderChange = (event, newValue) => {
    setSliderValue(newValue);
  };

  // Handle Slider Hover
  const handleSliderMouseEnter = () => {
    setIsSliderHovered(true);
  };
  const handleSliderMouseLeave = () => {
    setIsSliderHovered(false);
  };

  // Handle Slider Press (Mouse)
  const handleSliderMouseDown = () => {
    setIsPressed(true);
    document.addEventListener("mouseup", handleGlobalMouseUp);
  };
  const handleGlobalMouseUp = () => {
    setIsPressed(false);
    document.removeEventListener("mouseup", handleGlobalMouseUp);
  };

  // Handle Slider Press (Touch)
  const handleSliderTouchStart = () => {
    setIsPressed(true);
    document.addEventListener("touchend", handleGlobalTouchEnd);
  };
  const handleGlobalTouchEnd = () => {
    setIsPressed(false);
    document.removeEventListener("touchend", handleGlobalTouchEnd);
  };

  const handleTextFieldMouseEnter = () => {
    setIsTextFieldHovered(true);
  };
  const handleTextFieldMouseLeave = () => {
    setIsTextFieldHovered(false);
  };
  const handleTextFieldFocus = () => {
    setIsTextFieldFocused(true);
  };
  const handleTextFieldBlur = () => {
    setIsTextFieldFocused(false);
    if (sliderValue < 1) {
      setSliderValue(1);
    } else if (sliderValue > 50) {
      setSliderValue(50);
    }
  };

  // Determine if borders should be shown
  const showBorders =
    isSliderHovered || isTextFieldHovered || isPressed || isTextFieldFocused;

  // Reset border-related states when settings popover closes
  useEffect(() => {
    if (!settingsOpen) {
      setIsSliderHovered(false);
      setIsTextFieldHovered(false);
      setIsPressed(false);
      setIsTextFieldFocused(false);
    }
  }, [settingsOpen]);

  // Handle TextField Change with Validation
  const handleTextFieldChange = (e) => {
    const inputValue = Number(e.target.value);
    if (inputValue >= 1 && inputValue <= 50) {
      setSliderValue(inputValue);
    }
  };

  return (
    <Popover
      id="settings-popover"
      open={settingsOpen}
      anchorEl={settingsAnchorEl}
      onClose={settingsPopoverClose}
      sx={{
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
    >
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        {/* Row with Slider Label and Value */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography
            variant="body2"
            sx={{
              fontSize: "0.85rem",
              wordWrap: "break-word",
              whiteSpace: "normal",
            }}
          >
            Max num results
          </Typography>
          <TextField
            value={sliderValue}
            onChange={handleTextFieldChange}
            onBlur={handleTextFieldBlur}
            variant="outlined"
            size="small"
            type="text"
            onMouseEnter={handleTextFieldMouseEnter}
            onMouseLeave={handleTextFieldMouseLeave}
            onFocus={handleTextFieldFocus}
            inputProps={{
              min: 1,
              max: 50,
              style: {
                textAlign: "center",
                padding: "0",
                paddingTop: 1.6,
                fontSize: "0.85rem",
              },
            }}
            sx={{
              width: `${Math.max(String(sliderValue).length + 1, 2)}ch`, // Width grows based on number of characters
              "& .MuiOutlinedInput-root": {
                padding: "0",
                "& fieldset": {
                  border: showBorders
                    ? `1px solid ${theme.palette.grey[500]}`
                    : "none",
                  transition: "border 0.2s",
                },
                "&:hover fieldset": {
                  border: `1px solid ${theme.palette.grey[500]}`,
                },
                "&.Mui-focused fieldset": {
                  border: `1px solid ${theme.palette.grey[500]}`,
                },
              },
            }}
          />
        </Box>

        {/* Slider Row */}
        <Box
          sx={{ px: 0.4, pr: 0.6, display: "flex", alignItems: "center" }}
          onMouseEnter={handleSliderMouseEnter}
          onMouseLeave={handleSliderMouseLeave}
          onMouseDown={handleSliderMouseDown}
          onTouchStart={handleSliderTouchStart}
        >
          <Slider
            value={sliderValue}
            onChange={handleSliderChange}
            min={1}
            max={50}
            onMouseDown={handleSliderMouseDown}
            onMouseUp={handleGlobalMouseUp}
            onMouseLeave={handleSliderMouseLeave}
            onTouchStart={handleSliderTouchStart}
            onTouchEnd={handleGlobalTouchEnd}
          />
        </Box>

        {/* Additional Info */}
        <Typography
          variant="body2"
          sx={{
            fontSize: "0.76rem",
            color: theme.palette.text.secondary,
            marginTop: 1,
          }}
        >
          Defaults to 5 for gpt-3.5-turbo and 20 for gpt-4 models.{" "}
          <Link
            href="https://platform.openai.com/docs/assistants/tools/file-search"
            target="_blank"
            rel="noopener"
            sx={{
              fontSize: "inherit",
              textDecoration: "none",
              color: theme.palette.primary.main,
              "&:hover": {
                textDecoration: "underline",
              },
            }}
          >
            Learn more.
          </Link>
        </Typography>
      </Box>
    </Popover>
  );
};

export default FileSearchPopover;
