import React, { useContext, useState } from "react";
import {
  Box,
  Typography,
  Select,
  MenuItem,
  OutlinedInput,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@emotion/react";
import { DrawerContext } from "../../../../../contexts/DrawerContext";

const models = [
  {
    name: "gpt-4o-mini",
    description:
      "Affordable and intelligent small model for fast, lightweight tasks",
  },
  {
    name: "gpt-4o",
    description:
      "High-intelligent flagship model for complex, multi-step tasks",
  },
  {
    name: "gpt-4-turbo",
    description: "",
  },
  {
    name: "gpt-4",
    description: "",
  },
  {
    name: "gpt-3.5-turbo",
    description: "",
  },
  {
    name: "gpt-4o-mini-2024-08-18",
    description: "",
  },
];

const drawerWidth = 240;

const Model = () => {
  const theme = useTheme();
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

  const [model, setModel] = useState(models[0].name);

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
        Model
      </Typography>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Select
          displayEmpty
          value={model}
          onChange={(event) => {
            setModel(event.target.value);
          }}
          sx={{
            minWidth: isMobile ? "300px" : isTablet ? "375px" : "450px",
            "& .MuiOutlinedInput-notchedOutline": {
              borderRadius: 3,
            },
            "& .MuiOutlinedInput-input": {
              py: 1.15,
            },
          }}
          input={<OutlinedInput />}
        >
          <Typography
            variant="caption"
            sx={{
              ml: 2,
              fontWeight: "bold",
              color: theme.palette.mode === "light" ? "#8a8a8a" : "#bababa",
              fontFamily: "'Montserrat', serif",
            }}
          >
            Chat
          </Typography>
          {models.map((model, index) => (
            <MenuItem
              key={model.name}
              value={model.name}
              sx={{
                mt: index === 0 ? 0.6 : 0,
                py: 0.5,
                mx: 1,
                fontFamily: "'Montserrat', serif",
                "&:hover": {
                  borderRadius: 3,
                },
                "&.Mui-selected": {
                  borderRadius: 3,
                },
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  fontFamily: "'Montserrat', serif",
                }}
              >
                {model.name}
              </Typography>
            </MenuItem>
          ))}
        </Select>
      </Box>
    </Box>
  );
};

export default Model;
