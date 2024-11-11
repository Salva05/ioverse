import React, { useState, useMemo, useContext, useEffect } from "react";
import {
  Typography,
  Box,
  Tabs,
  Tab,
  useMediaQuery,
  TextField,
  InputAdornment,
  CssBaseline,
  Toolbar,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import { format, isToday, isYesterday, parseISO } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { ConversationContext } from "../contexts/ConversationContext";
import chat from "../api/chat";
import TabPanel from "../components/account/TabPanel";
import UserInfo from "../components/account/UserInfo";
import ConversationList from "../components/account/ConversationList";
import { getGroupLabel } from "../utils/getGroupLabel";
import GeneratedImagesList from "../components/account/GeneratedImagesList";
import textToImage from "../api/textToImage";

const a11yProps = (index) => {
  return {
    id: `account-tab-${index}`,
    "aria-controls": `account-tabpanel-${index}`,
  };
};

const Account = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  const { isAuthenticated, user, loading } = useContext(AuthContext);
  const { activateConversation } = useContext(ConversationContext);

  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [openGroups, setOpenGroups] = useState({});

  const handleChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Query to fetch conversations
  const {
    data: conversationsData,
    error,
    isError,
    isLoading,
  } = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => await chat.getConversations(),
    enabled: isAuthenticated && tabValue === 1, // Fetch only when authenticated and on Conversations tab
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  // Query to fetch images
  const {
    data: imagesData,
    error: imagesError,
    isError: isImagesError,
    isLoading: isImagesLoading,
  } = useQuery({
    queryKey: ["generatedImages"],
    queryFn: async () => await textToImage.getImages(),
    enabled: isAuthenticated && tabValue === 2, // Fetch only when authenticated and on Generated Images tab
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  // Handle errors for images
  useEffect(() => {
    if (isImagesError) {
      toast.error(
        "Error loading images: " + (imagesError?.message || "Unknown error")
      );
    }
  }, [isImagesError, imagesError]);

  // Handle errors for conversations
  useEffect(() => {
    if (isError) {
      toast.error(
        "Error loading conversations: " + (error?.message || "Unknown error")
      );
    }
  }, [isError, error]);

  // Process conversations data
  const conversations = useMemo(() => {
    if (!conversationsData || !conversationsData.results) return [];

    return conversationsData.results.map((conv) => ({
      id: conv.id,
      title: conv.title,
      createdAt: parseISO(conv.created_at),
      updatedAt: parseISO(conv.updated_at),
      lastMessage:
        conv.messages && conv.messages.length > 0
          ? conv.messages[conv.messages.length - 1].message_body
          : "No messages yet.",
      userUsername: conv.user_username,
    }));
  }, [conversationsData]);

  // Group conversations by custom date labels
  const groupedConversations = useMemo(() => {
    const groups = {};

    conversations.forEach((conv) => {
      const groupLabel = getGroupLabel(conv.createdAt);

      if (!groups[groupLabel]) {
        groups[groupLabel] = [];
      }

      groups[groupLabel].push(conv);
    });

    return groups;
  }, [conversations]);

  // Filtered and grouped conversations based on search query
  const filteredGroupedConversations = useMemo(() => {
    if (!searchQuery.trim()) return groupedConversations;

    const filtered = conversations.filter(
      (conv) =>
        conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const groups = {};

    filtered.forEach((conv) => {
      let groupLabel = format(conv.createdAt, "MMMM dd, yyyy");

      if (isToday(conv.createdAt)) {
        groupLabel = "Today";
      } else if (isYesterday(conv.createdAt)) {
        groupLabel = "Yesterday";
      }

      if (!groups[groupLabel]) {
        groups[groupLabel] = [];
      }

      groups[groupLabel].push(conv);
    });

    return groups;
  }, [searchQuery, groupedConversations, conversations]);

  // Handle conversation click
  const handleConversationClick = (conversationId) => {
    activateConversation(conversationId);
    navigate("/chat");
  };

  // Handle group toggle
  const handleGroupClick = (group) => {
    setOpenGroups((prev) => ({
      ...prev,
      [group]: !prev[group],
    }));
  };

  if (loading || !user) {
    // Optionally show a spinner or loading message
    return <Typography>Loading account information...</Typography>;
  }

  return (
    <>
      <CssBaseline />
      <Toolbar />
      <Box
        sx={{
          padding: isSmallScreen ? 2 : 4,
        }}
      >
        {/* Title Section */}
        <Typography variant="h4" gutterBottom>
          Account
        </Typography>

        {/* User Information */}
        <UserInfo
          user={{
            /* avatar: "/static/images/avatar/1.jpg", */
            name: user.username,
            email: user.email,
            joinedDate: user.joined_date,
          }}
        />

        {/* Tabs */}
        <Box sx={{ borderBottom: 1 }}>
          <Tabs
            value={tabValue}
            onChange={handleChange}
            aria-label="Account Tabs"
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
          >
            <Tab label="General Information" {...a11yProps(0)} />
            <Tab label="Chats" {...a11yProps(1)} />
            <Tab label="Generated Images" {...a11yProps(2)} />
          </Tabs>
        </Box>

        {/* Tab Panels */}
        <TabPanel value={tabValue} index={0}>
          {/* General Information */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: isSmallScreen ? "column" : "row",
                gap: 2,
              }}
            >
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" color="text.secondary">
                  Username
                </Typography>
                <Typography variant="body1">{user.username}</Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body1">{user.email}</Typography>
              </Box>
            </Box>
            <Box
              sx={{
                display: "flex",
                flexDirection: isSmallScreen ? "column" : "row",
                gap: 2,
              }}
            >
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" color="text.secondary">
                  Chats
                </Typography>
                <Typography variant="body1">{user.chats}</Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" color="text.secondary">
                  Images
                </Typography>
                <Typography variant="body1">{user.images}</Typography>
              </Box>
            </Box>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {/* Chats/Conversations */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* Search Bar */}
            <TextField
              variant="outlined"
              placeholder="Search Conversations"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />

            {/* Conversations List */}
            <ConversationList
              groupedConversations={filteredGroupedConversations}
              isLoading={isLoading}
              onConversationClick={handleConversationClick}
              theme={theme}
            />
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {/* Generated Images */}
          <GeneratedImagesList />
        </TabPanel>
      </Box>
    </>
  );
};

export default Account;
