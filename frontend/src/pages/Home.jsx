import {
  Box,
  Button,
  Container,
  Grid,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import ImageIcon from "@mui/icons-material/Image";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import { Link as RouterLink } from "react-router-dom";

export default function HomePage() {
  const theme = useTheme();

  const features = [
    {
      icon: ChatIcon,
      title: "Chat Completion",
      description: "Conversational AI powered by GPT-4o.",
      route: "/chat",
    },
    {
      icon: ImageIcon,
      title: "Text-to-Image",
      description: "Generate images with DALL·E.",
      route: "/text-to-image",
    },
    {
      icon: SmartToyIcon,
      title: "Assistant API",
      description: "Create custom AI assistants.",
      route: "/assistant",
    },
  ];

  return (
    <Box
      sx={{
        flexGrow: 1,
        display: "flex",
        flexDirection: "column",
        pt: { xs: 2, sm: 0 },
      }}
    >
      <Box sx={{ ...theme.mixins.toolbar }} />

      <Container
        maxWidth="lg"
        sx={{
          py: { xs: 6, sm: 8, md: 10 },
          display: "flex",
          flexDirection: "column",
          gap: { xs: 6, md: 10 },
          flexGrow: 1,
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontWeight: 700,
              lineHeight: 1.2,
              fontSize: {
                xs: "2rem", // phones
                sm: "2.5rem", // small tablets
                md: "3rem", // desktops
                lg: "3.5rem", // large screens
              },
            }}
          >
            Welcome to IOverse
          </Typography>

          <Typography
            variant="h6"
            color="text.secondary"
            sx={{
              mt: 2,
              mx: "auto",
              maxWidth: 720,
              fontSize: { xs: "0.9rem", sm: "1rem" },
            }}
          >
            Chat, create and innovate with the latest OpenAI capabilities, all
            in one place.
          </Typography>

          <Box
            sx={{ mt: 4, display: "flex", justifyContent: "center", gap: 2 }}
          >
            <Button
              variant="contained"
              size="large"
              component={RouterLink}
              to="/chat"
            >
              Start Chatting
            </Button>
            <Button
              variant="outlined"
              size="large"
              component={RouterLink}
              to="/register"
            >
              Register
            </Button>
          </Box>
        </Box>

        <Grid container spacing={{ xs: 4, md: 6 }}>
          {features.map(({ icon: Icon, title, description, route }) => (
            <Grid item xs={12} sm={4} key={title}>
              <Box
                sx={{
                  p: 4,
                  borderRadius: 3,
                  height: "100%",
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 2,
                  bgcolor: theme.palette.background.paper,
                  boxShadow: 1,
                }}
              >
                <Icon sx={{ fontSize: 48, color: "primary.main" }} />
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    fontSize: { xs: "1rem", sm: "1.125rem" },
                  }}
                >
                  {title}
                </Typography>
                <Typography
                  color="text.secondary"
                  sx={{
                    flexGrow: 1,
                    fontSize: { xs: "0.875rem", sm: "0.95rem" },
                  }}
                >
                  {description}
                </Typography>
                <Button variant="text" component={RouterLink} to={route}>
                  Explore
                </Button>
              </Box>
            </Grid>
          ))}
        </Grid>

        <Box
          component="footer"
          sx={{
            textAlign: "center",
            mt: { xs: 8, md: 12 },
            py: { xs: 6, md: 8 },
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              mb: 2,
              fontSize: { xs: "1.25rem", sm: "1.5rem" },
            }}
          >
            Deep-dive into IOverse
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              mb: 4,
              maxWidth: 640,
              mx: "auto",
              fontSize: { xs: "0.9rem", sm: "1rem" },
            }}
          >
            Browse step-by-step guides, API reference and walkthroughs to start
            your first chat, generate images, or craft a custom assistant in
            minutes.
          </Typography>

          <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
            <Button
              variant="outlined"
              size="large"
              component="a"
              href="https://github.com/Salva05/ioverse"
              target="_blank"
              rel="noopener"
            >
              GitHub
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
