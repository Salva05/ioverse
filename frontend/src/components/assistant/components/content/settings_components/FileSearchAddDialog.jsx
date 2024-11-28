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
import DragFilesContent from "./DragFilesContent";
import FileListContent from "./FileListContent";
import { useCreateFile } from "../../../../../hooks/assistant/useCreateFile";
import { toast } from "react-toastify";
import { useDeleteFile } from "../../../../../hooks/assistant/useDeleteFile";
import { v4 as uuidv4 } from "uuid";
import { truncateText } from "../../../../../utils/textUtils";
import { useCreateVectorStore } from "../../../../../hooks/assistant/useCreateVectorStore";
import { useUpdateAssistant } from "../../../../../hooks/assistant/useUpdateAssistant";
import { useQueryClient } from "@tanstack/react-query";
import { connectToSSE } from "../../../../../services/connectToSSE";
import { useCreateVectorStoreBatch } from "../../../../../hooks/assistant/useCreateVectorStoreBatch";
import { vectorStore as vs } from "../../../../../api/assistant";
import { useAssistantContext } from "../../../../../contexts/AssistantContext";

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const FileSearchAddDialog = ({
  handleSelectVectorStore,
  openDialog,
  handleClose,
  vectorStoreButton,
  vectorStore,
  assistant,
}) => {
  const queryClient = useQueryClient();
  const theme = useTheme();

  const updateAssistant = useUpdateAssistant();
  const { setVectorStore } = useAssistantContext();

  const createFileMutation = useCreateFile();
  const deleteFileMutation = useDeleteFile();
  const createVectorStoreMutation = useCreateVectorStore();
  const createBatch = useCreateVectorStoreBatch();

  // No need for accounting drawer here
  // Since it can't be opened while the dialg is on
  const isTablet = useMediaQuery(`(max-width:815px)`);
  const isMobile = useMediaQuery(`(max-width:500px)`);
  const shouldDisplayText = useMediaQuery(theme.breakpoints.up(402));

  // State to manage uploaded files
  const [uploadedFiles, setUploadedFiles] = useState([]);

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
        { id, file, status: "loading" },
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

  const handleAttach = () => {
    // Extract IDs for only successfully uploaded files
    const filesIds = uploadedFiles
      .filter((entry) => entry.status === "success")
      .map((entry) => entry.data.id);

    // Case if no vector store is active on the assistant
    if (!vectorStore) {
      // Populate an array of file ids
      const vectorStoreData = {
        file_ids: filesIds,
        name: `Vector Store for ${assistant?.name || assistant.id}`,
        poll_for_uploads: true, // Enable SSE polling
      };

      createVectorStoreMutation.mutate(vectorStoreData, {
        onSuccess: (data) => {
          // Update the cached list of Vector Stores
          queryClient.setQueryData(["vectorStores"], (oldData) => {
            return oldData
              ? [...oldData, data.vector_store]
              : [data.vector_store];
          });

          // Attach the Vector Store to the Active Assistant
          const updatedAssistant = {
            ...assistant,
            tool_resources: {
              ...assistant.tool_resources,
              file_search: {
                vector_store_ids: [data.vector_store.id],
              },
            },
          };
          updateAssistant.mutate({
            id: assistant.id,
            assistantData: updatedAssistant,
          });

          // Start SSE if polling is enabled
          if (data.sse_url) {
            const sseConnection = connectToSSE(
              data.sse_url, // URL for the connection
              // Callback for progresses
              (sse) => {
                // Update the active Vector Store's file uploaded
                queryClient.setQueryData(["vectorStores"], (oldData) => {
                  if (!oldData) return [];
                  return oldData.map((item) =>
                    item.id === data.vector_store.id
                      ? {
                          ...item,
                          file_counts: sse.file_counts,
                          status: sse.status,
                        }
                      : item
                  );
                });
              },
              // Callback for errors
              (error) => {
                console.error("SSE Error:", error);
                toast.error("Error in upload progress updates.");
              },
              // Callback for completion
              (sse) => {
                // Update the active Vector Store's file uploaded
                queryClient.setQueryData(["vectorStores"], (oldData) => {
                  if (!oldData) return [];
                  return oldData.map((item) =>
                    item.id === data.vector_store.id
                      ? {
                          ...item,
                          usage_bytes: sse.usage_bytes,
                          file_counts: sse.file_counts,
                          status: sse.status,
                        }
                      : item
                  );
                });
              }
            );
          }
        },
      });
    } else {
      // Case if vector store is already active on the assitant
      // Create a Vector Store Batch
      const batch = {
        vector_store_id: vectorStore.id,
        file_ids: filesIds,
      };

      createBatch.mutate(batch, {
        onSuccess: (data) => {
          const sseConnection = connectToSSE(
            data?.sse_url, // URL for the connection
            // Callback for progresses
            (sse) => {
              // Snapshot of flie_counts to have constant values for vector store at each SSE update
              const vs_file_counts = {
                total: vectorStore.file_counts.total,
                completed: vectorStore.file_counts.completed,
              };
              // Update the active Vector Store's file uploaded
              queryClient.setQueryData(["vectorStores"], (oldData) => {
                if (!oldData) return [];
                return oldData.map((item) =>
                  item.id === data.vector_store_id
                    ? {
                        ...item,
                        file_counts: {
                          ...item.file_counts,
                          completed:
                            vs_file_counts.completed +
                            sse.file_counts.completed,
                          total: vs_file_counts.total + sse.file_counts.total,
                        },
                        status: sse.status,
                      }
                    : item
                );
              });
            },
            // Callback for errors
            (error) => {
              console.error("SSE Error:", error);
              toast.error("Error in upload progress updates.");
            },
            // Callback for completion
            async (sse) => {
              // Update the Vector Stores query and the active Vector Store
              try {
                // Retrieve the updated vector store and set it as active
                const updatedVectorStore = await vs.retrieve(vectorStore.id);
                setVectorStore(updatedVectorStore);
                queryClient.setQueryData(["vectorStores"], (oldData) => {
                  if (!oldData) return [];
                  return oldData.map((item) =>
                    item.id === data.vector_store_id ? updatedVectorStore : item
                  );
                });
              } catch (error) {
                console.error("Error retrieving the Vector Store:", error);
                toast.error("Failed to retrieve the updated Vector Store.");
              }
              // Update vector store files whenever accessed
              queryClient.invalidateQueries([
                "vectorStoreFiles",
                vectorStore.id,
              ]);
            }
          );
        },
      });
    }

    setUploadedFiles([]);
    handleClose();
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
            "Files not yet enabled for retrieval.\n Make sure to attach them to a vector store."
          );
        }
        handleClose();
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
          {!vectorStore
            ? "Attach files to file search"
            : "Attach files to vector store"}
        </Typography>
        {vectorStore ? (
          <Typography
            variant="body1"
            sx={{
              fontFamily: "'Montserrat', serif",
              fontSize: "0.9rem",
              color: (theme) => theme.palette.text.secondary,
            }}
          >
            {vectorStore.id}
          </Typography>
        ) : (
          ""
        )}
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
        {!vectorStore && vectorStoreButton && (
          <Button
            onClick={handleSelectVectorStore}
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
            onClick={() => {
              // Perform batch deletion of all uploaded files
              uploadedFiles.forEach((entry) => {
                if (entry.status === "success" && entry.data && entry.data.id) {
                  deleteFileMutation.mutate(entry.data.id);
                }
              });
              setUploadedFiles([]);
              handleClose();
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
