import { Typography } from "@mui/material";
import React from "react";
import { useAssistantContext } from "../../../../contexts/AssistantContext";
import { motion, AnimatePresence } from "framer-motion";

const Title = () => {
  const { selectedTab } = useAssistantContext();

  return (
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
  );
};

export default Title;
