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
import { toast } from "react-toastify";
import { getResponseFormatErrorMessage } from "../../../../../utils/getResponseFormatErrorMessage";
import FunctionAddDialog from "./FunctionAddDialog";
import SubtitlesIcon from "@mui/icons-material/Subtitles";

const response_formats = [
  {
    type: "text",
  },
  {
    type: "json_object",
  },
  {
    type: "json_schema",
  },
];

const drawerWidth = 240;

const ResponseFormat = () => {
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

  const { mutate } = useUpdateAssistant();
  const { assistant } = useAssistantContext();

  // State for conditional renders. Holds the eventual response_format scheme
  const [jsonSchema, setJsonSchema] = useState(null);
  useEffect(() => {
    if (assistant?.response_format?.type === "json_schema") {
      setJsonSchema(assistant.response_format.json_schema);
    } else setJsonSchema(null);
  }, [assistant]);

  // States for schema dialog
  const [addFunctions, setAddFunctions] = useState(false);
  const [activeFunction, setActiveFunction] = useState("");
  useEffect(() => {
    if (jsonSchema) setActiveFunction(jsonSchema);
    else setActiveFunction(null);
  }, [jsonSchema]);

  // Add Functions states
  const addFunctionsDialogOpen = () => {
    setAddFunctions(true);
  };

  const addFunctionsDialogClose = () => {
    setAddFunctions(false);
  };

  // Local state for the input value
  const [responseFormatInput, setResponseFormatInput] = useState(
    assistant?.response_format?.type || response_formats[0].type
  );
  useEffect(() => {
    setResponseFormatInput(
      assistant?.response_format?.type || response_formats[0].type
    );
  }, [assistant]);

  const handleResponseFormatChange = (e) => {
    const newRs = e.target.value;
    if (newRs === "json_schema") {
      addFunctionsDialogOpen();
    } else {
      setResponseFormatInput(newRs);
      handleMutate(newRs);
    }
  };

  const handleMutate = (newRs) => {
    if (newRs === assistant?.response_format?.type) return;

    const updatedAssistant = { ...assistant, response_format: { type: newRs } };

    mutate({
      id: assistant.id,
      assistantData: updatedAssistant,
      customOnError: (error) => {
        setResponseFormatInput(
          assistant?.response_format?.type || response_formats[0].type
        );
        const errorMessage = getResponseFormatErrorMessage(error);
        toast.error(errorMessage);
      },
    });
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 1,
        // If model has Functions attached
        pb: jsonSchema ? 1 : 0,
        pr: jsonSchema ? 1 : 0,
        borderBottom: jsonSchema ? "1px solid" : "none",
        borderRight: jsonSchema ? "1px solid" : "none",
        borderColor:
          theme.palette.mode === "dark"
            ? theme.palette.grey[500]
            : theme.palette.grey[600],
      }}
    >
      <Typography
        variant="body1"
        sx={{
          fontFamily: "'Montserrat', serif",
        }}
      >
        Response Format
      </Typography>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          flexDirection: "row",
          gap: 1,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Select
            displayEmpty
            value={responseFormatInput}
            onChange={handleResponseFormatChange}
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
            {response_formats.map((rs, index) => (
              <MenuItem
                key={rs.type}
                value={rs.type}
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
                  {rs.type}
                </Typography>
              </MenuItem>
            ))}
          </Select>
        </Box>
      </Box>
      {/* Json Schema */}
      {jsonSchema && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flex-start",
            width: "100%",
            gap: 1,
          }}
        >
          <SubtitlesIcon
            onClick={addFunctionsDialogOpen}
            sx={{
              cursor: "pointer",
              ml: 1.3,
              color:
                theme.palette.mode === "dark"
                  ? theme.palette.grey[400]
                  : theme.palette.grey[700],
              "&:hover ~ .list-item-text": {
                color:
                  theme.palette.mode === "dark"
                    ? theme.palette.primary.light
                    : theme.palette.primary.dark,
              },
            }}
          />
          <Typography
            className="list-item-text"
            variant="body1"
            sx={{
              fontFamily: "'Montserrat', serif",
              fontSize: "0.75rem",
              cursor: "pointer",
              color: "text.secondary",
              transition: "color 0.3s ease-in-out",
              "&:hover": {
                color: (theme) =>
                  theme.palette.mode === "dark"
                    ? theme.palette.primary.light
                    : theme.palette.primary.dark,
              },
            }}
            onClick={addFunctionsDialogOpen}
          >
            {jsonSchema.name}
          </Typography>
        </Box>
      )}
      {/* Add Schema Dialog */}
      <FunctionAddDialog
        openDialog={addFunctions}
        handleClose={addFunctionsDialogClose}
        assistant={assistant}
        menuOptions={["math_response", "paper_metadata", "content_compliance"]}
        isResponseFormat={true}
        activeFunction={activeFunction}
      />
    </Box>
  );
};

export default ResponseFormat;
