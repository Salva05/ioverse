import React, { useEffect, useMemo, useState } from "react";

import { Box, Button, Menu, MenuItem, useTheme } from "@mui/material";
import { motion } from "framer-motion";
import { useDarkMode } from "../../../contexts/DarkModeContext";
import { MdDisplaySettings } from "react-icons/md";
import { GrStorage } from "react-icons/gr";
import { IoIosHelpCircleOutline } from "react-icons/io";
import { VscRunAll } from "react-icons/vsc";
import { useAssistantContext } from "../../../contexts/AssistantContext";
import { SlSettings } from "react-icons/sl";
import { IoMdAdd } from "react-icons/io";

const MobileTabs = () => {
  const { selectedEntity, setSelectedTab, selectedTab, hasItems } =
    useAssistantContext();

  const theme = useTheme();
  const { darkMode } = useDarkMode();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const tabs = useMemo(
    // To prevent the recreation of tabs and losing applied style
    () => [
      {
        icon: hasItems ? (
          <MdDisplaySettings size="1.5em" />
        ) : (
          <IoMdAdd size="1.5em" />
        ),
        label: hasItems ? "Settings" : "Create",
      },
      {
        icon: <VscRunAll size="1.3em"  />,
        label: "Run",
      },
      {
        icon: (
          <GrStorage size="1.3rem" />
        ),
        label: "Storage",
      },
      {
        icon: (
          <IoIosHelpCircleOutline
            size="1em"
          />
        ),
        label: "Help",
      },
    ],
    [hasItems, selectedEntity]
  );

  // Handle opening the menu
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
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
            }}
            selected={selectedTab === item.label}
            sx={{
              backgroundColor:
                selectedTab === item.label
                  ? theme.palette.action.selected
                  : "transparent",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Box
              component="span"
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 24,
                height: 24,
                fontSize: "1.5rem",
              }}
            >
              {item.icon}
            </Box>
            {item.label}
            {selectedTab === item.label ? (
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
