import React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import ActiveItem from "./ActiveItem";
import Tabs from "./Tabs";
import SwitchEntityButton from "./SwitchEntityButton";
import { Box } from "@mui/material";
import { motion } from "framer-motion";

const MainBar = () => {
  return (
    <AppBar
      position="static"
      color="transparent"
      enableColorOnDark
      sx={{ boxShadow: "none" }}
    >
      <Toolbar
        sx={{
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* Left Section */}
        <Box sx={{ flexBasis: "auto" }}>
          <ActiveItem />
        </Box>

        {/* Middle Section */}
        <Box
          sx={{
            flex: "1 1 0",
            display: "flex",
            justifyContent: "center",
            minWidth: 0,
          }}
        >
          <Tabs />
        </Box>

        {/* Right Section */}
        <Box
          sx={{ flex: "0 0 auto" }}
        >
          <motion.div
            layout
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 7 }}
          >
            <SwitchEntityButton />
          </motion.div>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default MainBar;
