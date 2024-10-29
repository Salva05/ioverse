import React from "react";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";

const See = () => {
  const handleClick = () => {
    console.log("Seen");
    // ...
  };

  return (
    <Tooltip placement="top" title="See">
      <Button onClick={handleClick}>
        <RemoveRedEyeOutlinedIcon fontSize="small" />
      </Button>
    </Tooltip>
  );
};

export default See;
