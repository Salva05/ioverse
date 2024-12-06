import React, { useEffect, useState, useRef } from "react";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import {
  List,
  ListItem,
  ListItemText,
  Container,
  Alert,
  useTheme,
  useMediaQuery,
  IconButton,
  ThemeProvider,
  Menu,
  MenuItem,
} from "@mui/material";
import chat from "../api/chat";
import { useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import he from "he";
import { useDarkMode } from "../contexts/DarkModeContext";
import { GrSystem } from "react-icons/gr";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";

const drawerWidth = 240;

const StyledAppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  backgroundColor: "#1e1e1e",
  transition: theme.transitions.create(["margin", "width"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
  }),
}));

const MessageItem = ({ sender, message }) => {
  const theme = useTheme();
  const isUser =
    sender.toLowerCase() === "you" || sender.toLowerCase() === "user";
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <ListItem
      sx={{
        justifyContent: isUser ? "flex-end" : "flex-start",
        display: "flex",
        paddingX: { xs: "4px", sm: "8px", md: "12px" },
        width: "100%",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          marginY: "8px",
          padding: { xs: "8px 12px", sm: "10px 15px", md: "12px 18px" },
          backgroundColor: isUser
            ? theme.palette.mode === "dark"
              ? theme.palette.grey[300]
              : theme.palette.primary.main
            : theme.palette.mode === "dark"
            ? theme.palette.grey[800]
            : theme.palette.grey[300],
          color: isUser
            ? theme.palette.primary.contrastText
            : theme.palette.text.primary,
          borderRadius: isUser ? "15px 0 15px 15px" : "0 15px 15px 15px",
          maxWidth: "560px",
          width: "auto",
          wordBreak: "break-word",
          overflowWrap: "break-word",
        }}
      >
        <ListItemText
          sx={{
            fontFamily: "'Montserrat', serif",
            whiteSpace: "pre-wrap",
            "& *": {
              fontFamily: "'Montserrat', serif !important",
            },
            "& code": {
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            },
          }}
        >
          <ReactMarkdown
            rehypePlugins={[rehypeSanitize]}
            remarkPlugins={[remarkGfm]}
          >
            {he.decode(message)}
          </ReactMarkdown>
        </ListItemText>
      </Paper>
    </ListItem>
  );
};

export default function SharedConversation() {
  const [conversation, setConversation] = useState([]);
  const [error, setError] = useState(null);
  const { share_token } = useParams();
  const messagesEndRef = useRef(null);

  const theme = useTheme();
  const { themePreference, toggleThemePreference } = useDarkMode();
  const [anchorEl, setAnchorEl] = useState(null);

  const openMenu = (event) => setAnchorEl(event.currentTarget);
  const closeMenu = () => setAnchorEl(null);

  useEffect(() => {
    const fetchConversation = async () => {
      try {
        const response = await chat.getSharedConversation(share_token);
        setConversation(response.messages);
        scrollToBottom();
      } catch (error) {
        setError("Conversation not found.");
        console.error(
          "An error occurred while fetching the conversation:",
          error
        );
      }
    };

    fetchConversation();
  }, [share_token]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Auto-scroll when conversation updates
  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  return (
    <ThemeProvider theme={theme}>
      <StyledAppBar position="fixed" open={false}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <IconButton color="inherit" onClick={openMenu}>
            {themePreference === "light" ? (
              <LightModeIcon fontSize="small" />
            ) : themePreference === "dark" ? (
              <DarkModeIcon fontSize="small" />
            ) : (
              <GrSystem size={17} />
            )}
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={closeMenu}
          >
            <MenuItem
              selected={themePreference === "light"}
              onClick={() => {
                toggleThemePreference("light");
                closeMenu();
              }}
              sx={{
                display: "flex",
                justifyContent: "flex-start",
                alignItems: "center",
                borderRadius: "10px",
                padding: "4px 16px",
                minWidth: "150px",
                fontFamily: "'Montserrat', serif"
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: "8px",
                }}
              >
                <LightModeIcon fontSize="small" />
              </Box>
              Light
            </MenuItem>
            <MenuItem
              selected={themePreference === "dark"}
              onClick={() => {
                toggleThemePreference("dark");
                closeMenu();
              }}
              sx={{
                display: "flex",
                justifyContent: "flex-start",
                alignItems: "center",
                borderRadius: "10px",
                padding: "4px 16px",
                minWidth: "150px",
                fontFamily: "'Montserrat', serif"
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: "8px",
                }}
              >
                <DarkModeIcon fontSize="small" />
              </Box>
              Dark
            </MenuItem>
            <MenuItem
              selected={themePreference === "system"}
              onClick={() => {
                toggleThemePreference("system");
                closeMenu();
              }}
              sx={{
                display: "flex",
                justifyContent: "flex-start",
                alignItems: "center",
                borderRadius: "10px",
                padding: "4px 16px",
                minWidth: "150px",
                fontFamily: "'Montserrat', serif"
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: "8px",
                }}
              >
                <GrSystem size={17} />
              </Box>
              System
            </MenuItem>
          </Menu>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ flexGrow: 1, textAlign: "center", fontFamily: "'Montserrat', serif" }}
          >
            IOverse
          </Typography>
        </Toolbar>
      </StyledAppBar>

      {/* Outer Container with Full Page Scroll */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          height: "100vh",
          paddingTop: "64px",
          backgroundColor: theme.palette.background.default,
          overflowY: "auto",
        }}
      >
        <Container
          maxWidth="md"
          sx={{
            width: "100%",
            padding: { xs: "8px", sm: "16px" },
            display: "flex",
            flexDirection: "column",
          }}
        >
          {error ? (
            <Box sx={{ textAlign: "center", marginTop: "20px" }}>
              <Alert
                severity="warning"
                variant="filled"
                sx={{ marginBottom: "20px" }}
              >
                {error}
              </Alert>
              <Typography variant="h6" color="textSecondary">
                It looks like the conversation you're trying to access is either
                expired or does not exist.
              </Typography>
            </Box>
          ) : conversation.length > 0 ? (
            <List
              sx={{
                width: "100%",
                paddingX: { sm: "16px" },
                display: "flex",
                flexDirection: "column",
              }}
            >
              {conversation.map((msg, index) => (
                <MessageItem
                  key={index}
                  sender={msg.sender}
                  message={msg.message_body}
                />
              ))}
              <div ref={messagesEndRef} />
            </List>
          ) : (
            <Typography
              variant="body1"
              color="textSecondary"
              sx={{ textAlign: "center", mt: 2 }}
            >
              No messages in this conversation.
            </Typography>
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
}
