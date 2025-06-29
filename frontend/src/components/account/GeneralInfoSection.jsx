// src/components/account/GeneralInfoSection.tsx
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Divider,
  Grid,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { deepPurple } from "@mui/material/colors";
import { useContext } from "react";
import { useTheme } from "@mui/material/styles";
import EmailIcon from "@mui/icons-material/Email";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import ImageIcon from "@mui/icons-material/Image";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import dayjs from "dayjs";
import { AuthContext } from "../../contexts/AuthContext";
import TabPanel from "./TabPanel";
import ConsumptionsPanel from "./ConsumptionsPanel";

const GeneralInfoSection = ({ tabValue }) => {
  const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.down("sm"));
  const { user } = useContext(AuthContext);

  if (!user) return null;

  const stats = [
    { label: "Chats", value: user.chats, icon: <ChatBubbleIcon /> },
    { label: "Images", value: user.images, icon: <ImageIcon /> },
  ];

  return (
    <TabPanel value={tabValue} index={0} sx={{ px: isSm ? 0 : 1 }}>
      <Card
        elevation={3}
        sx={{
          borderRadius: 3,
          bgcolor: theme.palette.mode === "dark" ? "grey.900" : "grey.50",
        }}
      >
        <CardContent>
          {/* Header (avatar + name) */}
          <Stack
            direction={isSm ? "column" : "row"}
            alignItems="center"
            spacing={isSm ? 2 : 3}
          >
            <Avatar
              sx={{
                bgcolor: deepPurple[500],
                width: 72,
                height: 72,
                fontSize: 32,
              }}
            >
              {user.username.charAt(0).toUpperCase()}
            </Avatar>

            <Stack>
              <Typography variant="h5" fontWeight={600}>
                {user.username}
              </Typography>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                color="text.secondary"
              >
                <CalendarMonthIcon fontSize="small" />
                <Typography variant="body2">
                  Joined {dayjs(user.joined_date).format("DD MMM YYYY")}
                </Typography>
              </Stack>
            </Stack>
          </Stack>

          <Typography variant="h6" flexGrow={1} sx={{ mt: 4, mb: 1 }}>
            General
          </Typography>

          <Divider />

          {/* Contact row */}
          <Grid container spacing={isSm ? 2 : 4} sx={{ mt: 0 }}>
            <Grid item xs={12} sm={6}>
              <InfoRow icon={<EmailIcon />} label="Email" value={user.email} />
            </Grid>
            <Grid item xs={12} sm={6}>
              {/* keep space consistent even when second column is empty on small screens */}
            </Grid>

            {/* Stats */}
            {stats.map((s) => (
              <Grid item xs={12} sm={6} md={3} key={s.label}>
                <StatCard {...s} />
              </Grid>
            ))}
          </Grid>

          <ConsumptionsPanel />
        </CardContent>
      </Card>
    </TabPanel>
  );
};

export default GeneralInfoSection;

/* ---------- helpers ---------- */
const InfoRow = ({ icon, label, value }) => (
  <Stack direction="row" spacing={2} alignItems="center">
    {icon}
    <Box>
      <Typography variant="subtitle2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body1">{value}</Typography>
    </Box>
  </Stack>
);

const StatCard = ({ icon, label, value }) => (
  <Card
    variant="outlined"
    sx={{
      borderRadius: 2,
      height: "100%",
      transition: "transform 150ms",
      "&:hover": { transform: "translateY(-4px)" },
    }}
  >
    <CardContent>
      <Stack direction="row" spacing={2} alignItems="center">
        {icon}
        <Box>
          <Typography variant="h6">{value}</Typography>
          <Typography variant="caption" color="text.secondary">
            {label}
          </Typography>
        </Box>
      </Stack>
    </CardContent>
  </Card>
);
