import React, { useState, forwardRef, useContext, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import useMediaQuery from "@mui/material/useMediaQuery";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  useTheme,
  Slide,
  Tooltip,
  Skeleton,
  CircularProgress,
} from "@mui/material";
import { BiExpandAlt } from "react-icons/bi";
import { BsStars } from "react-icons/bs";
import { DrawerContext } from "../../../../../contexts/DrawerContext";
import { useAssistantContext } from "../../../../../contexts/AssistantContext";
import { useUpdateAssistant } from "../../../../../hooks/assistant/useUpdateAssistant";
import GeneratePopover from "./GeneratePopover";
import { useGenerateSystemInstructions } from "../../../../../hooks/assistant/useGenerateSystemInstructions";

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const drawerWidth = 240;

const SystemInstructions = () => {
  const theme = useTheme();
  const [openAnchor, setOpen] = useState(false);
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
  const fullScreen = useMediaQuery("(max-width:600px)");

  const { mutate } = useUpdateAssistant();
  const { assistant } = useAssistantContext();

  // Local state for input
  const [instructionsInput, setInstructionsInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  useEffect(() => {
    setInstructionsInput(assistant?.instructions || "");
  }, [assistant]);

  // Handle system instruction generation
  const handleGenerateSuccess = (data) => {
    // Update the assistant with the generated system instructions
    const updatedAssistant = {
      ...assistant,
      instructions: data.message, // Update the instructions with the AI response
    };
    mutate({ id: assistant.id, assistantData: updatedAssistant });
    setIsGenerating(false);
  };

  // Mutation for generation tool
  const { mutate: sysInstructionsMutate, isPending: isSysPending } =
    useGenerateSystemInstructions(handleGenerateSuccess);

  // For generate dialog
  const [generateDialogAnchorEl, setGenerateAnchorEl] = useState(null);
  const generateOpen = Boolean(generateDialogAnchorEl);

  const handleGenDialOpen = (e) => {
    setGenerateAnchorEl(e.currentTarget);
  };

  const handleGenDialClose = () => {
    setGenerateAnchorEl(null);
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = (resetInput = false) => {
    setOpen(false);
    if (resetInput) setInstructionsInput(assistant?.instructions || "");
  };

  const handleInstructionsChange = (e) => {
    setInstructionsInput(e.target.value);
  };

  const shouldUpdate = () => {
    if (instructionsInput === assistant?.instructions) return false;
    if (instructionsInput === "") return false;
    return true;
  };

  const handleMutate = () => {
    if (!shouldUpdate()) return;

    const updatedAssistant = { ...assistant, instructions: instructionsInput };
    mutate(
      { id: assistant.id, assistantData: updatedAssistant },
      {
        onError: () => {
          setInstructionsInput(assistant?.instructions || "");
        },
      }
    );
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Box
          sx={{
            position: "relative",
            textAlign: "center",
            width: "100%",
          }}
        >
          <Typography
            variant="body1"
            sx={{
              fontFamily: "'Montserrat', serif",
            }}
          >
            System Instructions
          </Typography>
          <Tooltip title="Generate" placement="top">
            <IconButton
              onClick={handleGenDialOpen}
              sx={{
                position: "absolute",
                right: 0,
                top: "50%",
                transform: "translateY(-50%)",
                color: "inherit",
                "&:hover": {
                  color: "primary.main",
                },
                borderRadius: 1.5,
                paddingY: 0.6,
                paddingX: 0.6,
              }}
              aria-label="icon"
              disabled={isGenerating}
            >
              {isGenerating ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <BsStars size="1rem" />
              )}
            </IconButton>
          </Tooltip>
        </Box>
        <Box
          sx={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            width: "100%",
            "&:hover .expand-icon": {
              backgroundColor:
                theme.palette.mode === "light"
                  ? theme.palette.grey[300]
                  : theme.palette.grey[800],
            },
          }}
        >
          <Box
            sx={{
              position: "relative",
              width: "100%",
            }}
          >
            {isSysPending && (
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  zIndex: 10,
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-evenly",
                  padding: 1,
                  borderRadius: 3,
                }}
              >
                {Array.from({ length: 4 }).map((_, index) => {
                  // Generate a random width between 80% and 100%
                  const randomWidth = `${80 + Math.floor(Math.random() * 21)}%`;
                  return (
                    <Skeleton
                      key={index}
                      variant="rectangular"
                      animation="wave"
                      sx={{
                        width: randomWidth,
                        height: "20%",
                        borderRadius: 2,
                        marginBottom: index < 3 ? 1 : 0,
                      }}
                    />
                  );
                })}
              </Box>
            )}
            <TextField
              id="outlined-basic"
              value={instructionsInput}
              onChange={handleInstructionsChange}
              onBlur={handleMutate}
              placeholder={isSysPending ? "" : "You are a helpful assistant..."}
              variant="outlined"
              multiline
              disabled={isSysPending}
              minRows={4}
              maxRows={8}
              slotProps={{
                htmlInput: { className: "drawer-scrollbar" },
              }}
              sx={{
                minWidth: isMobile ? "300px" : isTablet ? "375px" : "450px",
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                },
              }}
            />
          </Box>
          <IconButton
            className="expand-icon"
            onClick={handleClickOpen}
            sx={{
              position: "absolute",
              right: 10,
              bottom: 10,
              padding: "5px",
              zIndex: 1,
              color: "primary.main",
              borderRadius: 1,
              transition: "transform 0.3s, background-color 0.4s",
            }}
            aria-label="expand"
          >
            <BiExpandAlt size="0.9rem" />
          </IconButton>
        </Box>
      </Box>
      <Dialog
        open={openAnchor}
        fullScreen={fullScreen}
        onClose={handleClose}
        aria-labelledby="edit-system-instructions-title"
        aria-describedby="edit-system-instructions-description"
        maxWidth="lg"
        TransitionComponent={Transition}
        sx={{
          "& .MuiPaper-root": {
            borderRadius: "12px",
          },
        }}
      >
        <DialogTitle id="edit-system-instructions-title">
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <Typography
              variant="body1"
              sx={{
                fontFamily: "'Montserrat', serif",
                fontWeight: "bold",
                fontSize: fullScreen ? "1rem" : "1.2rem",
              }}
            >
              Edit System Instructions
            </Typography>
            <IconButton
              onClick={handleGenDialOpen}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                color: "inherit",
                paddingY: 0.5,
                borderRadius: 2,
              }}
              aria-label="stars"
            >
              <BsStars size="1rem" style={{ marginBottom: 2.5 }} />
              <Typography variant="body2">Generate</Typography>
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <TextField
            disabled={isSysPending}
            id="outlined-multiline-static"
            onChange={handleInstructionsChange}
            multiline
            minRows={6}
            maxRows={20}
            placeholder={isSysPending ? "" : "You are a helpful assistant..."}
            value={instructionsInput}
            variant="outlined"
            fullWidth
            slotProps={{
              htmlInput: { className: "drawer-scrollbar" },
            }}
            sx={{
              minWidth: isMobile ? "300px" : isTablet ? "470px" : "650px",
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ marginBottom: 1, marginRight: 1 }}>
          <Button
            onClick={handleClose}
            variant="outlined"
            color="inherit"
            size="small"
            sx={{
              color:
                theme.palette.mode === "dark"
                  ? theme.palette.grey[400]
                  : theme.palette.text.primary,
              borderColor:
                theme.palette.mode === "dark"
                  ? theme.palette.grey[700]
                  : theme.palette.grey[300],
              backgroundColor:
                theme.palette.mode === "dark"
                  ? theme.palette.grey[700]
                  : theme.palette.grey[300],
              "&:hover": {
                borderColor: theme.palette.grey[500],
                backgroundColor: theme.palette.action.hover,
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              handleMutate();
              handleClose(true);
            }}
            autoFocus
            variant="contained"
            size="small"
            color="success"
            sx={{
              color: theme.palette.getContrastText(theme.palette.success.main),
              backgroundColor: theme.palette.success.main,
              "&:hover": {
                backgroundColor: theme.palette.success.dark,
              },
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
      {/* Generate Dialog */}
      <GeneratePopover
        open={generateOpen}
        anchorEl={generateDialogAnchorEl}
        handleClose={handleGenDialClose}
        mutate={sysInstructionsMutate}
        setIsGenerating={setIsGenerating}
        setContent={setInstructionsInput}
        closeDialog={handleClose}
        usage="System Instructions"
      />
    </>
  );
};

export default SystemInstructions;
