import { Box, Button, Divider, Typography, useMediaQuery } from "@mui/material";
import React from "react";
import Switch from "../../../../Switch";
import { RiInformation2Line } from "react-icons/ri";
import { GoPlus } from "react-icons/go";

const CodeInterpreter = () => {
  const isMobile = useMediaQuery("(max-width:815px)");

  return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          flexDirection: "row",
          gap: 1,
          ml: isMobile ? -1 : 2,
        }}
      >
        <Switch />
        <Typography
          variant="body1"
          sx={{
            fontFamily: "'Montserrat', serif",
          }}
        >
          Code Interpreter
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
              Files
            </Typography>
          </Button>
        </Box>
      </Box>
  );
};

export default CodeInterpreter;
