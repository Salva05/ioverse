import { Typography, Box, useMediaQuery } from "@mui/material";
import { useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import TabPanel from "./TabPanel";

const GeneralInfo = ({ tabValue, theme }) => {
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const { user } = useContext(AuthContext);

  return (
    <TabPanel value={tabValue} index={0}>
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
  );
};

export default GeneralInfo;
