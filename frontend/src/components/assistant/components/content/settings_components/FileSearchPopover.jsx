import React, { useState, useEffect } from "react";
import {
  Box,
  IconButton,
  Link,
  Popover,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import Slider from "../../../../Slider";
import { computeModelMaxResultsDefault } from "../../../../../utils/computeModelMaxResulsDefault";
import { useAssistantContext } from "../../../../../contexts/AssistantContext";
import { useUpdateAssistant } from "../../../../../hooks/assistant/useUpdateAssistant";
import HistoryIcon from "@mui/icons-material/History";

const FileSearchPopover = ({
  settingsAnchorEl,
  settingsOpen,
  settingsPopoverClose,
  model,
  switchState,
}) => {
  const { assistant } = useAssistantContext();
  const { mutate } = useUpdateAssistant();

  const theme = useTheme();

  const MIN_VALUE = 1;
  const MAX_VALUE = 50;
  const DEFAULT_VALUE = () => {
    // Check if the assistant and its tools exist
    if (assistant?.tools?.length) {
      const fileSearchTool = assistant.tools.find(
        (tool) => tool.type === "file_search"
      );
      // Check if file search is active and has a max_num_results defined
      if (fileSearchTool?.file_search?.max_num_results) {
        return Math.min(
          Math.max(fileSearchTool.file_search.max_num_results, MIN_VALUE),
          MAX_VALUE
        );
      }
    }
    // Default to model-based computation if no valid file search tool is found
    return computeModelMaxResultsDefault(model);
  };

  const [sliderValue, setSliderValue] = useState(DEFAULT_VALUE);
  const [inputValue, setInputValue] = useState(DEFAULT_VALUE().toString());

  const [isSliderHovered, setIsSliderHovered] = useState(false);
  const [isTextFieldHovered, setIsTextFieldHovered] = useState(false);
  const [isTextFieldFocused, setIsTextFieldFocused] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  // Manage focus state
  const handleTextFieldFocus = () => {
    setIsTextFieldFocused(true);
  };

  useEffect(() => {
    const updatedValue = DEFAULT_VALUE();
    setSliderValue(updatedValue);
    setInputValue(updatedValue.toString());
  }, [model, assistant]);

  const handleSliderChange = (event, newValue) => {
    setSliderValue(newValue);
    setInputValue(newValue.toString());
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
  const handleTextFieldBlur = () => {
    setIsTextFieldFocused(false);
    validateAndSetValue();
  };

  // Logic for performing the update and commit changes
  const handleMutate = () => {
    if (!switchState) return;
    validateAndSetValue();
    const clampedValue = Math.min(Math.max(sliderValue, MIN_VALUE), MAX_VALUE);
    setSliderValue(clampedValue);
    setInputValue(clampedValue.toString());
    if (clampedValue === DEFAULT_VALUE()) return;
    // Update assistant state with the new value
    const updatedAssistant = {
      ...assistant,
      tools: assistant?.tools?.map((tool) =>
        tool.type === "file_search"
          ? {
              ...tool,
              file_search: {
                ...tool.file_search,
                max_num_results: clampedValue,
              },
            }
          : tool
      ),
    };
    mutate(
      { id: assistant.id, assistantData: updatedAssistant },
      {
        onError: () => {
          const defaultVal = DEFAULT_VALUE();
          setSliderValue(defaultVal);
          setInputValue(defaultVal.toString());
        },
      }
    );
  };

  // Determine if borders of TextField should be shown
  const showBorders =
    isSliderHovered || isTextFieldHovered || isPressed || isTextFieldFocused;

  // Reset border-related states when settings popover closes
  useEffect(() => {
    if (!settingsOpen) {
      setIsSliderHovered(false);
      setIsTextFieldHovered(false);
      setIsPressed(false);
      setIsTextFieldFocused(false);
      setInputValue(sliderValue.toString());
    }
  }, [settingsOpen, sliderValue]);

  // Handle TextField Changes with Validation
  const handleTextFieldChange = (e) => {
    const value = e.target.value.trim();
    // Allow empty string or valid number within range
    if (
      value === "" ||
      (/^\d+$/.test(value) &&
        Number(value) <= MAX_VALUE &&
        Number(value) >= MIN_VALUE)
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
  const validateAndSetValue = () => {
    if (inputValue === "") {
      // Reset inputValue to current sliderValue to maintain consistency
      setInputValue(sliderValue.toString());
      return;
    }

    const parsedValue = parseInt(inputValue, 10);
    if (isNaN(parsedValue)) {
      setInputValue(sliderValue.toString());
      return;
    }

    let newValue = parsedValue;
    if (parsedValue < MIN_VALUE) {
      newValue = MIN_VALUE;
    } else if (parsedValue > MAX_VALUE) {
      newValue = MAX_VALUE;
    }

    setSliderValue(newValue);
    setInputValue(newValue.toString());
  };

  return (
    <Popover
      id="settings-popover"
      open={settingsOpen}
      anchorEl={settingsAnchorEl}
      onClose={() => {
        handleMutate();
        settingsPopoverClose();
      }}
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
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton
              onClick={() => {
                const defaultValue = DEFAULT_VALUE();
                setSliderValue(defaultValue);
                setInputValue(defaultValue.toString());
              }}
              sx={{
                visibility:
                  sliderValue !== DEFAULT_VALUE() ? "visible" : "hidden",
                transition: "visibility 0.5s, opacity 0.4s",
                opacity: sliderValue !== DEFAULT_VALUE() ? 1 : 0,
              }}
              aria-label="Reset to default"
            >
              <HistoryIcon fontSize="small" />
            </IconButton>
            <TextField
              value={inputValue}
              onChange={handleTextFieldChange}
              onBlur={handleTextFieldBlur}
              onFocus={handleTextFieldFocus} // Ensure handleTextFieldFocus is defined
              variant="outlined"
              size="small"
              type="text"
              onMouseEnter={handleTextFieldMouseEnter}
              onMouseLeave={handleTextFieldMouseLeave}
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
                      : "1px solid transparent",
                    transition:
                      "border-color 0.4s ease, border-width 0.2s ease",
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
            min={MIN_VALUE}
            max={MAX_VALUE}
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
