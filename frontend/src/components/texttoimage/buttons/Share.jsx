import React, { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import { SendOutlined, ScheduleSendOutlined } from "@mui/icons-material";
import ShareDialog from "../dialogs/ShareDialog";
import UnshareDialog from "../dialogs/UnshareDialog";
import Box from "@mui/material/Box";

const Share = ({ imageId }) => {
  const [isSharing, setIsSharing] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [unshareDialogOpen, setUnshareDialogOpen] = useState(false);
  const [sharedUrl, setSharedUrl] = useState("");
  const [expiresAt, setExpiresAt] = useState(0);

  const handleClick = () => {
    if (isSharing) {
      setUnshareDialogOpen(true);
    } else {
      setShareDialogOpen(true);
    }
  };

  const isDisabled = imageId <= 0;
  const tooltipTitle = isDisabled
    ? "Save the image to share"
    : isSharing
    ? "Stop Sharing"
    : "Share";

  const handleShare = (token, expires_at) => {
    // Additional logic
    setSharedUrl(token);
    setIsSharing(true);
    setUnshareDialogOpen(true);
    setExpiresAt(expires_at);
  };

  const reset = () => {
    setIsSharing(false);
    setSharedUrl("");
    setExpiresAt(0);
    setUnshareDialogOpen(false);
  };

  useEffect(() => {
    if (!imageId) {
      reset();
    }
  }, [imageId]);

  const calculateRemainingHours = (expires_at) => {
    if (!expires_at) return 0;

    const expiresAt = new Date(expires_at);
    const now = new Date();
    const remainingMs = expiresAt - now;
    const remainingHours = remainingMs / (1000 * 60 * 60);
    return remainingHours > 0 ? Math.ceil(remainingHours) : 0;
  };

  return (
    <>
      <Tooltip placement="top" title={tooltipTitle}>
        <Box display="inline-flex">
          <Button onClick={handleClick} disabled={isDisabled}>
            {isSharing ? (
              <ScheduleSendOutlined fontSize="small" />
            ) : (
              <SendOutlined fontSize="small" />
            )}
          </Button>
        </Box>
      </Tooltip>
      <ShareDialog
        imageId={imageId}
        state={shareDialogOpen}
        setOpenState={setShareDialogOpen}
        handleShare={handleShare}
      />
      {sharedUrl.length > 0 && (
        <UnshareDialog
          imageId={imageId}
          reset={reset}
          state={unshareDialogOpen}
          setOpenState={setUnshareDialogOpen}
          sharedUrl={sharedUrl}
          remainingHours={calculateRemainingHours(expiresAt)}
        />
      )}
    </>
  );
};

export default Share;
