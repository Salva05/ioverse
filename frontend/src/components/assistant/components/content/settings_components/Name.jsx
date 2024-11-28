import React, { useContext, useEffect, useRef, useState } from "react";
import { Box, Typography, TextField } from "@mui/material";
import { useMediaQuery } from "@mui/material";
import { CopyToClipboard } from "react-copy-to-clipboard";
import Tooltip from "@mui/material/Tooltip";
import Popover from "@mui/material/Popover";
import { useTheme } from "@emotion/react";
import { DrawerContext } from "../../../../../contexts/DrawerContext";
import { useUpdateAssistant } from "../../../../../hooks/assistant/useUpdateAssistant";
import { useAssistantContext } from "../../../../../contexts/AssistantContext";
import { toast } from "react-toastify";

const drawerWidth = 240;

const Name = () => {
  const { mutate } = useUpdateAssistant();
  const { assistant } = useAssistantContext();

  // Local state for the input value
  const [nameInput, setNameInput] = useState(assistant?.name || "");
  useEffect(() => {
    setNameInput(assistant?.name || "");
  }, [assistant]);

  const theme = useTheme();
  const [copied, setCopied] = useState(false);

  // Responsiveness
  const { open, isSmallScreen } = useContext(DrawerContext);
  const isTablet = useMediaQuery(
    isSmallScreen
      ? `(max-width:815px)`
      : `(max-width:${open ? 815 + drawerWidth : 815}px)`
  );
  const isMobile = useMediaQuery(
    isSmallScreen
      ? `(max-width:500px)`
      : `(max-width:${open ? 500 + drawerWidth : 500}px)`
  );

  // For Mobile -----
  const popoverRef = useRef(null);
  const [anchorEl, setAnchorEl] = useState(null);
  // -----------------

  const handleCopy = () => {
    if (isTablet) {
      setAnchorEl(popoverRef.current);
      setTimeout(() => {
        setAnchorEl(null);
      }, 1000);
    } else {
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    }
  };

  const openAnchor = Boolean(anchorEl);

  const handleNameChange = (e) => {
    setNameInput(e.target.value);
  };

  const validate = () => {
    if (nameInput.trim() !== "" && !/^[a-zA-Z0-9\s]+$/.test(nameInput)) {
      return false;
    }
    return true;
  };

  const shouldUpdate = () => {
    if (nameInput === assistant?.name) return false;
    if (nameInput === "") return false;
    return true;
  };

  const handleMutate = () => {
    if (!validate()) {
      setNameInput(assistant?.name || "");
      toast.error("Invalid name. Please check your input and try again.");
      return;
    }
    if (!shouldUpdate()) return;

    const updatedAssistant = { ...assistant, name: nameInput };
    mutate(
      { id: assistant.id, assistantData: updatedAssistant },
      {
        onError: () => {
          setNameInput(assistant?.name || "");
        },
      }
    );
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 1,
      }}
    >
      <Typography
        variant="body1"
        sx={{
          fontFamily: "'Montserrat', serif",
        }}
      >
        Name
      </Typography>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        <TextField
          placeholder="Enter a user friendly name"
          id="outlined-basic"
          variant="outlined"
          value={nameInput}
          onChange={handleNameChange}
          onBlur={handleMutate}
          sx={{
            minWidth: isMobile ? "300px" : isTablet ? "375px" : "450px",
            "& .MuiOutlinedInput-root": {
              borderRadius: 3,
            },
            "& .MuiOutlinedInput-input": {
              paddingY: 1.15,
            },
          }}
        />
        <CopyToClipboard text={assistant?.id} onCopy={handleCopy}>
          <Box>
            {" "}
            {/* To make the popover be centered to the text and not to the parent container */}
            <Tooltip
              title={isTablet ? "" : copied ? "Copied!" : "Click to copy"}
              arrow
              placement="top"
              slotProps={{
                popper: {
                  modifiers: [
                    {
                      name: "offset",
                      options: {
                        offset: [0, -12],
                      },
                    },
                  ],
                },
              }}
            >
              <Typography
                variant="caption"
                ref={popoverRef}
                sx={{
                  marginTop: 0.5,
                  marginLeft: 1,
                  color: "gray",
                  fontFamily: "'Montserrat', serif",
                  fontWeight: "bold",
                  cursor: "pointer",
                  "&:hover": {
                    color: (theme) => theme.palette.text.primary,
                  },
                }}
              >
                {assistant?.id || ""}
              </Typography>
            </Tooltip>
          </Box>
        </CopyToClipboard>
      </Box>
      {isTablet && (
        <Popover
          id="mouse-over-popover"
          sx={{
            pointerEvents: "none",
            "& .MuiPaper-root": {
              backgroundColor:
                theme.palette.mode === "light" ? "black" : "white",
              color: theme.palette.mode === "light" ? "white" : "black",
              borderRadius: "8px",
              padding: "4px 8px",
            },
          }}
          open={openAnchor}
          anchorEl={anchorEl}
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
          <Typography variant="body2">Copied!</Typography>
        </Popover>
      )}
    </Box>
  );
};

export default Name;
