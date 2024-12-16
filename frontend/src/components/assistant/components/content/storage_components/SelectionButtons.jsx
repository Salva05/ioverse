import { Box, Button } from "@mui/material";
import React from "react";

const SelectionButtons = ({ handleClick, selected }) => {
  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          gap: 1,
        }}
      >
        {["Files", "Vector stores"].map((buttonName) => (
          <Button
            key={buttonName}
            size="small"
            variant="outlined"
            onClick={() => handleClick(buttonName)}
            sx={{
              borderRadius: "8px",
              textTransform: "none",
              backgroundColor:
                selected === buttonName ? "primary.main" : "transparent",
              color:
                selected === buttonName
                  ? "primary.contrastText"
                  : "text.primary",
              borderColor: selected === buttonName ? "primary.main" : "divider",
              "&:hover": {
                backgroundColor:
                  selected === buttonName ? "primary.dark" : "action.hover",
                borderColor: "primary.main",
              },
              fontFamily: "'Montserrat', serif",
            }}
          >
            {buttonName}
          </Button>
        ))}
      </Box>
    </>
  );
};

export default SelectionButtons;
