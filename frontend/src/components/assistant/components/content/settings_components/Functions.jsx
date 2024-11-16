import { Box, Button, Typography, useMediaQuery } from "@mui/material";
import React from "react";
import { RiInformation2Line } from "react-icons/ri";
import { GoPlus } from "react-icons/go";

const Functions = () => {
  const isMobile = useMediaQuery("(max-width:815px)");

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        flexDirection: "row",
        gap: 1,
        ml: isMobile ? 0.4 : 3.3,
        mt: 1
      }}
    >
      <Typography
        variant="body1"
        sx={{
          fontFamily: "'Montserrat', serif",
        }}
      >
        Functions
      </Typography>
      <RiInformation2Line />
      <Box sx={{ marginLeft: "auto", display: "flex", alignItems: "center" }}>
        <Button
          size="small"
          color="inherit"
          sx={{
            textTransform: "none",
            borderRadius: 2.3,
            minWidth: 0,
            pr: 1,
            py: 0.3,
            pl: 0.7,
            backgroundColor: (theme) => theme.palette.action.hover,
            "&:hover": {
              backgroundColor: (theme) => theme.palette.action.selected,
            },
          }}
        >
          <GoPlus size="1rem" style={{ marginRight: 3 }} />
          <Typography
            sx={{
              fontSize: "0.95rem",
              fontFamily: "'Montserrat', serif",
            }}
          >
            Functions
          </Typography>
        </Button>
      </Box>
    </Box>
  );
};

export default Functions;
