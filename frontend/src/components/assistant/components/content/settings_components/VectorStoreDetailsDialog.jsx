import React, { forwardRef, useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Typography,
  useMediaQuery,
  useTheme,
  TableContainer,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  TextField,
  Popover,
  CircularProgress,
  Slide,
} from "@mui/material";
import { LuPencil } from "react-icons/lu";
import { IoInformationCircleOutline } from "react-icons/io5";
import { RiHourglass2Fill } from "react-icons/ri";
import { InsertDriveFileOutlined, Add } from "@mui/icons-material";
import { GoTrash } from "react-icons/go";
import { useAssistantContext } from "../../../../../contexts/AssistantContext";
import { useVectorStoreFilesData } from "../../../../../hooks/assistant/useVectorStoreFileData";
import { formatFileSize } from "../../../../../utils/formatFileSize";
import { format } from "date-fns";
import { RiLinkM } from "react-icons/ri";
import CopyToClipboard from "react-copy-to-clipboard";
import { toast } from "react-toastify";
import { useUpdateVectorStore } from "../../../../../hooks/assistant/useUpdateVectorStore";
import { useUpdateAssistant } from "../../../../../hooks/assistant/useUpdateAssistant";
import { useDeleteVectorStore } from "../../../../../hooks/assistant/useDeleteVectorStore";
import { useDeleteFile } from "../../../../../hooks/assistant/useDeleteFile";

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const VectorStoreDetailsDialog = ({
  open,
  handleClose,
  openAddFilesDialog,
}) => {
  const { assistant } = useAssistantContext();
  const { vectorStore } = useAssistantContext();

  const { files } = useAssistantContext();
  const { data: vectorStoreFiles = [] } = useVectorStoreFilesData(
    vectorStore?.id
  );

  const { mutate: updateVectorStore, isPending: isUpdatingName } =
    useUpdateVectorStore();
  const { mutate: updateAssistant } = useUpdateAssistant();

  const {
    mutate: deleteVectorStore,
    isPending: isDeletingVs,
    isSuccess: deletedVs,
  } = useDeleteVectorStore();
  const {
    mutate: deleteFile,
    isPending: isDeletingFile,
    isSuccess: fileDeleted,
  } = useDeleteFile();

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(`(max-width:815px)`);
  const isMobile = useMediaQuery(`(max-width:500px)`);

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [idFileToDelete, setIdFileToDelete] = useState(""); // For updating UI when a file has to be removed in the useEffect

  const [title, setTitle] = useState(vectorStore?.name || "Untitled storage");
  const [isEditable, setIsEditable] = useState(false);
  const textFieldRef = useRef(null);

  const [popoverAnchorEl, setPopoverAnchorEl] = useState(null);
  const [popoverText, setPopoverText] = useState("Click to copy");

  const handlePopoverOpen = (event) => {
    setPopoverAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setPopoverAnchorEl(null);
    setPopoverText("Click to copy");
  };

  const isPopoverOpen = Boolean(popoverAnchorEl);

  const handleCopy = () => {
    setPopoverText("Copied!");
    setTimeout(() => {
      handlePopoverClose();
    }, 1500);
  };

  const setEditable = (value) => {
    setIsEditable(value);
  };

  useEffect(() => {
    if (!vectorStore) return;
    if (!files) return;

    // Filter files based on the presence of id in both files and vectorStoreFiles arrays
    const vsFiles = files.filter((file) =>
      vectorStoreFiles.some((vsFile) => file.id === vsFile.id)
    );

    setUploadedFiles((prev) => {
      if (JSON.stringify(prev) !== JSON.stringify(vsFiles)) {
        return vsFiles;
      }
      return prev;
    });
  }, [files, vectorStoreFiles, vectorStore]);

  // Focus the TextField when it becomes editable
  useEffect(() => {
    if (isEditable && textFieldRef.current) {
      if (!vectorStore.name) setTitle("");
      textFieldRef.current.focus();
    }
  }, [isEditable]);

  useEffect(() => {
    setTitle(vectorStore?.name || "Untitled storage");
  }, [vectorStore]);

  // Handler to exit edit mode and update the title
  const handleExitEditMode = () => {
    setIsEditable(false);
    if (!title.trim()) {
      setTitle(vectorStore?.name || "Untitled storage");
    } else if (title.length > 40) {
      toast.error("The name can't be more than 40 characters long.");
      setTitle(vectorStore?.name);
    } else {
      if (vectorStore && title !== vectorStore.name) {
        const updatedVectorStore = {
          name: title,
        };
        updateVectorStore({
          id: vectorStore.id,
          vectorStoreData: updatedVectorStore,
        });
      }
    }
  };

  // Handler for key down events
  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      setTitle(vectorStore?.name);
      event.preventDefault();
      setEditable(false);
    } else if (event.key === "Enter") {
      event.preventDefault();
      handleExitEditMode();
    }
  };

  const handleDetach = () => {
    handleClose();
    const updatedAssistant = {
      ...assistant,
      tool_resources: {
        ...assistant.tool_resources,
        file_search: {
          vector_store_ids: [],
        },
      },
    };
    updateAssistant({
      id: assistant.id,
      assistantData: updatedAssistant,
    });
  };

  const handleDelete = () => {
    deleteVectorStore(vectorStore.id);
  };

  const handleRemoveFile = (id) => {
    const fileToRemove = files.find((file) => file.id === id);

    if (fileToRemove) {
      setIdFileToDelete(fileToRemove.id);
      deleteFile(id);
    } else {
      toast.info("This file doesn't seem to exist.");
    }
  };

  // Close dialog when the vector store is deleted
  useEffect(() => {
    if (deletedVs) {
      handleDetach();
    }
  }, [deletedVs]);

  // Update the UI and remove the file when the mutation is completed
  useEffect(() => {
    if (fileDeleted) {
      setUploadedFiles((prevFiles) =>
        prevFiles.filter((file) => file.id != idFileToDelete)
      );
      setIdFileToDelete("");
    }
  }, [fileDeleted]);

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="select-vector-store-title"
        aria-describedby="select-vector-store-description"
        maxWidth="sm"
        disableEscapeKeyDown={isEditable}
        TransitionComponent={Transition}
        sx={{
          "& .MuiPaper-root": {
            borderRadius: "12px",
            margin: isMobile ? 1 : undefined,
          },
        }}
      >
        <DialogTitle id="select-vector-store-title">
          <Box
            sx={{ display: "flex", flexDirection: "row", alignItems: "center" }}
          >
            {isEditable ? (
              <TextField
                inputRef={textFieldRef}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleExitEditMode}
                onKeyDown={handleKeyDown}
                sx={{
                  fontFamily: "'Montserrat', serif",
                  fontWeight: "bold",
                  width: "100%",
                  fontSize: isMobile ? "0.9rem" : isTablet ? "1rem" : "1.1rem",
                  "& .MuiInputBase-input": {
                    padding: 1,
                    whiteSpace: "normal",
                    wordWrap: "break-word",
                  },
                }}
                variant="outlined"
                fullWidth
              />
            ) : (
              <Typography
                variant="body1"
                sx={{
                  fontFamily: "'Montserrat', serif",
                  fontWeight: "bold",
                  flexGrow: 1,
                  fontSize: isMobile ? "0.9rem" : isTablet ? "1rem" : "1.1rem",
                }}
              >
                {title}
                {isUpdatingName && (
                  <CircularProgress
                    size={17}
                    sx={{ marginLeft: "6px", verticalAlign: "middle" }}
                  />
                )}
              </Typography>
            )}
            {!isEditable && (
              <Button
                onClick={() => setEditable(true)}
                size="small"
                color="inherit"
                sx={{
                  minWidth: "unset",
                  ml: 3,
                }}
              >
                <LuPencil size={16} style={{ color: "inherit" }} />{" "}
              </Button>
            )}
          </Box>
        </DialogTitle>
        <DialogContent
          className="drawer-scrollbar"
          sx={{
            maxHeight: 600,
            overflowY: "auto",
          }}
        >
          {/* General Info */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1,
              minWidth: isMobile ? "248px" : isTablet ? "375px" : "450px",
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,
              },
              "& .MuiOutlinedInput-input": {
                paddingY: 1.15,
              },
            }}
          >
            {[
              {
                icon: <IoInformationCircleOutline />,
                label: "ID",
                content: vectorStore?.id,
              },
              {
                icon: <RiHourglass2Fill style={{ marginBottom: 1 }} />,
                label: "Expiration Policy",
                content: vectorStore?.expires_at || "Never",
              },
            ].map((row) => (
              <React.Fragment key={row.label}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      flex: 1,
                    }}
                  >
                    {row.icon}
                    <Typography
                      sx={{
                        fontFamily: "'Montserrat', serif",
                        fontWeight: "bold",
                        fontSize: isMobile
                          ? "0.8rem"
                          : isTablet
                          ? "0.85rem"
                          : "0.9rem",
                      }}
                    >
                      {row.label}
                    </Typography>
                  </Box>
                  {row.label === "ID" ? (
                    <CopyToClipboard text={row.content} onCopy={handleCopy}>
                      <Typography
                        onMouseEnter={
                          isEditable ? undefined : handlePopoverOpen
                        }
                        onMouseLeave={
                          isEditable ? undefined : handlePopoverClose
                        }
                        sx={{
                          fontFamily: "'Montserrat', serif",
                          cursor: isEditable ? "" : "pointer",
                          fontWeight: "normal",
                          fontSize: isMobile
                            ? "0.8rem"
                            : isTablet
                            ? "0.85rem"
                            : "0.9rem",
                          textAlign: "right",
                          wordBreak: "break-word",
                        }}
                      >
                        {row.content}
                      </Typography>
                    </CopyToClipboard>
                  ) : (
                    <Typography
                      sx={{
                        fontFamily: "'Montserrat', serif",
                        fontWeight: "normal",
                        fontSize: isMobile
                          ? "0.8rem"
                          : isTablet
                          ? "0.85rem"
                          : "0.9rem",
                        textAlign: "right",
                        wordBreak: "break-word",
                      }}
                    >
                      {row.content}
                    </Typography>
                  )}
                </Box>
                <Divider />
              </React.Fragment>
            ))}
            {/* Table of uploaded Files */}
            <TableContainer sx={{ overflowX: "auto", mt: 3 }}>
              <Table
                size="small"
                sx={{
                  tableLayout: "auto",
                }}
              >
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{
                        fontWeight: "bold",
                        borderBottom: "none",
                        padding: "4px 2px",
                        fontSize: {
                          xs: "0.7rem",
                          sm: "0.75rem",
                        },
                        fontFamily: "'Montserrat', serif",
                        whiteSpace: "nowrap",
                      }}
                    >
                      FILE
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        fontWeight: "bold",
                        borderBottom: "none",
                        padding: "4px 10px",
                        fontSize: {
                          xs: "0.7rem",
                          sm: "0.75rem",
                        },
                        fontFamily: "'Montserrat', serif",
                        whiteSpace: "nowrap",
                      }}
                    >
                      SIZE
                    </TableCell>
                    <TableCell
                      align="left"
                      sx={{
                        fontWeight: "bold",
                        borderBottom: "none",
                        padding: "4px 8px",
                        fontSize: {
                          xs: "0.7rem",
                          sm: "0.75rem",
                        },
                        fontFamily: "'Montserrat', serif",
                        whiteSpace: "nowrap",
                      }}
                    >
                      UPLOADED
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        borderBottom: "none",
                        padding: "4px 0px",
                        whiteSpace: "nowrap",
                      }}
                    ></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      sx={{ padding: 0, borderBottom: "none" }}
                    >
                      <Box
                        sx={{
                          width: "99%",
                          margin: "0 auto",
                          borderBottom: `1px solid ${theme.palette.divider}`,
                        }}
                      />
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {uploadedFiles.length ? (
                    uploadedFiles.map((file) => {
                      return (
                        <TableRow key={file.id}>
                          <TableCell
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              borderBottom: "none",
                              padding: "8px 0px",
                              whiteSpace: isSmallScreen ? "normal" : "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              maxWidth: isMobile
                                ? "120px"
                                : isTablet
                                ? "160px"
                                : "220px",
                            }}
                          >
                            <InsertDriveFileOutlined
                              fontSize="small"
                              sx={{
                                marginRight: "4px",
                                color:
                                  theme.palette.mode === "light"
                                    ? theme.palette.grey[700]
                                    : theme.palette.grey[400],
                              }}
                            />
                            <Typography
                              variant="body2"
                              sx={{
                                fontFamily: "'Montserrat', serif",
                                fontSize: {
                                  xs: "0.7rem",
                                  sm: "0.75rem",
                                },
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {file.filename}
                            </Typography>
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{
                              borderBottom: "none",
                              padding: "4px 10px",
                              whiteSpace: "nowrap",
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                fontFamily: "'Montserrat', serif",
                                fontSize: {
                                  xs: "0.7rem",
                                  sm: "0.75rem",
                                },
                              }}
                            >
                              {formatFileSize(file.bytes)}
                            </Typography>
                          </TableCell>
                          <TableCell
                            align="left"
                            sx={{
                              borderBottom: "none",
                              padding: "4px 8px",
                              whiteSpace: isSmallScreen ? "normal" : "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                fontFamily: "'Montserrat', serif",
                                fontSize: {
                                  xs: "0.7rem",
                                  sm: "0.75rem",
                                },
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {format(
                                new Date(file.created_at * 1000),
                                "MM/dd/yyyy, h:mm a"
                              )}
                            </Typography>
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{
                              borderBottom: "none",
                              padding: "4px 10px",
                            }}
                          >
                            <IconButton
                              size="small"
                              disabled={isDeletingFile}
                              onClick={() =>
                                isDeletingFile
                                  ? undefined
                                  : handleRemoveFile(file.id)
                              }
                            >
                              {isDeletingFile && file.id === idFileToDelete ? (
                                <CircularProgress
                                  size={15}
                                  sx={{
                                    verticalAlign: "middle",
                                  }}
                                />
                              ) : (
                                <GoTrash
                                  size="1rem"
                                  style={{
                                    color:
                                      theme.palette.mode === "light"
                                        ? isDeletingFile
                                          ? theme.palette.grey[400]
                                          : theme.palette.grey[900]
                                        : isDeletingFile
                                        ? theme.palette.grey[500]
                                        : theme.palette.grey[200],
                                  }}
                                />
                              )}
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        <Typography
                          sx={{
                            my: 3,
                            fontFamily: "'Montserrat', serif",
                            fontSize: isMobile
                              ? "0.8rem"
                              : isTablet
                              ? "0.85rem"
                              : "0.9rem",
                          }}
                        >
                          This vector store is empty.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<Add />}
              onClick={() => {
                handleClose();
                openAddFilesDialog();
              }}
              sx={{
                mb: 2,
                borderRadius: "10px",
                textTransform: "none",
                fontFamily: "'Montserrat', serif",
                borderColor:
                  theme.palette.mode === "dark"
                    ? theme.palette.grey[700]
                    : theme.palette.grey[300],
                color:
                  theme.palette.mode === "dark"
                    ? theme.palette.grey[300]
                    : theme.palette.text.primary,
                "&:hover": {
                  backgroundColor: theme.palette.action.hover,
                  borderColor: theme.palette.primary.main,
                },
              }}
            >
              Add
            </Button>
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
          <Button
            onClick={handleDelete}
            variant="contained"
            size="small"
            sx={{
              paddingX: 1,
              paddingY: 0.8,
              minWidth: "auto",
              color: "inherit",
              backgroundColor: (theme) => theme.palette.error.light,
              "&:hover": {
                backgroundColor: (theme) => theme.palette.error.dark,
              },
              textTransform: "none",
            }}
          >
            {isDeletingVs ? (
              <CircularProgress
                size={17}
                color="inherit"
                sx={{ verticalAlign: "middle" }}
              />
            ) : (
              <GoTrash size={18} />
            )}
          </Button>
          <Button
            onClick={handleDetach}
            variant="contained"
            size="small"
            startIcon={<RiLinkM size={23} style />}
            sx={{
              paddingLeft: 1,
              paddingRight: 2,
              paddingY: 0.5,
              minWidth: "auto",
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
            <Typography
              sx={{
                fontFamily: "'Montserrat', serif",
                fontSize: isMobile ? "0.7rem" : "0.95rem",
              }}
            >
              Detach from assistant
            </Typography>
          </Button>
          <Box sx={{ flexGrow: 1 }} />
          {/* Right Side Buttons */}
          <Button
            onClick={handleClose}
            autoFocus
            variant="contained"
            size="small"
            color="success"
            sx={{
              backgroundColor: theme.palette.success.main,
              "&:hover": {
                backgroundColor: theme.palette.success.dark,
              },
              textTransform: "none",
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
      {/* Copy Popover */}
      <Popover
        id="mouse-over-popover"
        sx={{
          pointerEvents: "none",
          "& .MuiPaper-root": {
            backgroundColor: theme.palette.mode === "light" ? "black" : "white",
            color: theme.palette.mode === "light" ? "white" : "black",
            borderRadius: "8px",
            padding: "4px 8px",
          },
        }}
        open={isPopoverOpen}
        anchorEl={popoverAnchorEl}
        onClose={handlePopoverClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        disableRestoreFocus
      >
        <Typography variant="body2">{popoverText}</Typography>
      </Popover>
    </>
  );
};

export default VectorStoreDetailsDialog;
