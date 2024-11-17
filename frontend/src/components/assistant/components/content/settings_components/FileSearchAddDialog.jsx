import React, { forwardRef } from "react";
import {
  useTheme,
  useMediaQuery,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Slide,
  Typography,
  Divider,
  Link,
} from "@mui/material";
import { IoIosImages } from "react-icons/io";

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const FileSearchAddDialog = ({ openDialog, handleClose }) => {
  const theme = useTheme();
  // No need for accounting drawer here
  // Since it can't be opened while the dialg is on
  const isTablet = useMediaQuery(`(max-width:815px)`);
  const isMobile = useMediaQuery(`(max-width:500px)`);
  const shouldDisplayText = useMediaQuery(theme.breakpoints.up(402));

  return (
    <Dialog
      open={openDialog}
      onClose={handleClose}
      aria-labelledby="edit-system-instructions-title"
      aria-describedby="edit-system-instructions-description"
      maxWidth="sm"
      TransitionComponent={Transition}
      sx={{
        "& .MuiPaper-root": {
          borderRadius: "12px",
        },
      }}
    >
      <DialogTitle id="edit-system-instructions-title">
        <Typography
          variant="body1"
          sx={{
            fontFamily: "'Montserrat', serif",
            fontWeight: "bold",
            fontSize: "1.1rem",
          }}
        >
          Attach files to file search
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            minWidth: isMobile ? "248px" : isTablet ? "375px" : "450px",
            minHeight: "200px",
            px: 4,
            py: isMobile ? 4 : isTablet ? 9 : 15,
            "& .MuiOutlinedInput-root": {
              borderRadius: 3,
            },
            "& .MuiOutlinedInput-input": {
              paddingY: 1.15,
            },
          }}
        >
          <IoIosImages
            style={{
              color: theme.palette.grey[500],
              fontSize: "80px",
            }}
          />
          <Typography
            sx={{
              fontFamily: "'Montserrat', serif",
              fontSize: "0.9rem",
              my: 2,
            }}
          >
            Drag your files here or{" "}
            <Typography
              component="span"
              sx={{
                fontSize: "inherit",
                textDecoration: "none",
                color: theme.palette.primary.main,
                fontFamily: "'Montserrat', serif",
                transition: "color 0.4s ease",
                "&:hover": {
                  cursor: "pointer",
                  color: theme.palette.primary.dark,
                },
              }}
              onClick={() => console.log("Upload clicked")}
            >
              click to upload.
            </Typography>
          </Typography>
          <Typography
            sx={{
              fontFamily: "'Montserrat', serif",
              fontSize: "0.8rem",
            }}
          >
            Information in attached files will be available to this assistant.
          </Typography>
            <Link
              href="https://platform.openai.com/docs/assistants/tools/file-search"
              target="_blank"
              rel="noopener"
              sx={{
                fontSize: "0.8rem",
                fontFamily: "'Montserrat', serif",
                textDecoration: "none",
                color: theme.palette.primary.main,
                "&:hover": {
                  textDecoration: "underline",
                },
              }}
            >
              Learn more.
            </Link>
        </Box>
      </DialogContent>
      <Divider sx={{ mx: theme.spacing(3) }} />
      <DialogActions
        sx={{
          paddingX: theme.spacing(3),
          paddingY: theme.spacing(2),
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* Left Side Button */}
        <Button
          onClick={() => {
            console.log("Select Vector Store clicked");
          }}
          variant="contained"
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
            textTransform: "none",
          }}
        >
          {shouldDisplayText && "Select "}Vector Store
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        {/* Right Side Buttons */}
        <Box
          sx={{
            display: "flex",
            gap: 1,
          }}
        >
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
              textTransform: "none",
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleClose}
            autoFocus
            variant="contained"
            disabled  // Mock for now
            size="small"
            color="success"
            sx={{
              color: theme.palette.getContrastText(theme.palette.success.main),
              backgroundColor: theme.palette.success.main,
              "&:hover": {
                backgroundColor: theme.palette.success.dark,
              },
              textTransform: "none",
            }}
          >
            Attach
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default FileSearchAddDialog;
