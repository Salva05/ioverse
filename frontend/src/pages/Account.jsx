import { useState, useContext, useEffect } from "react";
import {
  Typography,
  Box,
  Tabs,
  Tab,
  useMediaQuery,
  CssBaseline,
  Toolbar,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { AuthContext } from "../contexts/AuthContext";
import chat from "../api/chat";
import TabPanel from "../components/account/TabPanel";
import GeneratedImagesList from "../components/account/GeneratedImagesList";
import textToImage from "../api/textToImage";
import GeneralInfoSection from "../components/account/GeneralInfoSection";
import ChatsSection from "../components/account/ChatsSection";

const a11yProps = (index) => {
  return {
    id: `account-tab-${index}`,
    "aria-controls": `account-tabpanel-${index}`,
  };
};

const Account = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const { isAuthenticated, user, loading } = useContext(AuthContext);

  const [tabValue, setTabValue] = useState(0);

  const handleChange = (event, newValue) => {
    setTabValue(newValue);
  };

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
          width: "100%",
          maxWidth: 1400,
          marginX: "auto",
          "& *": {
            fontFamily: "'Montserrat', serif",
          },
        }}
      >
        {/* Title Section */}
        <Typography
          variant="h4"
          gutterBottom
          sx={{ fontFamily: "'Montserrat', serif" }}
        >
          Account
        </Typography>

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
            <Tab label="General" {...a11yProps(0)} />
            <Tab label="Chats" {...a11yProps(1)} />
            <Tab label="Generated Images" {...a11yProps(2)} />
          </Tabs>
        </Box>

        {/* Tab Panels */}
        <GeneralInfoSection tabValue={tabValue} theme={theme} />

        <ChatsSection
          theme={theme}
          tabValue={tabValue}
          isLoading={isLoading}
          conversationsData={conversationsData}
        />

        <TabPanel value={tabValue} index={2}>
          {/* Generated Images */}
          <GeneratedImagesList />
        </TabPanel>
      </Box>
    </>
  );
};

export default Account;
