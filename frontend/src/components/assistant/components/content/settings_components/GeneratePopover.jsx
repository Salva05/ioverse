import {
  Popover,
  Box,
  Button,
  TextareaAutosize,
  useTheme,
  Typography,
} from "@mui/material";
import React, { useContext, useState } from "react";
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
import { DrawerContext } from "../../../../../contexts/DrawerContext";
import { encode } from "he";

const GeneratePopover = ({
  open,
  anchorEl,
  handleClose,
  mutate,
  setIsGenerating,
  setInstructionsInput,
  closeDialog
}) => {
  const theme = useTheme();
  const { isSmallScreen } = useContext(DrawerContext);

  const [prompt, setPrompt] = useState("");

  const handleSubmit = async () => {
    const sanitizedPrompt = encode(prompt);
    setInstructionsInput("");
    setIsGenerating(true);
    const message = {
      prompt: sanitizedPrompt
    }
    mutate(message);
    handleClose();
    closeDialog();
    setPrompt("");
  };

  return (
    <Popover
      id="generate-popover"
      open={open}
      anchorEl={anchorEl}
      onClose={handleClose}
      sx={{
        "& .MuiPaper-root": {
          width: "350px",
          wordWrap: "break-word",
          borderRadius: "8px",
          padding: "10px",
          backgroundImage: `linear-gradient(to bottom, ${
            theme.palette.mode === "dark"
              ? theme.palette.grey[800]
              : theme.palette.grey[200]
          }, ${
            theme.palette.mode === "dark"
              ? theme.palette.grey[900]
              : theme.palette.common.white
          })`,
          color: theme.palette.text.primary,
          boxShadow: theme.shadows[3],
        },
      }}
      anchorOrigin={
        isSmallScreen
          ? { vertical: "center", horizontal: "center" }
          : { vertical: "center", horizontal: "right" }
      }
      transformOrigin={
        isSmallScreen
          ? { vertical: "center", horizontal: "center" }
          : { vertical: "center", horizontal: "left" }
      }
      slotProps={{
        paper: {
          style: {
            marginLeft: isSmallScreen ? "0px" : "10px",
          },
        },
      }}
      aria-hidden={false}
    >
      <Box>
        <TextareaAutosize
          className="drawer-scrollbar"
          minRows={4}
          maxRows={15}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          style={{
            width: "100%",
            resize: "none",
            padding: "8px",
            fontSize: "13.5px",
            lineHeight: "1.5",
            borderRadius: "4px",
            backgroundColor: "transparent",
            color: theme.palette.text.primary,
            outline: "none",
            border: "none",
            boxSizing: "border-box",
          }}
          placeholder="What would you like the model to do?"
        />
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "8px",
          }}
        >
          <Typography
            sx={{
              fontFamily: "'Montserrat', serif",
              fontSize: "0.8rem",
              color: theme.palette.text.secondary,
              ml: 1,
            }}
          >
            Beta
          </Typography>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="success"
            sx={{
              px: 0.5,
              py: 0.3,
              display: "flex",
              alignItems: "center",
              textTransform: "none",
              fontSize: "12px",
              fontFamily: "'Montserrat', serif",
            }}
          >
            Generate
            <DriveFileRenameOutlineIcon
              sx={{ ml: 0.5, fontSize: "16px" }}
            />{" "}
          </Button>
        </Box>
      </Box>
    </Popover>
  );
};

export default GeneratePopover;
