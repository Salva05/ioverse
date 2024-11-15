import React, { useState } from "react";
import { Box, Typography, TextField } from "@mui/material";
import { useMediaQuery } from "@mui/material";
import { CopyToClipboard } from "react-copy-to-clipboard";
import Tooltip from "@mui/material/Tooltip";

const Name = () => {
  const [copied, setCopied] = useState(false);
  const isMobile = useMediaQuery("(max-width:500px)");
  const isTablet = useMediaQuery("(max-width:815px)");

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
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
          alignItems: "flex-start",
          width: "100%",
        }}
      >
        <TextField
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
            title={copied ? "Copied!" : "Click to copy"}
            arrow
            placement="top"
            slotProps={{
                popper: {
                  modifiers: [
                    {
                      name: 'offset',
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
    </Box>
  );
};

export default Name;
