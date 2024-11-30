import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CircularProgress from "@mui/material/CircularProgress";
import AddIcon from "@mui/icons-material/Add";
import { FaRobot } from "react-icons/fa";
import { LuContainer } from "react-icons/lu";
import { HiOutlineSelector } from "react-icons/hi";
import { IoMdAdd } from "react-icons/io";
import { useAssistantContext } from "../../../../contexts/AssistantContext";
import { motion } from "framer-motion";
import { useIsMutating } from "@tanstack/react-query";
import { truncateText } from "../../../../utils/textUtils";

const ActiveItem = () => {
  const {
    selectedEntity,
    assistant,
    setAssistant,
    assistants,
    isAssistantsLoading,
    thread,
    setThread,
    threads,
    isThreadsLoading,
  } = useAssistantContext();

  // Loading state for the selected domain
  const isLoading =
    selectedEntity === "Assistant" ? isAssistantsLoading : isThreadsLoading;

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const items = selectedEntity === "Assistant" ? assistants : threads;

  // Find the selected item based on ID
  const selectedItem = useMemo(() => {
    if (!items || items.length === 0) return null;
    const currentItem = selectedEntity === "Assistant" ? assistant : thread;
    return items.find((item) => item.id === currentItem?.id) || items[0];
  }, [items, assistant, thread, selectedEntity]);

  // Derived list with the selected item as the first item
  const orderedItems = useMemo(() => {
    if (!items || items.length === 0) return [];
    return [
      selectedItem,
      ...items.filter((item) => item.id !== selectedItem.id),
    ];
  }, [items, selectedItem]);

  // Update the entity object in the context
  useEffect(() => {
    if (selectedItem) {
      if (selectedEntity === "Assistant") {
        setAssistant(selectedItem);
      } else {
        setThread(selectedItem);
      }
    }
  }, [selectedItem, selectedEntity, setAssistant, setThread]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCreate = () => {
    // will be defined later
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const isMutating = useIsMutating({ mutationKey: ["updateAssistant"] });

  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <Button
        color="inherit"
        sx={{ textTransform: "none" }}
        onClick={orderedItems.length > 0 ? handleClick : handleCreate}
      >
        {selectedEntity === "Assistant" ? (
          <FaRobot size="1.5em" style={{ marginRight: 15, paddingBottom: 5 }} />
        ) : (
          <LuContainer
            size="1.5em"
            style={{ marginRight: 15, marginBottom: 4 }}
          />
        )}
        <motion.div
          layout
          transition={{ duration: 0.4, ease: "easeInOut" }}
          style={{ display: "flex", alignItems: "center" }}
        >
          {isLoading || isMutating ? (
            <>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: "bold",
                  fontSize: "0.9rem",
                  fontFamily: "'Montserrat', serif",
                }}
              >
                {isLoading ? "Loading..." : "Updating..."}
              </Typography>
              <CircularProgress size={20} sx={{ ml: 1 }} />
            </>
          ) : orderedItems.length > 0 ? (
            <>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: "bold",
                  fontSize: "1rem",
                  fontFamily: "'Montserrat', serif",
                }}
              >
                {truncateText(orderedItems[0]?.name ?? orderedItems[0]?.id, 30)}
              </Typography>
              <HiOutlineSelector size="1.1em" style={{ marginLeft: 5 }} />
            </>
          ) : (
            <>
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", fontSize: "1rem" }}
              >
                Create {selectedEntity === "Assistant" ? "Assistant" : "Thread"}
              </Typography>
              <IoMdAdd size="1.1em" style={{ marginLeft: 5 }} />
            </>
          )}
        </motion.div>
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        sx={{
          "& .MuiMenu-paper": {
            borderRadius: 2.5,
            minWidth: "190px",
            border: "1px solid",
            borderColor: (theme) => theme.palette.divider,
          },
        }}
      >
        {orderedItems.map((item, index) => (
          <MenuItem
            key={item.id}
            selected={index === 0}
            onClick={() => {
              if (selectedEntity === "Assistant") {
                setAssistant(item);
              } else {
                setThread(item);
              }
              handleClose();
            }}
            sx={{
              mx: 0.5,
              borderRadius: 2,
              fontSize: "0.93rem",
              padding: "3px 8px",
            }}
          >
            <ListItemIcon sx={{ mr: -1.5 }}>
              {index === 0 && (
                <CheckIcon sx={{ fontSize: "1.1rem", mb: 0.4 }} />
              )}
            </ListItemIcon>
            <Typography
              sx={{
                fontSize: "inherit",
                fontFamily: "'Montserrat', serif",
                maxWidth: 330,
                whiteSpace: "normal",
                wordWrap: "break-word",
                overflowWrap: "break-word",
              }}
            >
              {item?.name ?? item?.id}
            </Typography>
          </MenuItem>
        ))}
        <Divider />
        <MenuItem
          onClick={handleClose}
          sx={{
            mx: 0.5,
            borderRadius: 2,
            fontSize: "0.93rem",
            padding: "3px 8px",
            my: -0.2,
          }}
        >
          <ListItemIcon sx={{ mr: -1.5 }}>
            <AddIcon sx={{ fontSize: "1.1rem" }} />
          </ListItemIcon>
          <Typography
            sx={{
              fontSize: "inherit",
              fontFamily: "'Montserrat', serif",
            }}
          >
            Create {selectedEntity === "Assistant" ? " assistant" : " thread"}
          </Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ActiveItem;
