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
} from "@mui/material";
import DragFilesContent from "../settings_components/DragFilesContent";
import FileListContent from "../settings_components/FileListContent";
import { useCreateFile } from "../../../../../hooks/assistant/useCreateFile";
import { toast } from "react-toastify";
import { useDeleteFile } from "../../../../../hooks/assistant/useDeleteFile";
import { v4 as uuidv4 } from "uuid";
import { truncateText } from "../../../../../utils/textUtils";

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const FileAddDialog = ({
  openDialog,
  handleClose,
  closeMenu,
  handleAttach,
  uploadedFiles,
  setUploadedFiles,
  isFileSearch,
}) => {
  const theme = useTheme();

  const createFileMutation = useCreateFile();
  const deleteFileMutation = useDeleteFile();

  // No need for accounting drawer here
  // Since it can't be opened while the dialg is on
  const isTablet = useMediaQuery(`(max-width:815px)`);
  const isMobile = useMediaQuery(`(max-width:500px)`);

  const handleFiles = async (files) => {
    const fileArray = Array.from(files);
    const uploadPromises = fileArray.map(async (file) => {
      const id = uuidv4();

      // Check if the file already exists in uploadedFiles based on name and size
      const isDuplicate = uploadedFiles.some(
        (entry) =>
          entry.file.name === file.name && entry.file.size === file.size
      );
      if (isDuplicate) {
        toast.error(
          `The file "${truncateText(file.name, 14)}" has already been uploaded.`
        );
        return;
      }

      // Initially in 'loading' status
      setUploadedFiles((prevFiles) => [
        ...prevFiles,
        {
          id,
          file,
          status: "loading",
          type: isFileSearch ? "file_search" : "code_interpreter",
        },
      ]);

      // Prepare form data
      const formData = new FormData();
      formData.append("file", file);
      formData.append("purpose", "assistants");

      try {
        const data = await createFileMutation.mutateAsync(formData);

        // Update the file's status to 'success'
        setUploadedFiles((prevFiles) =>
          prevFiles.map((entry) =>
            entry.id === id ? { ...entry, status: "success", data } : entry
          )
        );
      } catch (error) {
        setUploadedFiles((prevFiles) =>
          prevFiles.map((entry) =>
            entry.id === id ? { ...entry, status: "error" } : entry
          )
        );
      }
    });

    // Execute all upload promises
    await Promise.all(uploadPromises);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleRemoveFile = (index, backendId) => {
    const fileToRemove = uploadedFiles[index];
    if (fileToRemove) {
      // Remove from state
      setUploadedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));

      if (backendId) {
        deleteFileMutation.mutate(backendId);
      }
    }
  };

  return (
    <Dialog
      open={openDialog}
      onClose={(event, reason) => {
        if (
          (reason === "backdropClick" || reason === "escapeKeyDown") &&
          uploadedFiles.length
        ) {
          toast.info(
            "Files not yet enabled for retrieval.\n Make sure to attach them to the thread."
          );
        }
        handleClose();
        closeMenu();
      }}
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
          {isFileSearch
            ? "Attach files to file search"
            : "Attach files to code interpreter"}
        </Typography>
      </DialogTitle>
      <DialogContent
        className="drawer-scrollbar"
        sx={{
          maxHeight: 600,
          overflowY: "auto",
          mr: 0.3,
        }}
      >
        {uploadedFiles.length === 0 ? (
          // No File Uploaded
          <DragFilesContent
            isMobile={isMobile}
            isTablet={isTablet}
            handleFiles={handleFiles}
            handleDragOver={handleDragOver}
            handleDrop={handleDrop}
            isAssistant={false}
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

        <Box sx={{ flexGrow: 1 }} />
        {/* Right Side Buttons */}
        <Box
          sx={{
            display: "flex",
            gap: 1,
          }}
        >
          <Button
            onClick={() => {
              // Perform batch deletion of all uploaded files
              uploadedFiles.forEach((entry) => {
                if (entry.status === "success" && entry.data && entry.data.id) {
                  deleteFileMutation.mutate(entry.data.id);
                }
              });
              setUploadedFiles([]);
              handleClose();
              closeMenu();
            }}
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
            onClick={(e) => {
              handleAttach(
                e,
                isFileSearch ? "file_search" : "code_interpreter"
              );
              handleClose();
              closeMenu();
            }}
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

export default FileAddDialog;
