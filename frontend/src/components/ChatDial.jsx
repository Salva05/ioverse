import React, { useContext, useEffect, useRef, useState } from "react";
import { useTheme } from "@mui/material/styles";
import SpeedDialIcon from "@mui/material/SpeedDialIcon";
import SpeedDialAction from "@mui/material/SpeedDialAction";
import SaveIcon from "@mui/icons-material/Save";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import ShareIcon from "@mui/icons-material/Share";
import { useMediaQuery, SpeedDial, Fade } from "@mui/material";
import { DrawerContext } from "../contexts/DrawerContext";
import { ConversationContext } from "../contexts/ConversationContext";
import ShareLinkDialog from "./ShareLinkDialog";
import shareConversation from "../utils/shareConversation";
import unshareConversation from "../utils/unshareConversation";
import ScheduleSendIcon from '@mui/icons-material/ScheduleSend';
import UnshareLinkDialog from "./UnshareLinkDialog";
import handleDownload from "../services/handleDownload";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Fade {...props} ref={ref} timeout={800} />;
});

export default function ChatDial() {
  const { activateConversation, setActiveConversation, activeConversation } =
    useContext(ConversationContext);
  const theme = useTheme();
  const { open: drawerOpen, isSmallScreen } = useContext(DrawerContext);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [unshareDialogOpen, setUnshareDialogOpen] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isUnsharing, setIsUnsharing] = useState(false);
  const isSharingRef = useRef(false);
  const isUnsharingRef = useRef(false);

  const isShared = activeConversation?.is_shared;

  // Detect when screen width is below 1109px
  const isNarrowScreen = useMediaQuery("(max-width:1109px)");
  const [dialOpen, setDialOpen] = useState(false);

  // Share logic
  const handleOpenShareDialog = () => setDialogOpen(true);
  const handleCloseShareDialog = () => setDialogOpen(false);

  const handleConfirmShareDialog = async (duration) => {
    if (isSharingRef.current) return; // Prevent multiple submissions
    isSharingRef.current = true;
    setIsSharing(true);
    try {
      const data = await shareConversation(activeConversation.id, duration);
      activateConversation(activeConversation.id); // This causes the rerender and update of the icon
      console.log(`Sharing link duration set to: ${duration} hours`);
      console.log("Share URL:", data.share_url);
      
      // Automatically open the Share Details dialog after sharing
      setDialogOpen(false);
      setUnshareDialogOpen(true);
    } catch (error) {
      console.error("Error sharing conversation:", error);
    } finally {
      isSharingRef.current = false;
      setIsSharing(false);
    }
  };

  // Unshare logic

  useEffect(() => {
    const checkExpiration = async () => {
      if (dialOpen && calculateRemainingHours() <= 0 && isShared) {
        if (isUnsharingRef.current) return;

        isUnsharingRef.current = true;
        setIsUnsharing(true);

        try {
          await unshareConversation(activeConversation.id);
          console.log(
            `Conversation with ID ${activeConversation.id} unshared successfully`
          );

          // Update the active conversation state
          setActiveConversation({
            ...activeConversation,
            is_shared: false,
            shared_at: null,
            expires_at: null,
          });
        } catch (error) {
          console.error("Error unsharing conversation:", error);
        } finally {
          isUnsharingRef.current = false;
          setIsUnsharing(false);
        }
      }
    };

    checkExpiration();
  }, [dialOpen]);

  const handleOpenUnshareDialog = () => setUnshareDialogOpen(true);
  const handleCloseUnshareDialog = () => setUnshareDialogOpen(false);

  const handleConfirmUnshareDialog = async () => {
    if (isUnsharingRef.current) return;
    isUnsharingRef.current = true;
    setIsUnsharing(true);
    try {
      await unshareConversation(activeConversation.id);
      activateConversation(activeConversation.id);
      console.log(
        `Conversation with ID ${activeConversation.id} unshared successfully`
      );
    } catch (error) {
      console.error("Error unsharing conversation:", error);
    } finally {
      isUnsharingRef.current = false;
      setIsUnsharing(false);
      setUnshareDialogOpen(false);
    }
  };

  const calculateRemainingHours = () => {
    if (!activeConversation?.expires_at) return 0;

    const expiresAt = new Date(activeConversation.expires_at);
    const now = new Date();
    // Calculate the difference in milliseconds
    const remainingMs = expiresAt - now;
    // Convert milliseconds to hours
    const remainingHours = remainingMs / (1000 * 60 * 60);
    return remainingHours > 0 ? Math.ceil(remainingHours) : 0;
  };

  // ChatDial logic
  const handleOpen = () => setDialOpen(true);
  const handleClose = () => setDialOpen(false);

  const drawerWidth = 240;
  const spacing = parseInt(theme.spacing(2), 10);
  const leftPosition = spacing;
  const transformX = drawerOpen ? drawerWidth : 0;
  const transitionDuration = theme.transitions.duration.enteringScreen;
  const transitionEasing = theme.transitions.easing.sharp;

  const actions = [
    {
      icon: <AddOutlinedIcon />,
      name: "New",
      handleAction: () => {
        setActiveConversation(null);
      },
    },
    isShared
      ? {
          icon: <ScheduleSendIcon />,
          name: "Sharing",
          handleAction: () => {
            handleOpenUnshareDialog();
          },
        }
      : {
          icon: <ShareIcon />,
          name: "Share",
          handleAction: () => {
            handleOpenShareDialog();
          },
        },
    {
      icon: <SaveIcon />,
      name: "Save",
      handleAction: () => {
        handleDownload(activeConversation.id);
      },
    },
  ];

  if (isNarrowScreen) return null;

  return (
    <>
      <SpeedDial
        ariaLabel="SpeedDial playground example"
        icon={<SpeedDialIcon />}
        direction="down"
        FabProps={{
          sx: (theme) => ({
            backgroundColor: dialOpen ? "#fff" : "#2d2d2d",
            color: dialOpen ? "black" : "white",
            transition: theme.transitions.create(
              ["background-color", "color"],
              {
                duration: theme.transitions.duration.shortest,
                easing: theme.transitions.easing.easeInOut,
              }
            ),
            "&:hover": {
              backgroundColor: dialOpen ? "#fff" : "#2d2d2d",
              color: "black",
            },
          }),
          size: "medium",
        }}
        onClose={handleClose}
        onOpen={handleOpen}
        open={dialOpen}
        sx={{
          position: "fixed",
          top: theme.spacing(10),
          left: `${leftPosition}px`,
          zIndex: 99,
          transform: `translateX(${transformX}px)`,
          transition: theme.transitions.create("transform", {
            easing: transitionEasing,
            duration: transitionDuration,
          }),
        }}
      >
        {actions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={action.handleAction}
          />
        ))}
      </SpeedDial>
      {!isShared && activeConversation && (
        <ShareLinkDialog
          open={dialogOpen}
          onClose={handleCloseShareDialog}
          onConfirm={handleConfirmShareDialog}
          TransitionComponent={Transition}
          isSharing={isSharing}
        />
      )}
      {isShared && activeConversation && (
        <UnshareLinkDialog
          open={unshareDialogOpen}
          onClose={handleCloseUnshareDialog}
          onConfirm={handleConfirmUnshareDialog}
          TransitionComponent={Transition}
          isUnsharing={isUnsharing}
          remainingHours={calculateRemainingHours()}
        />
      )}
    </>
  );
}
