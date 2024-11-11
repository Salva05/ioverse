import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Divider,
  IconButton,
  Button,
  Paper,
  Slider,
  Switch,
  MenuItem,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SendIcon from "@mui/icons-material/Send";
import SettingsIcon from "@mui/icons-material/Settings";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";

const Container = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        flexGrow: 1,
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          gap: 2,
          padding: 2,
          flexGrow: 1,
          overflow: "hidden",
        }}
      >
        {/* Left Sidebar */}
        <Paper
          elevation={3}
          sx={{ flex: "1 1 0%", padding: 2, minWidth: 250, overflow: "auto" }}
          className="drawer-scrollbar"
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "4px 8px",
              borderRadius: 1,
              cursor: "pointer",
              width: "100%",
              "&:hover": {
                backgroundColor: (theme) => theme.palette.action.hover,
              },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <SmartToyIcon fontSize="small" />
              <Typography variant="subtitle2" sx={{ marginLeft: 0.5 }}>
                Secret Retriever
              </Typography>
            </Box>

            <UnfoldMoreIcon fontSize="small" />
          </Box>
          <TextField
            label="Name"
            defaultValue="Secret Retriever"
            variant="outlined"
            fullWidth
            margin="normal"
          />
          <TextField
            label="System Instructions"
            multiline
            rows={4}
            defaultValue="You are a secret seeker. You retrieve the desired secret from files and tell it to the user."
            variant="outlined"
            fullWidth
            margin="normal"
          />
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" gutterBottom>
            Model
          </Typography>
          <TextField
            select
            variant="outlined"
            fullWidth
            margin="normal"
            defaultValue="gpt-4"
          >
            <MenuItem value="gpt-4">gpt-4</MenuItem>
            <MenuItem value="gpt-3.5">gpt-3.5</MenuItem>
          </TextField>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" gutterBottom>
            Tools
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Switch defaultChecked />
            <Typography>File search</Typography>
            <IconButton>
              <SettingsIcon />
            </IconButton>
            <IconButton>
              <FileCopyIcon />
            </IconButton>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Switch />
            <Typography>Code interpreter</Typography>
            <IconButton>
              <AddIcon />
            </IconButton>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography>Functions</Typography>
            <IconButton>
              <AddIcon />
            </IconButton>
          </Box>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" gutterBottom>
            Model Configuration
          </Typography>
          <Typography variant="body2" gutterBottom>
            Response Format
          </Typography>
          <TextField
            select
            variant="outlined"
            fullWidth
            margin="normal"
            defaultValue="text"
          >
            <MenuItem value="text">text</MenuItem>
            <MenuItem value="json">json</MenuItem>
          </TextField>
          <Typography variant="body2" gutterBottom>
            Temperature
          </Typography>
          <Slider defaultValue={1.01} step={0.01} min={0} max={2} />
          <Typography variant="body2" gutterBottom>
            Top P
          </Typography>
          <Slider defaultValue={0.89} step={0.01} min={0} max={1} />
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" gutterBottom>
            API Version
          </Typography>
          <Button variant="contained" color="primary">
            Switch to v1
          </Button>
          <Divider sx={{ my: 2 }} />
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Button variant="outlined" color="secondary">
              Clone
            </Button>
            <Button variant="outlined" color="secondary">
              Delete
            </Button>
          </Box>
        </Paper>

        {/* Right Content Area */}
        <Paper
          elevation={3}
          sx={{
            flex: "3 1 0%",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: 2,
              borderBottom: "1px solid #e0e0e0",
            }}
          >
            <Typography variant="h6">THREAD</Typography>
          </Box>
          <Box
            sx={{ flex: 1, padding: 2, overflow: "auto" }}
            className="drawer-scrollbar"
          >
            {/* Chat area */}
          </Box>
          <Divider />
          <Box sx={{ display: "flex", alignItems: "center", padding: 2 }}>
            <TextField
              placeholder="Enter your message..."
              fullWidth
              variant="outlined"
              multiline
              maxRows={3}
              margin="dense"
            />
            <IconButton color="primary" sx={{ ml: 1 }}>
              <SendIcon />
            </IconButton>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default Container;
