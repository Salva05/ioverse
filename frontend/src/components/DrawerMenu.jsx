import React, { useContext, useEffect, useState } from "react";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import LinearProgress from "@mui/material/LinearProgress";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import MailIcon from "@mui/icons-material/Mail";
import ChatIcon from "@mui/icons-material/Chat";
import { styled, useTheme } from "@mui/material/styles";
import { useLocation, useNavigate } from "react-router-dom";
import { ConversationContext } from "../contexts/ConversationContext";
import OptionsMenu from "./OptionsMenu";
import chatService from "../services/chatService";
import { useQuery } from "@tanstack/react-query";
import Fade from "@mui/material/Fade";
import { toast } from "react-toastify";
import SearchBar from "./SearchBar";

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
  const { activeConversation, activateConversation } =
    useContext(ConversationContext);
  const [searchQuery, setSearchQuery] = useState("");

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

  // Filter conversations based on the search query
  const filteredConversations = conversationsData
    ? conversationsData.results.filter((conversation) =>
        conversation.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  useEffect(() => {
    if (isError) {
      toast.error(
        "Error loading conversations: " + (error?.message || "Unknown error")
      );
    }
  }, [isError, error]);

  // Set the latest conversation as active on initial load
  useEffect(() => {
    if (
      conversationsData &&
      conversationsData.results.length > 0 &&
      !activeConversation
    ) {
      const latestConversation = sortedConversations();
      activateConversation(latestConversation.id);
    }
  }, [conversationsData]);

  // Update the active conversation when a conversation get deleted
  useEffect(() => {
    if (conversationsData && conversationsData.results.length > 0) {
      const latestConversation = sortedConversations();
      activateConversation(latestConversation.id);
    }
  }, [conversationsData]);

  const sortedConversations = () => {
    // Sort conversations by 'created_at' in descending order
    const sortedConversations = [...conversationsData.results].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );
    return sortedConversations[0];
  };

  const handleConversationClick = (id) => {
    activateConversation(id);
  };

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
          <Fade in={true} timeout={1500}>
            <ListItem>
              <SearchBar onSearchChange={setSearchQuery} value={searchQuery} />
            </ListItem>
          </Fade>
          {/* Display Conversations */}
          {isLoading ? (
            <ListItem>
              <ListItemText>
                <LinearProgress color="secondary" />
              </ListItemText>
            </ListItem>
          ) : (
            filteredConversations
              // Backend should also sort
              .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
              .map((conversation) => (
                <Fade in={true} timeout={1500} key={conversation.id}>
                  <ListItem key={conversation.id} disablePadding>
                    <ListItemButton
                      selected={activeConversation?.id === conversation.id}
                      onClick={() => handleConversationClick(conversation.id)}
                      sx={{
                        "&.Mui-selected": {
                          backgroundColor: theme.palette.action.selected,
                          "&:hover": {
                            backgroundColor: theme.palette.action.hover,
                          },
                        },
                      }}
                    >
                      <ListItemText
                        primary={conversation.title}
                        sx={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          flexGrow: 1,
                          maskImage:
                            "linear-gradient(to right, black 85%, transparent)",
                          WebkitMaskImage:
                            "linear-gradient(to right, black 85%, transparent)", // For Safari
                        }}
                      />
                      <OptionsMenu conversationId={conversation.id} />
                    </ListItemButton>
                  </ListItem>
                </Fade>
              ))
          )}
        </List>
      )}
    </Drawer>
  );
}
