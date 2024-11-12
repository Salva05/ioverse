import React, { useState } from "react";

import { Box, Button, useTheme } from "@mui/material";
import { motion } from "framer-motion";
import { useDarkMode } from "../../../../contexts/DarkModeContext";
import { MdDisplaySettings } from "react-icons/md";
import { GrChat } from "react-icons/gr";
import { MdModelTraining } from "react-icons/md";
import { IoIosHelpCircleOutline } from "react-icons/io";

const tabs = [
  {
    icon: (
      <MdDisplaySettings
        size="1.5em"
        style={{ marginRight: 7, marginBottom: 3 }}
      />
    ),
    label: "Settings",
  },
  {
    icon: <GrChat size="1.23em" style={{ marginRight: 7, marginBottom: 3 }}/>,
    label: "Chat",
  },
  {
    icon: (
      <MdModelTraining
        size="1.5em"
        style={{ marginRight: 7, marginBottom: 3 }}
      />
    ),
    label: "Train",
  },
  {
    icon: (
      <IoIosHelpCircleOutline
        size="1.5em"
        style={{ marginRight: 7, marginBottom: 3 }}
      />
    ),
    label: "Help",
  },
];

const Tabs = () => {
  const [selectedTab, setSelectedTab] = useState(tabs[0]);
  const { darkMode } = useDarkMode();
  const theme = useTheme();

  return (
    <Box sx={{ display: "flex", gap: 2 }}>
      {tabs.map((item) => (
        <Button
          color="inherit"
          key={item.label}
          onClick={() => setSelectedTab(item)}
          sx={{
            backgroundColor:
              item === selectedTab
                ? theme.palette.action.selected
                : "transparent",
          }}
        >
          {item.icon}
          {` ${item.label}`}
          {item === selectedTab ? (
            <motion.div
              className="underline"
              layoutId="underline"
              style={{
                backgroundColor: darkMode ? "white" : "black",
              }}
            />
          ) : null}
        </Button>
      ))}
    </Box>
  );
};

export default Tabs;
