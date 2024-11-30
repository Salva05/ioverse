import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  IconButton,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import Slider from "../../../../Slider";
import HistoryIcon from "@mui/icons-material/History";
import InfoPopover from "./InfoPopover";
import { useAssistantContext } from "../../../../../contexts/AssistantContext";
import { useUpdateAssistant } from "../../../../../hooks/assistant/useUpdateAssistant";

const MIN_VALUE = 0.01;
const MAX_VALUE = 1.0;

const TopP = () => {
  const theme = useTheme();

  const { assistant } = useAssistantContext();
  const { mutate } = useUpdateAssistant();

  const DEFAULT_VALUE = () => assistant?.top_p || 1.0;

  // Hold the firstly computed top_p
  const historyValueRef = useRef(null);
  useEffect(() => {
    if (historyValueRef.current === null && assistant?.top_p !== undefined) {
      historyValueRef.current = assistant.top_p;
    }
  }, [assistant]);

  const [sliderValue, setSliderValue] = useState(DEFAULT_VALUE());
  const [inputValue, setInputValue] = useState(DEFAULT_VALUE().toFixed(2));
  const [isSliderHovered, setIsSliderHovered] = useState(false);
  const [isTextFieldHovered, setIsTextFieldHovered] = useState(false);
  const [isTextFieldFocused, setIsTextFieldFocused] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  useEffect(() => {
    const updatedValue = DEFAULT_VALUE();
    setSliderValue(updatedValue);
    setInputValue(updatedValue.toFixed(2));
  }, [assistant]);

  // Info Popover State
  const infoPopoverAnchor = useRef(null);
  const [infoOpenedPopover, setOpenedInfoPopover] = useState(false);

  // Info popover states
  const infoPopoverEnter = () => {
    setOpenedInfoPopover(true);
  };
  const infoPopoverLeave = () => {
    setOpenedInfoPopover(false);
  };

  const handleSliderChange = (event, newValue) => {
    setSliderValue(newValue);
    setInputValue(newValue.toFixed(2));
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
    handleMutate(inputValue);
  };

  // Determine if borders should be shown
  const showBorders =
    isSliderHovered || isTextFieldHovered || isPressed || isTextFieldFocused;

  // Handle TextField Change
  const handleTextFieldChange = (e) => {
    const value = e.target.value;
    // Allow empty string or valid number with up to two decimal places
    if (
      value === "" ||
      (/^\d*\.?\d{0,2}$/.test(value) && Number(value) <= MAX_VALUE)
    ) {
      setInputValue(value);
      if (value === "") {
        setSliderValue(MIN_VALUE);
      } else {
        const numericValue = Number(value);
        setSliderValue(numericValue);
      }
    }
  };

  // Validate input and update sliderValue
  const validateAndSetValue = (value) => {
    if (value === "") {
      setInputValue(sliderValue.toFixed(2));
      return;
    }

    let parsedValue = parseFloat(value);
    if (isNaN(parsedValue)) {
      setInputValue(sliderValue.toFixed(2));
      return;
    }

    parsedValue = Math.min(Math.max(parsedValue, MIN_VALUE), MAX_VALUE);

    setSliderValue(parsedValue);
    setInputValue(parsedValue.toFixed(2));
    return parsedValue;
  };

  // Calculate the dynamic width based on inputValue length
  const calculateWidth = () => {
    const length = inputValue.length > 0 ? inputValue.length : 1;
    return `${length + 1}ch`;
  };

  const handleSliderChangeCommitted = (event, newValue) => {
    handleMutate(newValue);
  };

  // Logic for performing the update and commit changes
  const handleMutate = (value) => {
    const validatedValue = validateAndSetValue(value);

    if (validatedValue === DEFAULT_VALUE()) return;

    // Update assistant state with the new value
    const updatedAssistant = {
      ...assistant,
      top_p: validatedValue,
    };

    mutate({
      id: assistant.id,
      assistantData: updatedAssistant,
      customOnError: (error) => {
        const defaultVal = DEFAULT_VALUE();
        setSliderValue(defaultVal);
        setInputValue(defaultVal.toString());
        const errorMessage =
          error.response?.data?.message ||
          "Failed to update assistant. Please try again later.";
        toast.error(`Error: ${errorMessage}`);
      },
    });
  };

  const handleReset = () => {
    setSliderValue(historyValueRef.current);
    setInputValue(historyValueRef.current.toFixed(2));
    handleMutate(historyValueRef.current);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          width: "100%",
        }}
      >
        <Box sx={{ flexGrow: 1 }} />
        <Typography
          ref={infoPopoverAnchor}
          onMouseEnter={infoPopoverEnter}
          onMouseLeave={infoPopoverLeave}
          variant="body1"
          sx={{
            fontFamily: "'Montserrat', serif",
            textAlign: "center",
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          Top P
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <IconButton
          onClick={handleReset}
          sx={{
            visibility: sliderValue !== historyValueRef.current ? "visible" : "hidden",
            transition: "visibility 0.5s, opacity 0.4s",
            opacity: sliderValue !== historyValueRef.current ? 1 : 0,
          }}
          aria-label="Reset to default"
        >
          <HistoryIcon fontSize="small" />
        </IconButton>
        <TextField
          value={inputValue}
          onChange={handleTextFieldChange}
          onBlur={handleTextFieldBlur}
          variant="outlined"
          type="text"
          onMouseEnter={handleTextFieldMouseEnter}
          onMouseLeave={handleTextFieldMouseLeave}
          onFocus={handleTextFieldFocus}
          inputProps={{
            style: {
              textAlign: "center",
              padding: "0",
              paddingTop: 0,
              fontSize: "inherit",
            },
          }}
          sx={{
            width: calculateWidth(),
            minWidth: "auto",
            flexShrink: 0,
            "& .MuiOutlinedInput-root": {
              padding: "0",
              "& fieldset": {
                border: showBorders
                  ? `1px solid ${theme.palette.grey[500]}`
                  : "1px solid transparent",
                transition: "border-color 0.4s ease, border-width 0.2s ease",
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
      <Box
        sx={{ px: 0.5, display: "flex", alignItems: "center" }}
        onMouseEnter={handleSliderMouseEnter}
        onMouseLeave={handleSliderMouseLeave}
        onMouseDown={handleSliderMouseDown}
        onTouchStart={handleSliderTouchStart}
      >
        <Slider
          value={sliderValue}
          onChange={handleSliderChange}
          handleChangeCommitted={handleSliderChangeCommitted}
          min={MIN_VALUE}
          max={MAX_VALUE}
          step={0.01}
          onMouseDown={handleSliderMouseDown}
          onMouseUp={handleGlobalMouseUp}
          onMouseLeave={handleSliderMouseLeave}
          onTouchStart={handleSliderTouchStart}
          onTouchEnd={handleGlobalTouchEnd}
        />
      </Box>

      {/* Info Popover */}
      <InfoPopover
        infoOpenedPopover={infoOpenedPopover}
        infoPopoverAnchor={infoPopoverAnchor}
        infoPopoverEnter={infoPopoverEnter}
        infoPopoverLeave={infoPopoverLeave}
        text="Controls randomness: Lowering results in less random completions.
        As the temperature approaches zero, the model will become
        deterministic and repetitive."
        link="https://community.openai.com/t/cheat-sheet-mastering-temperature-and-top-p-in-chatgpt-api/172683"
      />
    </Box>
  );
};

export default TopP;
