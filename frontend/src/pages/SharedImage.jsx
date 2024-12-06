import React, { useEffect, useState } from "react";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import {
  Container,
  Alert,
  useTheme,
  ThemeProvider,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import textToImage from "../api/textToImage";
import { useParams } from "react-router-dom";
import { styled } from "@mui/system";
import MuiAppBar from "@mui/material/AppBar";
import { useDarkMode } from "../contexts/DarkModeContext";
import { GrSystem } from "react-icons/gr";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";

const StyledAppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  backgroundColor: "#1e1e1e",
  transition: theme.transitions.create(["margin", "width"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
}));

export default function SharedImage() {
  const [image, setImage] = useState("");
  const [error, setError] = useState(null);
  const { share_token } = useParams();

  const theme = useTheme();
  const { themePreference, toggleThemePreference } = useDarkMode();
  const [anchorEl, setAnchorEl] = useState(null);

  const openMenu = (event) => setAnchorEl(event.currentTarget);
  const closeMenu = () => setAnchorEl(null);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const response = await textToImage.getSharedImage(share_token);
        setImage(response.image);
      } catch (error) {
        setError("Image not found.");
        console.error("An error occurred while fetching the image:", error);
      }
    };

    fetchImage();
  }, [share_token]);

  return (
    <>
      <ThemeProvider theme={theme}>
        <StyledAppBar position="fixed" open={false}>
          <Toolbar sx={{ display: "flex", justifyContent: "center" }}>
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
        <Toolbar />
        {error && (
          <Container
            maxWidth="md"
            sx={{
              width: "100%",
              padding: { xs: "8px", sm: "16px" },
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box sx={{ textAlign: "center", marginTop: "20px" }}>
              <Alert
                severity="warning"
                variant="filled"
                sx={{ marginBottom: "20px" }}
              >
                {error}
              </Alert>
              <Typography variant="h6" color="textSecondary">
                It looks like the shared image you're looking for is either
                expired or does not exist.
              </Typography>
            </Box>
          </Container>
        )}
        {/* Outer Container with Full Page Scroll */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            height: "calc(100vh - 64px)",
            backgroundColor: theme.palette.background.default,
          }}
        >
          <Container
            sx={{
              width: "100%",
              padding: { xs: "8px", sm: "16px" },
              display: "flex",
              flexDirection: "column",
            }}
          >
            {image && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  maxWidth: "100%",
                  maxHeight: "100%",
                }}
              >
                <Box
                  component="img"
                  src={image}
                  alt="Shared"
                  sx={{
                    width: "auto",
                    height: "auto",
                    maxWidth: "100vw",
                  }}
                />
              </Box>
            )}
          </Container>
        </Box>
      </ThemeProvider>
    </>
  );
}
