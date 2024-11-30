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
import React, { useContext, useEffect, useRef, useState } from "react";
import Switch from "../../../../Switch";
import { RiInformation2Line } from "react-icons/ri";
import { GoPlus } from "react-icons/go";
import { DrawerContext } from "../../../../../contexts/DrawerContext";
import InfoPopover from "./InfoPopover";
import { useUpdateAssistant } from "../../../../../hooks/assistant/useUpdateAssistant";
import { useAssistantContext } from "../../../../../contexts/AssistantContext";
import CodeInterpreterAddDialog from "./CodeInterpreterAddDialog";
import { InsertDriveFileOutlined } from "@mui/icons-material";
import { GoTrash } from "react-icons/go";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import { extractOpenAIError } from "../../../../../utils/extractOpenAIError";

const drawerWidth = 240;

const CodeInterpreter = () => {
  const theme = useTheme();
  const { open, isSmallScreen } = useContext(DrawerContext);
  const isMobile = useMediaQuery(
    isSmallScreen
      ? `(max-width:815px)`
      : `(max-width:${open ? 815 + drawerWidth : 815}px)`
  );
  const queryClient = useQueryClient();

  const { mutate, isPending, isSuccess } = useUpdateAssistant();
  const { assistant } = useAssistantContext();

  const { files } = useAssistantContext();
  const [idFileToDelete, setIdFileToDelete] = useState("");

  // State for conditional renders checking if the assistant's code_interpreter resouce has any file inside
  const [hasFiles, setHasFiles] = useState(
    Boolean(assistant?.tool_resources?.code_interpreter?.file_ids?.length)
  );

  // Local state for the input value
  const [switchState, setSwitchState] = useState(
    assistant?.tools?.some((tool) => tool.type === "code_interpreter") || false
  );
  useEffect(() => {
    setSwitchState(
      assistant?.tools?.some((tool) => tool.type === "code_interpreter") ||
        false
    );
  }, [assistant]);

  // Info Popover State
  const infoPopoverAnchor = useRef(null);
  const [infoOpenedPopover, setOpenedInfoPopover] = useState(false);

  // Add Files Dialog
  const [addFilesOpen, setAddFilesOpen] = useState(false);

  // Add Files states
  const addFilesDialogOpen = () => {
    setAddFilesOpen(true);
  };

  const addFilesDialogClose = () => {
    setAddFilesOpen(false);
  };

  // Info popover states
  const infoPopoverEnter = () => {
    setOpenedInfoPopover(true);
  };
  const infoPopoverLeave = () => {
    setOpenedInfoPopover(false);
  };

  const handleDetachFile = (id) => {
    if (!id) {
      toast.error("Error deleting the file: Id not found.");
    }

    setIdFileToDelete(id);
    // Update assistant
    const updatedAssistant = {
      ...assistant,
      tool_resources: {
        ...assistant.tool_resources,
        code_interpreter: {
          ...assistant.tool_resources?.code_interpreter,
          file_ids: (
            assistant.tool_resources?.code_interpreter?.file_ids || []
          ).filter((fileId) => fileId !== id),
        },
      },
    };
    mutate({ id: assistant.id, assistantData: updatedAssistant });
  };

  useEffect(() => {
    if (isSuccess) setIdFileToDelete("");
  }, [isSuccess]);

  const handleMutate = (newState) => {
    const updatedAssistant = {
      ...assistant,
      tools: newState
        ? [
            ...(assistant.tools || []),
            {
              type: "code_interpreter",
            },
          ]
        : (assistant.tools || []).filter(
            (tool) => tool.type !== "code_interpreter"
          ),
    };
    mutate({
      id: assistant.id,
      assistantData: updatedAssistant,
      customOnError: (error) => {
        setSwitchState(
          assistant?.tools?.some((tool) => tool.type === "code_interpreter") ||
            false
        );
        if (error?.response?.data.error) {
          toast.error(extractOpenAIError(error?.response?.data.error));
        } else {
          toast.error("Failed to update assistant. Please try again later.");
        }
      },
    });
  };

  useEffect(() => {
    setHasFiles(
      Boolean(assistant?.tool_resources?.code_interpreter?.file_ids?.length)
    );
  }, [assistant, files]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 1,
        ml: isMobile ? -1 : 0,
        // If model has Vector Store attached
        pb: hasFiles ? 1 : 0,
        pr: hasFiles ? 1 : 0,
        borderBottom: hasFiles ? "1px solid" : "none",
        borderRight: hasFiles ? "1px solid" : "none",
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
        <Switch
          checked={switchState}
          onChange={(e) => {
            const newState = e.target.checked;
            setSwitchState(newState);
            handleMutate(newState);
          }}
        />
        <Typography
          variant="body1"
          sx={{
            fontFamily: "'Montserrat', serif",
          }}
        >
          Code Interpreter
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
            onClick={addFilesDialogOpen}
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
      {/* fixed height scrollable list of all the assistant's attached files */}
      {hasFiles && (
        <Box
          className="drawer-scrollbar"
          sx={{
            maxHeight: 135,
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
            {(assistant?.tool_resources?.code_interpreter?.file_ids || []).map(
              (fileId) => {
                const file = files.find((file) => file.id === fileId);
                return (
                  <ListItem
                    key={fileId}
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
                      <InsertDriveFileOutlined
                        sx={{
                          fontSize: "0.95rem",
                        }}
                      />
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
                            console.log(
                              `Clicked on file: ${file?.filename || fileId}`
                            );
                          }}
                        >
                          {file?.filename || fileId}
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
                      edge="end"
                      aria-label="delete"
                      disabled={isPending && !(fileId === idFileToDelete)}
                      onClick={() =>
                        isPending ? undefined : handleDetachFile(fileId)
                      }
                      sx={{
                        opacity: isPending && fileId === idFileToDelete ? 1 : 0,
                        visibility:
                          isPending && fileId === idFileToDelete
                            ? "visible"
                            : "hidden",
                        transition: "opacity 0.3s ease, visibility 0.3s ease",
                        position: "absolute",
                        right: 12,
                        top: "50%",
                        transform: "translateY(-50%)",
                        borderRadius: 2,
                        pointerEvents:
                          isPending && fileId === idFileToDelete
                            ? "none"
                            : "auto",
                        "&:hover": {
                          backgroundColor: "transparent",
                          opacity:
                            isPending && fileId === idFileToDelete ? 1 : 0.7,
                          visibility: "visible",
                        },
                      }}
                    >
                      {isPending && fileId === idFileToDelete ? (
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
                );
              }
            )}
          </List>
        </Box>
      )}
      {/* Info Popover */}
      <InfoPopover
        infoOpenedPopover={infoOpenedPopover}
        infoPopoverAnchor={infoPopoverAnchor}
        infoPopoverEnter={infoPopoverEnter}
        infoPopoverLeave={infoPopoverLeave}
        text="Code Interpreter enables the assistant to write and run code. 
        This tool can process files with diverse data and formatting, 
        and generate files such as graphs."
        link="https://platform.openai.com/docs/assistants/overview"
      />

      {/* Add Files Dialog */}
      <CodeInterpreterAddDialog
        openDialog={addFilesOpen}
        handleClose={addFilesDialogClose}
        vectorStoreButton={false}
        assistant={assistant}
      />
    </Box>
  );
};

export default CodeInterpreter;
