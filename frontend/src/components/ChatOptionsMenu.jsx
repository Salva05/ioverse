import * as React from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { IconButton, Box, Tooltip, Fade } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import SaveIcon from "@mui/icons-material/Save";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import ShareIcon from "@mui/icons-material/Share";
import SettingsSharpIcon from "@mui/icons-material/SettingsSharp";
import { ConversationContext } from "../contexts/ConversationContext";
import ShareLinkDialog from "./ShareLinkDialog";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Fade {...props} ref={ref} timeout={800} />;
});

export default function ChatOptionsMenu({ conversationId }) {
  const { setActiveConversation } = React.useContext(ConversationContext);
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const options = [
    {
      name: "New",
      icon: <AddCircleIcon fontSize="small" sx={{ marginRight: 1 }} />,
      handleClick: () => {
        setActiveConversation(null);
      },
    },
    {
      name: "Share",
      icon: <ShareIcon fontSize="small" sx={{ marginRight: 1 }} />,
      handleClick: () => {
        handleOpenShareDialog();
      },
    },
    {
      name: "Save",
      icon: <SaveIcon fontSize="small" sx={{ marginRight: 1 }} />,
      handleClick: () => {},
    },
  ];

  // Share logic
  const handleOpenShareDialog = () => {
    setDialogOpen(true);
  };
  const handleCloseShareDialog = () => {
    setDialogOpen(false);
  };
  const handleConfirmShareDialog = (duration) => {
    console.log(`Sharing link duration set to: ${duration} hours`);
    setDialogOpen(false);
  };

  // Manage menu state
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenuOpen = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (event) => {
    if (event) {
      event.stopPropagation();
    }
    setAnchorEl(null);
  };

  return (
    <>
      <Tooltip title="Options">
        <IconButton
          onClick={handleMenuOpen}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <SettingsSharpIcon sx={{ color: "#fff" }} />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        sx={{
          "& .MuiPaper-root": {
            backgroundColor: "#404040",
            borderRadius: "15px",
            border: "0.4px solid rgba(255, 255, 255, 0.19)",
          },
        }}
      >
        {options.map((option, id) => (
          <MenuItem
            key={id}
            onClick={(event) => {
              event.stopPropagation();
              option.handleClick();
              handleMenuClose(event);
            }}
            sx={{
              padding: "4px 16px",
              "&:hover": { backgroundColor: "transparent" },
            }}
          >
            <Box
              sx={{
                padding: "4px 8px",
                borderRadius: "8px",
                minWidth: "100px",
                "&:hover": {
                  backgroundColor: "#555555",
                },
                color: "white",
                display: "flex",
                alignItems: "center",
              }}
            >
              {option.icon}
              {option.name}
            </Box>
          </MenuItem>
        ))}
      </Menu>
      <ShareLinkDialog
        open={dialogOpen}
        onClose={handleCloseShareDialog}
        onConfirm={handleConfirmShareDialog}
        TransitionComponent={Transition}
      />
    </>
  );
}
