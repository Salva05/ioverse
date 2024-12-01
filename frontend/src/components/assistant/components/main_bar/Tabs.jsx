import React, { useMemo } from "react";

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
import { IoMdAdd } from "react-icons/io";

const Tabs = () => {
  const { selectedEntity, setSelectedTab, selectedTab, hasItems } =
    useAssistantContext();

  const theme = useTheme();
  const { darkMode } = useDarkMode();

  const tabs = useMemo(
    // To prevent the recreation of tabs and losing applied style
    () => [
      {
        icon: hasItems ? (
          <MdDisplaySettings
            size="1.5em"
            style={{ marginRight: 6, marginBottom: 3 }}
          />
        ) : (
          <IoMdAdd size="1.5em" style={{ marginRight: 4, marginBottom: 3 }} />
        ),
        label: hasItems ? "Settings" : "Create",
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
    [selectedEntity, hasItems]
  );

  return (
    <Box sx={{ display: "flex", gap: 2 }}>
      <motion.div layout transition={{ duration: 0.4, ease: "easeInOut" }}>
        {tabs.map((item, index) => (
          <Button
            color="inherit"
            key={item.label}
            onClick={() => {
              setSelectedTab(item.label);
            }}
            sx={{
              backgroundColor:
                selectedTab === item.label
                  ? theme.palette.action.selected
                  : "transparent",
            }}
          >
            {item.icon}
            {` ${item.label}`}
            {selectedTab === item.label ? (
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
