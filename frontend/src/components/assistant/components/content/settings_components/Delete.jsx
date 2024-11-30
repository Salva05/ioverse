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
import React, { useContext, forwardRef, useState } from "react";
import { DrawerContext } from "../../../../../contexts/DrawerContext";
import { FaRegTrashAlt } from "react-icons/fa";
import { useAssistantContext } from "../../../../../contexts/AssistantContext";
import { useDeleteAssistant } from "../../../../../hooks/assistant/useDeleteAssistant";
import CircularProgress from "@mui/material/CircularProgress";

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const drawerWidth = 240;

const Delete = () => {
  const theme = useTheme();
  const { open, isSmallScreen } = useContext(DrawerContext);
  const isMobile = useMediaQuery(
    isSmallScreen
      ? `(max-width:815px)`
      : `(max-width:${open ? 815 + drawerWidth : 815}px)`
  );

  const { assistant } = useAssistantContext();
  const { mutate, isPending } = useDeleteAssistant();

  // Confirm Delete Dialog
  const [openDialog, setOpenDialog] = useState(false);

  const hanldeOpenDialog = () => {
    setOpenDialog(true);
  };
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleDelete = () => {
    mutate(
      { id: assistant.id },
      {
        onSuccess: () => {
          handleCloseDialog();
        },
      }
    );
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        flexDirection: "row",
        gap: 1,
        ml: isMobile ? 0.4 : 1.2,
        mt: 1,
      }}
    >
      <Typography
        variant="body1"
        sx={{
          fontFamily: "'Montserrat', serif",
        }}
      >
        Delete Assistant
      </Typography>
      <Box sx={{ marginLeft: "auto", display: "flex", alignItems: "center" }}>
        <Button
          size="small"
          onClick={hanldeOpenDialog}
          sx={{
            textTransform: "none",
            borderRadius: 2.3,
            minWidth: 0,
            pr: 1,
            py: 0.3,
            pl: 0.7,
            backgroundColor: theme.palette.error.main,
            color: theme.palette.common.white,
            "&:hover": {
              backgroundColor: theme.palette.error.dark,
            },
            "&:focus": {
              boxShadow: `0 0 0 4px ${theme.palette.error.light}`,
            },
          }}
        >
          <FaRegTrashAlt size="1rem" style={{ marginRight: 3 }} />
          <Typography
            sx={{
              fontSize: "0.95rem",
              fontFamily: "'Montserrat', serif",
            }}
          >
            Delete
          </Typography>
        </Button>
      </Box>

      {/* Delete Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        aria-labelledby="confirm-delete-title"
        aria-describedby="confirm-delete-description"
        maxWidth="sm"
        TransitionComponent={Transition}
        sx={{
          "& .MuiPaper-root": {
            borderRadius: "12px",
          },
        }}
      >
        <DialogTitle id="confirm-delete-title">
          <Typography
            variant="body1"
            sx={{
              fontFamily: "'Montserrat', serif",
              fontWeight: "bold",
              fontSize: "1.1rem",
            }}
          >
            Delete Assistant?
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography
            sx={{
              fontFamily: "'Montserrat', serif",
              fontSize: "0.9rem",
              wordWrap: "break-word",
              my: 2,
            }}
          >
            This change will affect all API integrations using
            asst_UAoDUk63bOUe35Lhc7KeYvZP. It cannot be undone.
          </Typography>
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
          <Box sx={{ flexGrow: 1 }} />
          <Box
            sx={{
              display: "flex",
              gap: 1,
            }}
          >
            <Button
              onClick={handleCloseDialog}
              variant="outlined"
              color="inherit"
              size="small"
              sx={{
                borderRadius: 2.3,
                fontFamily: "'Montserrat', serif",
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
              onClick={handleDelete}
              autoFocus
              variant="contained"
              size="small"
              disabled={isPending}
              sx={{
                textTransform: "none",
                fontFamily: "'Montserrat', serif",
                borderRadius: 2.3,
                backgroundColor: theme.palette.error.main,
                color: theme.palette.common.white,
                "&:hover": {
                  backgroundColor: theme.palette.error.dark,
                },
                "&:focus": {
                  boxShadow: `0 0 0 4px ${theme.palette.error.light}`,
                },
                overflow: "hidden",
                minWidth: 40,
                height: 36,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {isPending ? (
                <CircularProgress
                  size={20}
                  color="inherit"
                  sx={{
                    color: theme.palette.common.white,
                  }}
                />
              ) : (
                "Delete"
              )}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Delete;
