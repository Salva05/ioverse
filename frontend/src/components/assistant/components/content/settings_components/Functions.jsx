import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { RiInformation2Line } from "react-icons/ri";
import { GoPlus, GoTrash } from "react-icons/go";
import { DrawerContext } from "../../../../../contexts/DrawerContext";
import InfoPopover from "./InfoPopover";
import FunctionAddDialog from "./FunctionAddDialog";
import { useAssistantContext } from "../../../../../contexts/AssistantContext";
import { VscJson } from "react-icons/vsc";
import { useUpdateAssistant } from "../../../../../hooks/assistant/useUpdateAssistant";
import { getFunctionToolErrorMessage } from "../../../../../utils/getFunctionToolErrorMessage";
import { toast } from "react-toastify";

const drawerWidth = 240;

const Functions = () => {
  const theme = useTheme();
  const { open, isSmallScreen } = useContext(DrawerContext);
  const isMobile = useMediaQuery(
    isSmallScreen
      ? `(max-width:815px)`
      : `(max-width:${open ? 815 + drawerWidth : 815}px)`
  );

  const { assistant, setAssistant } = useAssistantContext();
  const { mutate, isPending, isSuccess } = useUpdateAssistant();

  // State for conditional renders. Holds the assistant's functions
  const functions = useMemo(() => {
    return Array.isArray(assistant?.tools)
      ? assistant.tools.filter((tool) => tool.type === "function")
      : [];
  }, [assistant]);

  const [functionBeingDeleted, setFunctionBeingDeleted] = useState(""); // Holds the name of the function being deleted

  const handleRemove = (functionName, shouldCloseFunctionDialog) => {
    setFunctionBeingDeleted(functionName); // Track the function being deleted
  
    const updatedAssistant = {
      ...assistant,
      tools: assistant.tools.filter(
        (tool) =>
          tool.type !== "function" || // Keep all non-function tools
          tool.function.name !== functionName // Exclude the matching function tool
      ),
    };
  
    mutate({
      id: assistant.id,
      assistantData: updatedAssistant,
      customOnError: (error) => {
        const errorMessage = getFunctionToolErrorMessage(error);
        toast.error(errorMessage);
        setFunctionBeingDeleted("");
      },
      customOnSuccess: () => {
        setFunctionBeingDeleted("");
        if (shouldCloseFunctionDialog) {
          addFunctionsDialogClose();
        }
      },
    });
  };

  // Info Popover State
  const infoPopoverAnchor = useRef(null);
  const [infoOpenedPopover, setOpenedInfoPopover] = useState(false);

  // Add Functions Dialog
  const [addFunctions, setAddFunctions] = useState(false);
  const [activeFunction, setActiveFunction] = useState("");

  // Add Functions states
  const addFunctionsDialogOpen = () => {
    setAddFunctions(true);
  };

  const addFunctionsDialogClose = () => {
    setAddFunctions(false);
  };

  // Info popover states
  const infoPopoverEnter = () => {
    setOpenedInfoPopover(true);
  };
  const infoPopoverLeave = () => {
    setOpenedInfoPopover(false);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 1,
        mt: 1,
        ml: isMobile ? -1 : 0,
        // If model has Functions attached
        pb: functions.length ? 1 : 0,
        pr: functions.length ? 1 : 0,
        borderBottom: functions.length ? "1px solid" : "none",
        borderRight: functions.length ? "1px solid" : "none",
        borderColor:
          theme.palette.mode === "dark"
            ? theme.palette.grey[500]
            : theme.palette.grey[600],
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          flexDirection: "row",
          gap: 1,
        }}
      >
        <Typography
          variant="body1"
          sx={{
            fontFamily: "'Montserrat', serif",
            ml: isMobile ? 0.8 : 1.2,
          }}
        >
          Functions
        </Typography>
        <Box
          component="span"
          ref={infoPopoverAnchor}
          aria-owns={infoOpenedPopover ? "info-popover" : undefined}
          aria-haspopup="true"
          onMouseEnter={infoPopoverEnter}
          onMouseLeave={infoPopoverLeave}
          sx={{ display: "inline-flex" }}
        >
          <RiInformation2Line />
        </Box>
        <Box sx={{ marginLeft: "auto", display: "flex", alignItems: "center" }}>
          <Button
            size="small"
            color="inherit"
            onClick={() => {
              setActiveFunction("");
              addFunctionsDialogOpen();
            }}
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
      {/* fixed height scrollable list of assistant's attached functions */}
      {functions.length > 0 && (
        <Box
          className="drawer-scrollbar"
          sx={{
            maxHeight: 140,
            overflowY: "auto",
            borderColor: theme.palette.divider,
          }}
        >
          <List
            dense
            sx={{
              padding: 0,
            }}
          >
            {functions.map((f) => (
              <ListItem
                key={f.function.name}
                sx={{
                  position: "relative",
                  transition: "all 0.3s ease-in-out",
                  "&:hover": {
                    backgroundColor: (theme) => theme.palette.action.hover,
                    boxShadow: (theme) =>
                      theme.palette.mode === "dark"
                        ? "0px 4px 10px rgba(0,0,0,0.5)"
                        : "0px 4px 10px rgba(0,0,0,0.2)",
                  },
                  "&:hover .trash-icon": {
                    opacity: 1,
                    visibility: "visible",
                  },
                }}
              >
                <ListItemIcon
                  onClick={() => {
                    setActiveFunction(f.function);
                    addFunctionsDialogOpen();
                  }}
                  sx={{
                    cursor: "pointer",
                    border: "1px solid",
                    borderColor: (theme) => theme.palette.divider,
                    backgroundColor: (theme) => theme.palette.action.hover,
                    px: 0.5,
                    py: 0.5,
                    minWidth: 0,
                    ml: -0.7,
                    mr: 1,
                    borderRadius: 2,
                    "&:hover + .list-item-text span": {
                      color: (theme) =>
                        theme.palette.mode === "dark"
                          ? theme.palette.primary.light
                          : theme.palette.primary.dark,
                    },
                  }}
                >
                  <VscJson />
                </ListItemIcon>
                <ListItemText
                  className="list-item-text"
                  primary={
                    <span
                      style={{
                        cursor: "pointer",
                        color: "inherit",
                        transition: "color 0.3s ease-in-out",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.color =
                          theme.palette.mode === "dark"
                            ? theme.palette.primary.light
                            : theme.palette.primary.dark;
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.color = "inherit";
                      }}
                      onClick={() => {
                        setActiveFunction(f.function);
                        addFunctionsDialogOpen();
                      }}
                    >
                      {f.function.name}
                    </span>
                  }
                  primaryTypographyProps={{
                    fontFamily: "'Montserrat', serif",
                    color: "text.secondary",
                    fontSize: "0.75rem",
                  }}
                />
                <IconButton
                  className="trash-icon"
                  disabled={
                    isPending && !(functionBeingDeleted === f.function.name)
                  }
                  edge="end"
                  aria-label="delete"
                  onClick={() =>
                    isPending ? undefined : handleRemove(f.function.name)
                  }
                  sx={{
                    opacity:
                      isPending && functionBeingDeleted === f.function.name
                        ? 1
                        : 0,
                    visibility:
                      isPending && functionBeingDeleted === f.function.name
                        ? "visible"
                        : "hidden",
                    transition: "opacity 0.3s ease, visibility 0.3s ease",
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    borderRadius: 2,
                    pointerEvents:
                      isPending && functionBeingDeleted === f.function.name
                        ? "none"
                        : "auto",
                    "&:hover": {
                      backgroundColor: "transparent",
                      opacity: 0.7,
                      visibility: "visible",
                    },
                  }}
                >
                  {functionBeingDeleted === f.function.name ? (
                    <CircularProgress
                      color="inherit"
                      size={13}
                      sx={{ verticalAlign: "middle" }}
                    />
                  ) : (
                    <GoTrash size={13} />
                  )}
                </IconButton>
              </ListItem>
            ))}
          </List>
        </Box>
      )}
      {/* Info Popover */}
      <InfoPopover
        infoOpenedPopover={infoOpenedPopover}
        infoPopoverAnchor={infoPopoverAnchor}
        infoPopoverEnter={infoPopoverEnter}
        infoPopoverLeave={infoPopoverLeave}
        text="Function calling lets you describe custom functions of your app or external APIs to the assistant. 
        This allows the assistant to intelligently call those functions 
        by outputting a JSON object containing relevant arguments."
        link="https://platform.openai.com/docs/assistants/overview"
      />

      {/* Add Function Dialog */}
      <FunctionAddDialog
        openDialog={addFunctions}
        handleClose={addFunctionsDialogClose}
        assistant={assistant}
        activeFunction={activeFunction}
        handleRemove={handleRemove}
        isRemovalPending={isPending}
      />
    </Box>
  );
};

export default Functions;
