import {
  Box,
  Button,
  CircularProgress,
  Divider,
  ListItemIcon,
  Menu,
  MenuItem,
  Typography,
  useTheme,
} from "@mui/material";
import React, { useContext, useState } from "react";
import { useAssistantContext } from "../../../../../contexts/AssistantContext";
import { DrawerContext } from "../../../../../contexts/DrawerContext";
import { HiOutlineSelector } from "react-icons/hi";
import CheckIcon from "@mui/icons-material/Check";

const ThreadText = ({ isThreadPending }) => {
  const theme = useTheme();
  const { isSmallScreen } = useContext(DrawerContext);

  const { threads, thread, setThread } = useAssistantContext();

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleCreate = () => {
    // will be defined later
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: isThreadPending
          ? "row"
          : isSmallScreen
          ? "column"
          : "row",
        alignItems: "flex-start",
        gap: isSmallScreen ? 0 : 1,
      }}
    >
      <Typography
        sx={{
          fontFamily: "'Montserrat', serif",
          fontSize: isSmallScreen ? "0.9rem" : "1rem",
        }}
      >
        THREAD
      </Typography>
      <Button
        color="inherit"
        sx={{
          textTransform: "none",
          display: "flex",
          alignItems: isThreadPending
            ? "center"
            : isSmallScreen
            ? "flex-start"
            : "center",
          justifyContent: isThreadPending
            ? "center"
            : isSmallScreen
            ? "flex-start"
            : "center",
          alignSelf: isThreadPending
            ? "center"
            : isSmallScreen
            ? "flex-start"
            : "center",
          py: 0.3,
          px: 0,
        }}
        onClick={threads.length > 0 ? handleClick : handleCreate}
      >
        {isThreadPending ? (
          <CircularProgress size={18} />
        ) : (
          <>
            <Typography
              sx={{
                fontFamily: "'Montserrat', serif",
                fontSize: isSmallScreen ? "0.8rem" : "0.9rem",
                color: theme.palette.text.secondary,
              }}
            >
              {thread?.id || "New thread"}
            </Typography>
            <HiOutlineSelector
              size="1.1em"
              style={{ marginLeft: 5, color: theme.palette.text.secondary }}
            />
          </>
        )}
      </Button>
      {/* Selection Menu */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
        sx={{
          "& .MuiMenu-paper": {
            borderRadius: 2.5,
            border: "1px solid",
            borderColor: (theme) => theme.palette.divider,
          },
        }}
      >
        {threads.map((item, index) => (
          <MenuItem
            key={item.id}
            onClick={() => {
              setThread(item);
              handleClose();
            }}
            sx={{
              mx: 0.5,
              borderRadius: 2,
              fontSize: "0.93rem",
              padding: "3px 8px",
            }}
          >
            <ListItemIcon sx={{ mr: -1.5 }}>
              {item.id === thread?.id && (
                <CheckIcon sx={{ fontSize: "1.1rem", mb: 0.4 }} />
              )}
            </ListItemIcon>
            <Typography
              sx={{
                fontSize: "inherit",
                fontFamily: "'Montserrat', serif",
                maxWidth: 330,
                whiteSpace: "normal",
                wordWrap: "break-word",
                overflowWrap: "break-word",
              }}
            >
              {item?.name ?? item?.id}
            </Typography>
          </MenuItem>
        ))}
        <Divider />
        <MenuItem
          onClick={() => {
            setThread(null);
            handleClose();
          }}
          sx={{
            mx: 0.5,
            borderRadius: 2,
            fontSize: "0.93rem",
            justifyContent: "center",
            padding: "3px 8px",
            my: -0.2,
          }}
        >
          <Typography
            sx={{
              fontSize: "inherit",
              fontFamily: "'Montserrat', serif",
            }}
          >
            New thread
          </Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ThreadText;
