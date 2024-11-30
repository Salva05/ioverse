import React from "react";
import ButtonGroup from "@mui/material/ButtonGroup";
import Save from "./buttons/Save";
import See from "./buttons/See";
import Share from "./buttons/Share";

const OptionsBar = ({ payload, src, imageId, setImageId }) => {
  return (
    <ButtonGroup size="small" aria-label="Small button group">
      <See src={src} />
      <Save
        payload={payload}
        src={src}
        setImageId={setImageId}
        imageId={imageId}
      />
      <Share imageId={imageId} />
    </ButtonGroup>
  );
};

export default OptionsBar;
