import React from "react";
import { Typography, Box, Avatar, Paper, useMediaQuery } from "@mui/material";

const UserInfo = ({ user }) => {
  const isSmallScreen = useMediaQuery((theme) => theme.breakpoints.down("sm"));

  return (
    <Paper elevation={3} sx={{ padding: 3, marginBottom: 4 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: isSmallScreen ? "column" : "row",
          alignItems: "center",
          gap: isSmallScreen ? 2 : 3,
          "& *": {
            fontFamily: "'Montserrat', serif"
          }
        }}
      >
        <Avatar
          alt="User Avatar"
          src=""
          sx={{
            width: isSmallScreen ? 80 : 120,
            height: isSmallScreen ? 80 : 120,
          }}
        />
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: isSmallScreen ? "center" : "flex-start",
            textAlign: isSmallScreen ? "center" : "left",
          }}
        >
          <Typography variant="h6">{user.name}</Typography>
          <Typography variant="body1" color="text.secondary">
            Email: {user.email}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Joined: {user.joinedDate}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default UserInfo;
