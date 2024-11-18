import {
  useMediaQuery,
  Box,
  Button,
  Typography,
  useTheme,
} from "@mui/material";
import React, { useContext } from "react";
import { DrawerContext } from "../../../../../contexts/DrawerContext";
import { FaRegClone } from "react-icons/fa";

const drawerWidth = 240;

const Clone = () => {
  const theme = useTheme();
  const { open, isSmallScreen } = useContext(DrawerContext);
  const isMobile = useMediaQuery(
    isSmallScreen
      ? `(max-width:815px)`
      : `(max-width:${open ? 815 + drawerWidth : 815}px)`
  );

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        flexDirection: "row",
        gap: 1,
        ml: isMobile ? 0.4 : 1.2,
        mt: 1,
      }}
    >
      <Typography
        variant="body1"
        sx={{
          fontFamily: "'Montserrat', serif",
        }}
      >
        Clone
      </Typography>
      <Box sx={{ marginLeft: "auto", display: "flex", alignItems: "center" }}>
        <Button
          size="small"
          onClick={() => {}}
          sx={{
            textTransform: "none",
            borderRadius: 2.3,
            minWidth: 0,
            pr: 1,
            py: 0.3,
            pl: 0.7,
            backgroundColor:
              theme.palette.mode === "dark"
                ? theme.palette.grey[800]
                : theme.palette.grey[200],
            color: theme.palette.mode === "dark" ? "#fff" : "#000",
            "&:hover": {
              backgroundColor:
                theme.palette.mode === "dark"
                  ? theme.palette.grey[700]
                  : theme.palette.grey[300],
            },
          }}
        >
          <FaRegClone size="1rem" style={{ marginRight: 3 }} />
          <Typography
            sx={{
              fontSize: "0.95rem",
              fontFamily: "'Montserrat', serif",
            }}
          >
            Clone
          </Typography>
        </Button>
      </Box>
    </Box>
  );
};

export default Clone;
