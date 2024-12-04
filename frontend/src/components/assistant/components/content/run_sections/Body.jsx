import { Box } from "@mui/material";
import React, { useContext } from "react";
import Message from "../run_components/Message";
import { DrawerContext } from "../../../../../contexts/DrawerContext";

  const Body = ({ messages }) => {
    const { isSmallScreen } = useContext(DrawerContext);
    
    return (
      <Box
        sx={{
          mt: 5,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 4,
          width: isSmallScreen ? "90%" : "80%",
          pb: 20,
          overflowY: "auto"
        }}
      >
        {messages.map((message) => (
          <Message key={message.id} who={message.role} content={message.content} />
        ))}
      </Box>
    );
  };

export default Body;
