import React, { useContext, useEffect, useState } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import ActiveItem from "./main_bar/ActiveItem";
import Tabs from "./main_bar/Tabs";
import SwitchEntityButton from "./main_bar/SwitchEntityButton";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import { motion } from "framer-motion";
import { DrawerContext } from "../../../contexts/DrawerContext";

const drawerWidth = 240;

const MainBar = () => {
  const { open } = useContext(DrawerContext);
  const [showTabs, setShowTabs] = useState(open);
  const isMobile = useMediaQuery(
    `(max-width:${open ? 815 + drawerWidth : 815}px)`
  );
const theme = useTheme();
  // To prevent incorrect displaying in first milliseconds of render
  // while darwer menu is still closing
  useEffect(() => {
    if (!open) {
      const timeout = setTimeout(() => setShowTabs(true), 150);
      return () => clearTimeout(timeout);
    } else {
      if (isMobile) setShowTabs(false);
    }
  }, [open]);

  return (
    <AppBar
      position="fixed"
      color="transparent"
      enableColorOnDark
      sx={{
        boxShadow: "none",
        backgroundColor: theme.palette.background.default,
        top: theme.mixins.toolbar.minHeight,
        zIndex: theme.zIndex.appBar - 1,
      }}
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
          {showTabs && <Tabs />}
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
