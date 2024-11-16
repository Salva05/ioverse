import React, { useRef, useState } from "react";
import { Box, Typography, TextField } from "@mui/material";
import { useMediaQuery } from "@mui/material";
import { CopyToClipboard } from "react-copy-to-clipboard";
import Tooltip from "@mui/material/Tooltip";
import Popover from "@mui/material/Popover";
import { useTheme } from "@emotion/react";

const Name = () => {
  const theme = useTheme();
  const [copied, setCopied] = useState(false);
  const isMobile = useMediaQuery("(max-width:500px)");
  const isTablet = useMediaQuery("(max-width:815px)");

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

  const open = Boolean(anchorEl);

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
          alignItems: "flex-start",
          width: "100%",
        }}
      >
        <TextField
          placeholder="Enter a user friendly name"
          id="outlined-basic"
          variant="outlined"
          defaultValue="John Doe"
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
        <CopyToClipboard
          text={"asst_UAoDUk63bOUe35Lhc7KeYvZP"}
          onCopy={handleCopy}
        >
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
              asst_UAoDUk63bOUe35Lhc7KeYvZP
            </Typography>
          </Tooltip>
        </CopyToClipboard>
      </Box>
      {isTablet && (
        <Popover
          id="mouse-over-popover"
          sx={{
            pointerEvents: "none",
            "& .MuiPaper-root": {
              backgroundColor: theme.palette.mode === "light" ? "black" : "white",
              color: theme.palette.mode === "light" ? "white" : "black",
              borderRadius: "8px",
              padding: "4px 8px",
            },
          }}
          open={open}
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
