import React, { useEffect, useState } from "react";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import MailIcon from "@mui/icons-material/Mail";
import ChatIcon from "@mui/icons-material/Chat";
import { styled, useTheme } from "@mui/material/styles";
import { useLocation, useNavigate } from "react-router-dom";

import chatService from "../services/chatService";
import { useQuery } from "@tanstack/react-query";

import { toast } from "react-toastify";

const drawerWidth = 240;
const smallScreenDrawerWidth = 230;

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: "flex-end",
}));

const pages = [
  {
    id: 1,
    display: "Chat",
    path: "chat",
    icon: <ChatIcon sx={{ color: "#fff" }} />,
  },
  {
    id: 2,
    display: "Mailing",
    path: "/",
    icon: <MailIcon sx={{ color: "#fff" }} />,
  },
];

export default function DrawerMenu({ open, isSmallScreen, handleDrawerClose }) {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    data: conversationsData,
    error,
    isError,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["conversations"],
    queryFn: chatService.getConversations,
    enabled: location.pathname === "/chat",
  });

  useEffect(() => {
    if (isError) {
      toast.error("Error loading conversations: " + error);
    }
  }, [isError]);

  return (
    <Drawer
      sx={{
        width: isSmallScreen ? smallScreenDrawerWidth : drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: isSmallScreen ? smallScreenDrawerWidth : drawerWidth,
          boxSizing: "border-box",
          backgroundColor: "#2d2d2d",
          color: "#fff",
        },
      }}
      variant={isSmallScreen ? "temporary" : "persistent"}
      anchor="left"
      open={open}
      onClose={handleDrawerClose}
    >
      <DrawerHeader>
        <IconButton onClick={handleDrawerClose}>
          {theme.direction === "ltr" ? (
            <ChevronLeftIcon sx={{ color: "#fff" }} />
          ) : (
            <ChevronRightIcon sx={{ color: "#fff" }} />
          )}
        </IconButton>
      </DrawerHeader>
      <Divider sx={{ backgroundColor: "#444" }} />
      <List>
        {pages.map((page, index) => (
          <ListItem key={page.id} disablePadding>
            <ListItemButton
              onClick={() => {
                if (page.path === "chat") {
                  refetch();
                }
                navigate(page.path);
              }}
            >
              <ListItemIcon>{page.icon}</ListItemIcon>
              <ListItemText primary={page.display} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider sx={{ backgroundColor: "#444" }} />
      {location.pathname === "/chat" && (
        <List>
          {/* Display Conversations */}
          {isLoading ? (
            <ListItem>
              <ListItemText primary="Loading..." />
            </ListItem>
          ) : conversationsData && conversationsData.results.length > 0 ? (
            conversationsData.results.map((conversation) => (
              <ListItem key={conversation.id} disablePadding>
                <ListItemButton>
                  <ListItemText primary={conversation.title} />
                </ListItemButton>
              </ListItem>
            ))
          ) : (
            <ListItem>
              <ListItemText primary="No conversations found." />
            </ListItem>
          )}
        </List>
      )}
    </Drawer>
  );
}
