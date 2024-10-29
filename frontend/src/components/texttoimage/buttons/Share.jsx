import React, { useState } from "react";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import ShareDialog from "../dialogs/ShareDialog";
import UnshareDialog from "../dialogs/UnshareDialog";

const Share = () => {
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [unshareDialogOpen, setUnshareDialogOpen] = useState(false);

  const handleClick = () => {
    setShareDialogOpen(true);
  };

  return (
    <>
      <Tooltip placement="top" title="Share">
        <Button onClick={handleClick}>
          <SendOutlinedIcon fontSize="small" />
        </Button>
      </Tooltip>
      <ShareDialog
        state={shareDialogOpen}
        setOpenState={setShareDialogOpen}
        setUnshareDialogOpen={setUnshareDialogOpen}
      />
      <UnshareDialog
        state={unshareDialogOpen}
        setOpenState={setUnshareDialogOpen}
      />
    </>
  );
};

export default Share;
