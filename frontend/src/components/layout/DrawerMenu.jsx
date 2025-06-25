import React, { useContext, useEffect, useRef, useState } from "react";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import MmsOutlinedIcon from "@mui/icons-material/MmsOutlined";
import LinearProgress from "@mui/material/LinearProgress";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import TextField from "@mui/material/TextField";
import Divider from "@mui/material/Divider";
import ChatOutlinedIcon from "@mui/icons-material/ChatOutlined";
import { styled, useTheme } from "@mui/material/styles";
import { useLocation, useNavigate } from "react-router-dom";
import { ConversationContext } from "../../contexts/ConversationContext";
import OptionsMenu from "../chat/OptionsMenu";
import chat from "../../api/chat";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Fade from "@mui/material/Fade";
import { toast } from "react-toastify";
import SearchBar from "../chat/SearchBar";
import { AuthContext } from "../../contexts/AuthContext";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import HomeIcon from "@mui/icons-material/Home";
import AssistantOutlinedIcon from "@mui/icons-material/AssistantOutlined";
import { Tooltip, Typography } from "@mui/material";
import sortedConversation from "../../utils/sortedConversation";
import "../../styles/scrollbar.css";
import { DrawerContext } from "../../contexts/DrawerContext";

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
    display: "Home",
    path: "/home",
    icon: <HomeIcon />,
    protected: false,
  },
  {
    id: 2,
    display: "Chat",
    path: "/chat",
    icon: <ChatOutlinedIcon />,
    protected: true,
  },
  {
    id: 3,
    display: "Text To Image",
    path: "/text-to-image",
    icon: <MmsOutlinedIcon />,
    protected: true,
  },
  {
    id: 4,
    display: "Assistant",
    path: "/assistant",
    icon: <AssistantOutlinedIcon />,
    protected: true,
  },
];

export default function DrawerMenu({ handleDrawerClose }) {
  const { open, isSmallScreen } = useContext(DrawerContext);
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { activeConversationId, activateConversation } =
    useContext(ConversationContext);
  const conversationRefs = useRef({});
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const { isAuthenticated } = useContext(AuthContext);
  const [editingConversationId, setEditingConversationId] = useState(null);
  const {
    data: conversationsData,
    error,
    isError,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => await chat.getConversations(),
    enabled: isAuthenticated && location.pathname === "/chat",
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
      !activeConversationId
    ) {
      const latestConversation = sortedConversation(conversationsData);
      if (latestConversation) {
        activateConversation(latestConversation.id);
      }
    }
  }, [conversationsData]);

  // Rename hanlder
  const handleRename = (conversationId) => {
    setEditingConversationId(conversationId);
  };

  // Rename mutation
  const renameMutation = useMutation({
    mutationFn: async ({ conversationId, new_title }) =>
      await chat.renameConversation(conversationId, new_title),
    onSuccess: (data, { conversationId, new_title }) => {
      // Update the specific conversation in the cache
      queryClient.setQueryData(["conversations"], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          results: oldData.results.map((conv) =>
            conv.id === conversationId ? { ...conv, title: new_title } : conv
          ),
        };
      });
    },
    onError: (error) => {
      console.log("Error renaming the conversation:", error);
      // Extract meaningful message from the error
      const errorMessage =
        error.response?.data?.detail ||
        "An error occurred while renaming the conversation.";
      toast.error("Error renaming the conversation: " + errorMessage);
    },
  });

  const handleTitleKeyDown = (e, conversationId) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const newTitle = e.target.value.trim();
      if (newTitle) {
        renameMutation.mutate({ conversationId, new_title: newTitle });
        setEditingConversationId(null);
      } else {
        toast.error("Title cannot be empty.");
      }
    } else if (e.key === "Escape") {
      setEditingConversationId(null);
    }
  };

  const handleConversationClick = (id) => {
    activateConversation(id);
    handleDrawerClose();
  };

  // Handle Navigation Item Click
  const handlePageClick = (page) => {
    handleDrawerClose();
    if (page.path === "/chat") {
      if (isAuthenticated) {
        refetch();
      }
    }
    navigate(page.path);
  };

  // to scroll to the active conversatio
  useEffect(() => {
    if (
      activeConversationId &&
      conversationRefs.current[activeConversationId]
    ) {
      conversationRefs.current[activeConversationId].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [activeConversationId]);

  return (
    <Drawer
      sx={{
        width: isSmallScreen ? smallScreenDrawerWidth : drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: isSmallScreen ? smallScreenDrawerWidth : drawerWidth,
          boxSizing: "border-box",
        },
      }}
      variant={isSmallScreen ? "temporary" : "persistent"}
      anchor="left"
      open={open}
      onClose={handleDrawerClose}
      className="drawer-scrollbar"
    >
      <DrawerHeader>
        <IconButton onClick={handleDrawerClose}>
          {theme.direction === "ltr" ? (
            <ChevronLeftIcon />
          ) : (
            <ChevronRightIcon />
          )}
        </IconButton>
      </DrawerHeader>
      <Divider />
      <List>
        {pages.map((page) => {
          // Determine if the current page's path matches the location's pathname
          const isSelected = location.pathname === page.path;

          return (
            <ListItem key={page.id} disablePadding>
              <ListItemButton
                selected={isSelected}
                onClick={() => handlePageClick(page)}
              >
                <ListItemIcon>{page.icon}</ListItemIcon>
                <ListItemText
                  primary={page.display}
                  primaryTypographyProps={{
                    sx: { fontFamily: "'Montserrat', serif" },
                  }}
                />
                {!isAuthenticated && page.protected && (
                  <Tooltip title="Login required">
                    <IconButton
                      sx={{
                        "&:hover": {
                          backgroundColor: "transparent",
                        },
                      }}
                    >
                      <VpnKeyIcon
                        sx={{ fontSize: 18, color: "text.secondary" }}
                      />
                    </IconButton>
                  </Tooltip>
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <Divider />
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
                <LinearProgress />
              </ListItemText>
            </ListItem>
          ) : (
            filteredConversations
              // Backend should also sort
              .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
              .map((conversation) => (
                <Fade in={true} timeout={1300} key={conversation.id}>
                  <ListItem key={conversation.id} disablePadding>
                    <ListItemButton
                      ref={(el) =>
                        (conversationRefs.current[conversation.id] = el)
                      }
                      selected={activeConversationId === conversation.id}
                      onClick={() => handleConversationClick(conversation.id)}
                    >
                      <ListItemText
                        primary={
                          editingConversationId === conversation.id ? (
                            <TextField
                              defaultValue={conversation.title}
                              onKeyDown={(e) =>
                                handleTitleKeyDown(e, conversation.id)
                              }
                              onBlur={() => setEditingConversationId(null)}
                              autoFocus
                              size="small"
                              variant="outlined"
                              fullWidth
                              name="conversationTitle"
                              onFocus={(e) => e.stopPropagation()}
                              slotProps={{
                                input: {
                                  sx: {
                                    fontFamily: "'Montserrat', serif",
                                    "::placeholder": {
                                      fontFamily: "'Montserrat', serif",
                                    },
                                  },
                                },
                                formHelperText: {
                                  sx: { fontFamily: "'Montserrat', serif" },
                                },
                              }}
                            />
                          ) : (
                            <Typography
                              variant="body1"
                              sx={{
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                fontFamily: "'Montserrat', serif",
                              }}
                            >
                              {conversation.title}
                            </Typography>
                          )
                        }
                        sx={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          flexGrow: 1,
                        }}
                      />
                      <OptionsMenu
                        conversationId={conversation.id}
                        onRename={handleRename}
                      />
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
