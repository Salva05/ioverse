import React, { forwardRef, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  InputAdornment,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { TbDatabaseSearch, TbSearch } from "react-icons/tb";
import { useAssistantContext } from "../../../../../contexts/AssistantContext";
import { formatFileSize } from "../../../../../utils/formatFileSize";
import formatTimestamp from "../../../../../utils/formatTimestamp";
import { useUpdateAssistant } from "../../../../../hooks/assistant/useUpdateAssistant";

const VectorStoreSelectionDialog = ({ open, handleClose }) => {
  const { assistant } = useAssistantContext();
  const updateAssistant = useUpdateAssistant();

  const isTablet = useMediaQuery(`(max-width:815px)`);
  const isMobile = useMediaQuery(`(max-width:500px)`);
  const theme = useTheme();

  const { vectorStores } = useAssistantContext();
  const [queriedVs, setQueriedVs] = useState(null);
  const [notFound, setNotFound] = useState(false);

  const handleQuery = (event) => {
    const query = event.target.value.trim();
    if (!query) {
      setNotFound(false);
      setQueriedVs(null);
      return;
    }
    const matchedStore = vectorStores.find(
      (vs) => vs.id.toLowerCase() === query.toLowerCase()
    );
    if (matchedStore) {
      setNotFound(false);
      setQueriedVs(matchedStore);
    } else {
      setNotFound(true);
      setQueriedVs(null);
    }
  };

  // Attach the Vector Store to the Active Assistant
  const handleAttach = () => {
    const updatedAssistant = {
      ...assistant,
      tool_resources: {
        ...assistant.tool_resources,
        file_search: {
          vector_store_ids: [queriedVs.id],
        },
      },
    };
    updateAssistant.mutate({
      id: assistant.id,
      assistantData: updatedAssistant,
    });
    handleClose(true);
    setNotFound(false);
    setQueriedVs(null);
  };

  return (
    <Dialog
      open={open}
      onClose={(event, reason) => {
        if (reason === "backdropClick" || reason === "escapeKeyDown") {
          handleClose(true);
        } else {
          handleClose(false);
        }
        setNotFound(false);
        setQueriedVs(null);
      }}
      aria-labelledby="select-vector-store-title"
      aria-describedby="select-vector-store-description"
      maxWidth="sm"
      sx={{
        "& .MuiPaper-root": {
          borderRadius: "12px",
          margin: isMobile ? 1 : undefined,
        },
        "& .MuiDialog-container": {
          transition: "opacity 0.4s ease-in-out !important",
        },
      }}
    >
      <DialogTitle id="select-vector-store-title">
        <Typography
          variant="body1"
          sx={{
            fontFamily: "'Montserrat', serif",
            fontWeight: "bold",
            fontSize: "1.1rem",
          }}
        >
          Attach vector store
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
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            minWidth: isMobile ? "248px" : isTablet ? "375px" : "450px",
            minHeight: "412px",
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
          <TbDatabaseSearch
            style={{
              color: theme.palette.grey[500],
              fontSize: "80px",
            }}
          />
          <Typography
            sx={{
              fontFamily: "'Montserrat', serif",
              fontSize: "0.9rem",
              fontWeight: "bold",
              my: 2,
            }}
          >
            Select existing vector store
          </Typography>
          <TextField
            placeholder="Search files..."
            onChange={handleQuery}
            variant="outlined"
            fullWidth
            size="small"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <TbSearch />
                  </InputAdornment>
                ),
              },
            }}
          />
          {/* Vector Store Queried */}
          {queriedVs && (
            <Box
              onClick={() => {
                console.log("yet to be implemented");
              }}
              sx={{
                flexDirection: "column",
                width: "100%",
                backgroundColor: (theme) => theme.palette.background.paper,
                borderRadius: 2,
                padding: 1.5,
                marginTop: 1,
                border: "1px solid",
                color: (theme) => theme.palette.text.primary,
                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)",
                "&:hover": {
                  backgroundColor: (theme) =>
                    theme.palette.mode === "dark"
                      ? theme.palette.grey[800]
                      : theme.palette.grey[300],
                  transform: "scale(1.02)",
                  cursor: "pointer",
                },
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  fontFamily: "'Montserrat', serif",
                  fontSize: isMobile ? "0.75rem" : "0.83rem",
                  fontWeight: "bold",
                }}
              >
                {queriedVs?.name || queriedVs.id}
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: "'Montserrat', serif",
                    fontSize: isMobile ? "0.7rem" : "0.8rem",
                    color: (theme) => theme.palette.text.secondary,
                    mr: 1,
                  }}
                >
                  {formatTimestamp(queriedVs.created_at)}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: "'Montserrat', serif",
                    fontSize: isMobile ? "0.7rem" : "0.8rem",
                    color: (theme) => theme.palette.text.secondary,
                  }}
                >
                  {formatFileSize(queriedVs.usage_bytes)}
                </Typography>
              </Box>
            </Box>
          )}
          {notFound && (
            <Typography
              variant="body2"
              sx={{
                fontFamily: "'Montserrat', serif",
                fontSize: isMobile ? "0.7rem" : "0.8rem",
                marginTop: 2,
                color: (theme) => theme.palette.text.secondary,
              }}
            >
              No vector stores found with this id
            </Typography>
          )}
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
          onClick={() => {
            handleClose(false);
            setNotFound(false);
            setQueriedVs(null);
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
          Back
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
            onClick={() => handleClose(true)}
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
            disabled={queriedVs === undefined || queriedVs === null}
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
            Select
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default VectorStoreSelectionDialog;
