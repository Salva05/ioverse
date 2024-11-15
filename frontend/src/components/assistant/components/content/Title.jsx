import { Box, Typography, useMediaQuery } from "@mui/material";
import React from "react";
import { useAssistantContext } from "../../../../contexts/AssistantContext";
import { motion, AnimatePresence } from "framer-motion";

const Title = () => {
  const { selectedTab } = useAssistantContext();
  const isMobile = useMediaQuery("(max-width:815px)");

  return (
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
        width: "100%",
        display: "flex",
        justifyContent: isMobile ? "center" : "flex-start",
        paddingLeft: isMobile ? "0px" : "100px",
        paddingRight: isMobile ? "0px" : "100px",
      }}
    >
      <Typography
        variant="h4"
        sx={{
          fontFamily: "'Montserrat', serif",
          my: 1,
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedTab} // triggers animation
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.3 }}
          >
            {selectedTab}
          </motion.div>
        </AnimatePresence>
      </Typography>
    </Box>
  );
};

export default Title;
