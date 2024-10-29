import React, { useState } from "react";
import ButtonGroup from "@mui/material/ButtonGroup";
import Save from "./buttons/Save";
import See from "./buttons/See";
import Share from "./buttons/Share";

const Options = ({ payload, src }) => {
  return (
    <ButtonGroup size="small" aria-label="Small button group">
      <See src={src}/>
      <Save />
      <Share />
    </ButtonGroup>
  );
};

export default Options;
