import React, { useContext } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import MobileActiveItem from "./MobileActiveItem";
import SwitchEntityButton from "../components/main_bar/SwitchEntityButton";
import { Box, useTheme } from "@mui/material";
import { motion } from "framer-motion";
import MobileTabs from "./MobileTabs";
import { DrawerContext } from "../../../contexts/DrawerContext";

const drawerWidth = 240;

const MobileMainBar = () => {
  const theme = useTheme();
  const { open, isSmallScreen } = useContext(DrawerContext);

  return (
    <>
      <Box>
        <AppBar
          position="fixed"
          color="transparent"
          enableColorOnDark
          sx={{
            boxShadow: "none",
            top: theme.mixins.toolbar.minHeight,
            backgroundColor: theme.palette.background.default,
            zIndex: theme.zIndex.appBar - 1,
            transition: theme.transitions.create(["margin-left", "width"], {
              easing: theme.transitions.easing.easeOut,
              duration: theme.transitions.duration.enteringScreen,
            }),
            ...(open &&
              !isSmallScreen && {
                marginLeft: `${drawerWidth}px`,
                width: `calc(100% - ${drawerWidth}px)`,
              }),
          }}
        >
          <Toolbar
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {/* Left Section */}
            <Box sx={{ flex: "0 0 auto" }}>
              <MobileActiveItem />
            </Box>

            {/* Center Section */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                marginLeft: "auto",
              }}
            >
              <MobileTabs />
              {/* Right Section */}
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
      </Box>
    </>
  );
};

export default MobileMainBar;
