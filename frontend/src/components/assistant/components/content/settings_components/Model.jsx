import React, { useContext, useEffect, useState } from "react";
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
import { useUpdateAssistant } from "../../../../../hooks/assistant/useUpdateAssistant";
import { useAssistantContext } from "../../../../../contexts/AssistantContext";

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
  {
    name: "gpt-4o-2024-08-06",
    description: "",
  },
  {
    name: "gpt-4o-05-13",
    description: "",
  },
  {
    name: "gpt-4-turbo-preview",
    description: "",
  },
  {
    name: "gpt-4-turbo-2024-04-09",
    description: "",
  },
  {
    name: "gpt-4-1106-preview",
    description: "",
  },
  {
    name: "gpt-4-0613",
    description: "",
  },
  {
    name: "gpt-4-0125-perview",
    description: "",
  },
  {
    name: "gpt-3.5-turbo-16k",
    description: "",
  },
  {
    name: "gpt-3.5-turbo-1106",
    description: "",
  },
  {
    name: "gpt-3.5-turbo-0125",
    description: "",
  },
];

const drawerWidth = 240;

const Model = () => {
  const { mutate } = useUpdateAssistant();
  const { assistant } = useAssistantContext();
  
  // Local state for the input value
  const [modelInput, setModelInput] = useState(assistant?.model || models[3].name);
  useEffect(() => {
    setModelInput(assistant?.model || models[3].name);
  }, [assistant]);

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

  const handleModelChange = (e) => {
    const newModel = e.target.value;
    setModelInput(newModel);
    handleMutate(newModel);
  };

  const handleMutate = (newModel) => {
    if (newModel === assistant?.model) return;

    const updatedAssistant = { ...assistant, model: newModel };

    mutate(
      { id: assistant.id, assistantData: updatedAssistant },
      {
        onError: () => {
          setModelInput(assistant?.model || models[3].name);
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
          value={modelInput}
          onChange={handleModelChange}
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
          MenuProps={{
            PaperProps: {
              className: "drawer-scrollbar",
              style: {
                maxHeight: 300,
              },
            },
          }}
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
