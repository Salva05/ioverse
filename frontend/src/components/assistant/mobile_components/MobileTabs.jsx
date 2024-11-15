import React, { useEffect, useMemo, useState } from "react";

import { Button, Menu, MenuItem, useTheme } from "@mui/material";
import { motion } from "framer-motion";
import { useDarkMode } from "../../../contexts/DarkModeContext";
import { MdDisplaySettings } from "react-icons/md";
import { GrChat } from "react-icons/gr";
import { MdModelTraining } from "react-icons/md";
import { IoIosHelpCircleOutline } from "react-icons/io";
import { VscRunAll } from "react-icons/vsc";
import { GiHabitatDome } from "react-icons/gi";
import { useAssistantContext } from "../../../contexts/AssistantContext";
import { SlSettings } from "react-icons/sl";

const MobileTabs = () => {
  const { selectedEntity, setSelectedTab } = useAssistantContext();
  const { darkMode } = useDarkMode();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const theme = useTheme();

  const tabs = useMemo(
    // To prevent the recreation of tabs and losing applied style
    () => [
      {
        icon: <MdDisplaySettings size="1.5em" style={{ marginRight: 7 }} />,
        label: "Settings",
      },
      {
        icon:
          selectedEntity === "Assistant" ? (
            <GrChat size="1.23em" style={{ marginRight: 9, marginLeft: 2.5 }} />
          ) : (
            <VscRunAll size="1.3em" style={{ marginRight: 10, }} />
          ),
        label: selectedEntity === "Assistant" ? "Chat" : "Run",
      },
      {
        icon:
          selectedEntity === "Assistant" ? (
            <MdModelTraining size="1.6em" style={{ marginRight: 7 }} />
          ) : (
            <GiHabitatDome size="1.5em" style={{ marginRight: 7 }} />
          ),
        label: selectedEntity === "Assistant" ? "Train" : "Context",
      },
      {
        icon: (
          <IoIosHelpCircleOutline size="1.6em" style={{ marginRight: 7 }} />
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

  // Handle opening the menu
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Handle element creation
  const handleCreate = () => {
    // will be defined later
  };

  // Handle closing the menu
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Button color="inherit" onClick={handleClick}>
        <SlSettings size="1.3rem" />
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
        sx={{
          mt: 1,
          "& .MuiMenu-paper": {
            borderRadius: 1,
            border: "1px solid",
            borderColor: (theme) => theme.palette.divider,
          },
          ".MuiMenu-list": {
            paddingTop: 0,
            paddingBottom: 0,
          },
        }}
      >
        {tabs.map((item, index) => (
          <MenuItem
            key={item.label}
            onClick={() => {
              setSelectedTab(item.label);
              setTabIndex(index);
              setTimeout(handleClose, 250);
            }}
            selected={index === tabIndex}
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
                className="underline-mobile"
                layoutId="underline-mobile"
                style={{
                  backgroundColor: darkMode ? "white" : "black",
                }}
              />
            ) : null}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default MobileTabs;
