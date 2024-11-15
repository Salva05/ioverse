import React, { useEffect, useMemo, useState } from "react";

import { Box, Button, useTheme } from "@mui/material";
import { motion } from "framer-motion";
import { useDarkMode } from "../../../../contexts/DarkModeContext";
import { MdDisplaySettings } from "react-icons/md";
import { GrChat } from "react-icons/gr";
import { MdModelTraining } from "react-icons/md";
import { IoIosHelpCircleOutline } from "react-icons/io";
import { VscRunAll } from "react-icons/vsc";
import { GiHabitatDome } from "react-icons/gi";
import { useAssistantContext } from "../../../../contexts/AssistantContext";

const Tabs = () => {
  const { selectedEntity, setSelectedTab } = useAssistantContext();
  const { darkMode } = useDarkMode();
  const theme = useTheme();

  const tabs = useMemo(
    // To prevent the recreation of tabs and losing applied style
    () => [
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
        icon:
          selectedEntity === "Assistant" ? (
            <GrChat size="1.23em" style={{ marginRight: 7, marginBottom: 3 }} />
          ) : (
            <VscRunAll
              size="1.3em"
              style={{ marginRight: 7, marginBottom: 3 }}
            />
          ),
        label: selectedEntity === "Assistant" ? "Chat" : "Run",
      },
      {
        icon:
          selectedEntity === "Assistant" ? (
            <MdModelTraining
              size="1.6em"
              style={{ marginRight: 7, marginBottom: 3 }}
            />
          ) : (
            <GiHabitatDome
              size="1.5em"
              style={{ marginRight: 7, marginBottom: 3 }}
            />
          ),
        label: selectedEntity === "Assistant" ? "Train" : "Context",
      },
      {
        icon: (
          <IoIosHelpCircleOutline
            size="1.6em"
            style={{ marginRight: 7, marginBottom: 3 }}
          />
        ),
        label: "Help",
      },
    ],
    [selectedEntity]
  );

  const [tabIndex, setTabIndex] = useState(0);

  useEffect(() => {
    setTabIndex(0);
    setSelectedTab(tabs[0].label);
  }, [tabs]);

  return (
    <Box sx={{ display: "flex", gap: 2 }}>
      <motion.div layout transition={{ duration: 0.4, ease: "easeInOut" }}>
        {tabs.map((item, index) => (
          <Button
            color="inherit"
            key={item.label}
            onClick={() => {
              setTabIndex(index);
              setSelectedTab(item.label);
            }}
            sx={{
              backgroundColor:
                index === tabIndex
                  ? theme.palette.action.selected
                  : "transparent",
            }}
          >
            {item.icon}
            {` ${item.label}`}
            {index === tabIndex ? (
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
      </motion.div>
    </Box>
  );
};

export default Tabs;
