import React, { forwardRef, useState } from "react";
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
import DragFilesContent from "./DragFilesContent";
import FileListContent from "./FileListContent";
import { getCurrentTime } from "../../../../../utils/getCurrentTime";

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const FileSearchAddDialog = ({
  openDialog,
  handleClose,
  vectorStoreButton,
}) => {
  const theme = useTheme();
  // No need for accounting drawer here
  // Since it can't be opened while the dialg is on
  const isTablet = useMediaQuery(`(max-width:815px)`);
  const isMobile = useMediaQuery(`(max-width:500px)`);
  const shouldDisplayText = useMediaQuery(theme.breakpoints.up(402));

  // State to manage uploaded files
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleFiles = (files) => {
  const filesArray = Array.from(files).map((file) => ({
    file,
    uploadedAt: getCurrentTime(),
  }));
  setUploadedFiles((prevFiles) => [...prevFiles, ...filesArray]);
};

  const handleDrop = (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleRemoveFile = (index) => {
    setUploadedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const handleAttach = () => {
    // Yet to be implemented
    console.log("Files to attach:", uploadedFiles);
    handleClose();
  };

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
          margin: isMobile ? 1 : undefined,
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
        {uploadedFiles.length === 0 ? (
          // No File Uploaded
          <DragFilesContent
            isMobile={isMobile}
            isTablet={isTablet}
            handleFiles={handleFiles}
            handleDragOver={handleDragOver}
            handleDrop={handleDrop}
          />
        ) : (
          // Uploaded Files
          <FileListContent
            handleDragOver={handleDragOver}
            handleDrop={handleDrop}
            uploadedFiles={uploadedFiles}
            handleRemoveFile={handleRemoveFile}
            handleFiles={handleFiles}
            isMobile={isMobile}
            isTablet={isTablet}
          />
        )}
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
        {vectorStoreButton && (
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
        )}
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
            onClick={handleAttach}
            autoFocus
            variant="contained"
            disabled={!uploadedFiles || uploadedFiles.length === 0}
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
