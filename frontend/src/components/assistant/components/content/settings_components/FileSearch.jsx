import {
  Box,
  Button,
  LinearProgress,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, { useContext, useRef, useState, useEffect } from "react";
import Switch from "../../../../Switch";
import { RiInformation2Line } from "react-icons/ri";
import { GoPlus } from "react-icons/go";
import { IoSettingsOutline } from "react-icons/io5";
import { DrawerContext } from "../../../../../contexts/DrawerContext";
import FileSearchPopover from "./FileSearchPopover";
import InfoPopover from "./InfoPopover";
import FileSearchAddDialog from "./FileSearchAddDialog";
import { useUpdateAssistant } from "../../../../../hooks/assistant/useUpdateAssistant";
import { useAssistantContext } from "../../../../../contexts/AssistantContext";
import { GoDatabase } from "react-icons/go";
import { formatFileSize } from "../../../../../utils/formatFileSize";
import { truncateText } from "../../../../../utils/textUtils";

const drawerWidth = 240;

const FileSearch = () => {
  const { mutate } = useUpdateAssistant();
  const { assistant, vectorStore } = useAssistantContext();

  // Local state for the input value
  const [switchState, setSwitchState] = useState(
    assistant?.tools?.some((tool) => tool.type === "file_search") || false
  );
  useEffect(() => {
    setSwitchState(
      assistant?.tools?.some((tool) => tool.type === "file_search") || false
    );
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
      ? `(max-width:815px)`
      : `(max-width:${open ? 500 + drawerWidth : 500}px)`
  );

  // Info Popover State
  const infoPopoverAnchor = useRef(null);
  const [infoOpenedPopover, setOpenedInfoPopover] = useState(false);

  // Settings popover
  const [settingsAnchorEl, setSettingsAnchorEl] = useState(null);
  const settingsOpen = Boolean(settingsAnchorEl);

  // Add Files Dialog
  const [addFilesOpen, setAddFilesOpen] = useState(false);

  // Add Files states
  const addFilesDialogOpen = () => {
    setAddFilesOpen(true);
  };

  const addFilesDialogClose = () => {
    setAddFilesOpen(false);
  };

  // Settings popover states
  const settingsPopoverClick = (event) => {
    setSettingsAnchorEl(event.currentTarget);
  };

  const settingsPopoverClose = () => {
    setSettingsAnchorEl(null);
  };

  // Info popover states
  const infoPopoverEnter = () => {
    setOpenedInfoPopover(true);
  };
  const infoPopoverLeave = () => {
    setOpenedInfoPopover(false);
  };

  const handleMutate = (newState) => {
    const updatedAssistant = {
      ...assistant,
      tools: newState
        ? [
            ...(assistant.tools || []),
            {
              type: "file_search",
              file_search: {},
            },
          ]
        : (assistant.tools || []).filter((tool) => tool.type !== "file_search"),
    };
    mutate(
      { id: assistant.id, assistantData: updatedAssistant },
      {
        onError: () => {
          setSwitchState(
            assistant?.tools?.some((tool) => tool.type === "file_search") ||
              false
          );
        },
      }
    );
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 1,
        ml: isTablet ? -1 : 0,
        // If model has Vector Store attached
        pb: vectorStore ? 1 : 0,
        pr: vectorStore ? 1 : 0,
        borderBottom: vectorStore ? "1px solid" : "none",
        borderRight: vectorStore ? "1px solid" : "none",
        borderColor:
          theme.palette.mode === "dark"
            ? theme.palette.grey[500]
            : theme.palette.grey[600],
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", flexDirection: "row" }}>
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
          File Search
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
            color="inherit"
            onClick={settingsPopoverClick}
            sx={{
              textTransform: "none",
              borderRadius: 2.3,
              px: 1,
              py: 0.7,
              mr: 1,
              minWidth: 0,
              backgroundColor: (theme) => theme.palette.action.hover,
              "&:hover": {
                backgroundColor: (theme) => theme.palette.action.selected,
              },
            }}
          >
            <IoSettingsOutline size="1rem" />
          </Button>

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
      {vectorStore && (
        <>
          {vectorStore?.status === "in_progress" && (
            <LinearProgress sx={{ height: 2 }} />
          )}
          <Box
            onClick={() => {
              console.log("Yet to be implemented.");
            }}
            sx={{
              display: "flex",
              alignItems: "center",
              flexDirection: "row",
              cursor: "pointer",
              gap: 1,
              transition: "all 0.3s ease-in-out",
              "&:hover": {
                backgroundColor: (theme) => theme.palette.action.hover,
                boxShadow: (theme) =>
                  theme.palette.mode === "dark"
                    ? "0px 4px 10px rgba(0,0,0,0.5)"
                    : "0px 4px 10px rgba(0,0,0,0.2)",
              },
            }}
          >
            <GoDatabase style={{ marginLeft: 8 }} size="1.5rem" />
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                flexDirection: "column",
                width: "100%",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "0.75rem",
                    fontFamily: "'Montserrat', serif",
                  }}
                >
                  Vector Store for{" "}
                  {truncateText(
                    assistant?.name || "Unnamed Assistant",
                    isMobile ? 17 : 25
                  )}
                </Typography>
                <Typography
                  sx={{
                    fontSize: "0.7rem",
                    fontFamily: "'Montserrat', serif",
                    pr: 0.5,
                    pt: 0.2,
                    color:
                      theme.palette.mode === "dark"
                        ? theme.palette.grey[400]
                        : theme.palette.grey[700],
                  }}
                >
                  {vectorStore?.status === "in_progress" ? (
                    <>
                      {vectorStore?.file_counts.completed}{" "}/{" "}
                      {vectorStore?.file_counts.total}
                    </>
                  ) : vectorStore?.usage_bytes !== undefined &&
                    vectorStore.usage_bytes !== null ? (
                    formatFileSize(vectorStore.usage_bytes)
                  ) : (
                    "n/a"
                  )}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "0.7rem",
                    fontFamily: "'Montserrat', serif",
                    color:
                      theme.palette.mode === "dark"
                        ? theme.palette.grey[400]
                        : theme.palette.grey[700],
                  }}
                >
                  {vectorStore?.id || "n/a"}
                </Typography>
              </Box>
            </Box>
          </Box>
        </>
      )}
      {/* Info Popover */}
      <InfoPopover
        infoOpenedPopover={infoOpenedPopover}
        infoPopoverAnchor={infoPopoverAnchor}
        infoPopoverEnter={infoPopoverEnter}
        infoPopoverLeave={infoPopoverLeave}
        text="File search enables the assistant with knowledge from files that you or
        your users upload. Once a file is uploaded, the assistant automatically
        decides when to retrieve content based on user requests."
        link="https://platform.openai.com/docs/assistants/overview"
      />

      {/* Settings Popover */}
      <FileSearchPopover
        settingsAnchorEl={settingsAnchorEl}
        settingsPopoverClose={settingsPopoverClose}
        settingsOpen={settingsOpen}
        model={assistant?.model || "gpt-4"}
        switchState={switchState}
      />

      {/* Add Files Dialog */}
      <FileSearchAddDialog
        openDialog={addFilesOpen}
        handleClose={addFilesDialogClose}
        vectorStoreButton={true}
        vectorStore={vectorStore}
        assistant={assistant}
      />
    </Box>
  );
};

export default FileSearch;
