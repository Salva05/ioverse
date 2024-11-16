import React, { useState, forwardRef, useContext } from "react";
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
} from "@mui/material";
import { BiExpandAlt } from "react-icons/bi";
import { BsStars } from "react-icons/bs";
import { DrawerContext } from "../../../../../contexts/DrawerContext";

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

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
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
            >
              <BsStars size="1rem" />
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
          <TextField
            id="outlined-basic"
            placeholder="You are a helpful assistant..."
            variant="outlined"
            multiline
            rows={4}
            defaultValue="John Doe is a helpful assistant.."
            slotProps={{
              htmlInput: { className: "drawer-scrollbar" },
            }}
            sx={{
              minWidth: isMobile ? "300px" : isTablet ? "375px" : "450px",
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,
              },
              "& .MuiOutlinedInput-input": {
                paddingY: 1.15,
              },
            }}
          />
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
            id="outlined-multiline-static"
            multiline
            minRows={6}
            maxRows={20}
            placeholder="You are a helpful assistant..."
            value={"You are a helpful assistant..."}
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
              "& .MuiOutlinedInput-input": {
                paddingY: 1.15,
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ marginBottom: 1, marginRight: 1 }}>
          <Button
            onClick={handleClose}
            variant="outlined"
            color="inherit" // Use a neutral color for Cancel
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
            onClick={handleClose}
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
    </>
  );
};

export default SystemInstructions;
