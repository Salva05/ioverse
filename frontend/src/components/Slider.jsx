import React, { useState } from "react";
import { useTheme } from "@mui/material/styles";
import { Slider as MUISlider} from "@mui/material";

const Slider = ({ value, onChange, handleChangeCommitted, ...props }) => {
  const theme = useTheme();
  return (
    <MUISlider
      value={value}
      onChange={onChange}
      min={props.min}
      onChangeCommitted={handleChangeCommitted}
      max={props.max}
      step={props.step}
      sx={{
        height: 4,
        cursor: "grab",
        "& .MuiSlider-thumb": {
          width: 14,
          height: 14,
          backgroundColor:
            theme.palette.mode === "dark"
              ? theme.palette.primary.light
              : theme.palette.primary.main,
          border: `2px solid ${theme.palette.background.paper}`,
          cursor: "grab",
          "&:active": {
            cursor: "grabbing",
          },
          "&:hover": {
            boxShadow: "none",
          },
          "&:focus, &:active, &.Mui-focusVisible": {
            boxShadow: "none",
          },
        },
        "& .MuiSlider-track": {
          height: 4,
          border: "none",
          backgroundColor:
            theme.palette.mode === "dark"
              ? theme.palette.primary.light
              : theme.palette.primary.main,
        },
        "& .MuiSlider-rail": {
          height: 4,
          backgroundColor:
            theme.palette.mode === "dark"
              ? theme.palette.grey[700]
              : theme.palette.grey[300],
        },
      }}
    />
  );
};

export default Slider;
