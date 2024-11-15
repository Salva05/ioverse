import React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import MobileActiveItem from "./MobileActiveItem";
import SwitchEntityButton from "../components/main_bar/SwitchEntityButton";
import { Box } from "@mui/material";
import { motion } from "framer-motion";
import MobileTabs from "./MobileTabs";

const MobileMainBar = () => {
  return (
    <>
      <Box>
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
