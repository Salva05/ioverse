import React, { forwardRef, useEffect, useState } from "react";
import {
  useTheme,
  useMediaQuery,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Slide,
  Typography,
  Divider,
  Link,
  IconButton,
  MenuItem,
  Menu,
} from "@mui/material";
import { BsStars } from "react-icons/bs";
import { IoIosArrowDown } from "react-icons/io";
import Editor from "react-simple-code-editor";
import Prism from "prismjs";
import "prismjs/components/prism-json";
import "prismjs/themes/prism.css";

Prism.hooks.add("wrap", function (env) {
  if (env.type === "operator") {
    // Remove default background of prism.css
    env.attributes.style =
      "background: none !important; color: inherit !important;";
  }
});

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const FunctionAddDialog = ({ openDialog, handleClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(`(max-width:500px)`);
  const fullScreen = useMediaQuery("(max-width:600px)");

  // Examples List
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  // JSON Content State
  const [jsonContent, setJsonContent] = useState("");

  // Syntax highlighting function
  const highlightCode = (code) =>
    Prism.highlight(code, Prism.languages.json, "json");

  // Add a Prism hook for boolean values
  useEffect(() => {
    Prism.hooks.add("wrap", function (env) {
      if (env.type === "boolean") {
        env.attributes.style = `color: ${theme.palette.primary.main};`;
      }
    });
  }, [theme]);

  // Example JSONs
  const exampleJSONs = {
    get_weather: `{
  "name": "get_weather",
  "description": "Determine weather in my location",
  "strict": true,
  "parameters": {
    "type": "object",
    "properties": {
      "location": {
        "type": "string",
        "description": "The city and state e.g. San Francisco, CA"
      },
      "unit": {
        "type": "string",
        "enum": [
          "c",
          "f"
        ]
      }
    },
    "additionalProperties": false,
    "required": [
      "location",
      "unit"
    ]
  }
}`,
    get_stock_price: `{
  "name": "get_stock_price",
  "description": "Get the current stock price",
  "strict": true,
  "parameters": {
    "type": "object",
    "properties": {
      "symbol": {
        "type": "string",
        "description": "The stock symbol"
      }
    },
    "additionalProperties": false,
    "required": ["symbol"]
  }
}`,
    get_traffic: `{
  "name": "get_traffic",
  "description": "Gives current traffic conditions for a given area.",
  "parameters": {
    "type": "object",
    "properties": {
      "location": {
        "type": "object",
        "properties": {
          "city": {
            "type": "string",
            "description": "Name of the city"
          },
          "state": {
            "type": "string",
            "description": "Two-letter state abbreviation"
          }
        },
        "required": [
          "city",
          "state"
        ]
      }
    },
    "required": [
      "location"
    ]
  }
}`,
  };

  const handleExamplesClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  return (
    <Dialog
      open={openDialog}
      onClose={handleClose}
      fullScreen={fullScreen}
      aria-labelledby="add-functions-title"
      aria-describedby="add-functions-description"
      maxWidth="md"
      TransitionComponent={Transition}
      sx={{
        "& .MuiPaper-root": {
          borderRadius: "12px",
        },
      }}
    >
      <DialogTitle id="add-functions-title">
        <Typography
          variant="h6"
          component="div"
          sx={{
            fontFamily: "'Montserrat', serif",
            fontWeight: "bold",
            fontSize: isMobile ? "1rem" : "1.1rem",
          }}
        >
          Add Function
        </Typography>
      </DialogTitle>
      <DialogContent
        sx={{
          px: 3,
          pb: 2,
        }}
      >
        <Typography
          variant="body2"
          sx={{
            fontFamily: "'Montserrat', serif",
            mb: 2,
            color: theme.palette.text.secondary,
            fontSize: isMobile ? "0.8rem" : "0.85rem",
          }}
        >
          The model will intelligently decide to call functions based on input
          it receives from the user.{" "}
          <Link
            href="https://platform.openai.com/docs/guides/function-calling"
            target="_blank"
            rel="noopener"
            sx={{
              fontSize: "inherit",
              fontFamily: "'Montserrat', serif",
              textDecoration: "none",
              color: theme.palette.primary.main,
              "&:hover": {
                textDecoration: "underline",
              },
            }}
          >
            Learn more.
          </Link>
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{
                fontFamily: "'Montserrat', serif",
                mb: 1,
                fontWeight: 600,
              }}
            >
              Definition
            </Typography>
            <Box sx={{ flexGrow: 1 }} />
            <Box>
              <IconButton
                sx={{
                  gap: 0.5,
                  color: "inherit",
                  paddingY: 0.3,
                  borderRadius: 2,
                }}
                aria-label="stars"
              >
                <BsStars size="1rem" style={{ marginBottom: 2.5 }} />
                <Typography variant="body2">Generate</Typography>
              </IconButton>
            </Box>
            <Box>
              <IconButton
                onClick={handleExamplesClick}
                aria-controls={open ? "examples-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={open ? "true" : undefined}
                sx={{
                  gap: 0.5,
                  color: "inherit",
                  paddingY: 0.3,
                  borderRadius: 2,
                }}
                aria-label="examples"
              >
                <Typography variant="body2" sx={{}}>
                  Examples
                </Typography>
                <IoIosArrowDown size="1rem" style={{}} />
              </IconButton>
              <Menu
                id="examples-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleCloseMenu}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "left",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "left",
                }}
                slotProps={{
                  paper: {
                    sx: {
                      minWidth: 150,
                      borderRadius: 3,
                      boxShadow: 3,
                      overflow: "hidden",
                    },
                  },
                }}
              >
                {["get_weather()", "get_stock_price()", "get_traffic()"].map(
                  (text, index) => (
                    <MenuItem
                      key={index}
                      onClick={() => {
                        handleCloseMenu();
                        const functionName = text.replace("()", "");
                        setJsonContent(exampleJSONs[functionName]);
                      }}
                      sx={{
                        fontSize: "0.835rem",
                        padding: "4px 8px",
                        borderRadius: theme.shape.borderRadius,
                        margin: "2px auto",
                        "&:hover": {
                          backgroundColor: theme.palette.action.hover,
                        },
                      }}
                    >
                      {text}
                    </MenuItem>
                  )
                )}
              </Menu>
            </Box>
          </Box>
          <Box
            sx={{
              width: "100%",
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: "8px",
              fontFamily: "'Roboto Mono', monospace",
              fontSize: "0.875rem",
              backgroundColor:
                theme.palette.mode === "dark"
                  ? theme.palette.grey[900]
                  : theme.palette.grey[100],
              color:
                theme.palette.mode === "dark"
                  ? theme.palette.grey[300]
                  : theme.palette.text.primary,
              minHeight: "16em",
              overflow: "auto",
              whiteSpace: "pre",
              padding: "0",
            }}
          >
            <Editor
              placeholder={`{
  "name": "get_stock_price",
  "description": "Get the current stock price",
  "strict": true,
  "parameters": {
    "type": "object",
    "properties": {
      "symbol": {
        "type": "string",
        "description": "The stock symbol"
      }
    },
    "additionalProperties": false,
    "required": ["symbol"]
  }
}`}
              value={jsonContent}
              onValueChange={(code) => setJsonContent(code)}
              highlight={highlightCode}
              padding={12}
              style={{
                width: "100%",
                fontFamily: "'Roboto Mono', monospace",
                fontSize: "0.875rem",
                backgroundColor: "inherit",
                color: "inherit",
                minHeight: "27em",
                overflow: "auto",
                whiteSpace: "pre",
              }}
            />
          </Box>
          <Typography
            variant="caption"
            sx={{
              mt: 1,
              color: theme.palette.text.secondary,
              fontFamily: "'Montserrat', serif",
            }}
          >
            Add{" "}
            <Typography
              sx={{
                fontFamily: "'Montserrat', serif",
                display: "inline",
                fontSize: "inherit",
                border: "1px solid",
                pl: 0.7,
                pr: 0.5,
                pt: 0.2,
                pb: 0.4,
                borderRadius: 1.8,
                backgroundColor:
                  theme.palette.mode === "dark"
                    ? theme.palette.background.paper
                    : theme.palette.grey[100],
                mr: 0.6,
              }}
            >
              "strict": true{" "}
            </Typography>
            to ensure the model's response always follows this schema.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions
        sx={{
          paddingX: theme.spacing(3),
          paddingY: theme.spacing(2),
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ flexGrow: 1 }} />
        <Box
          sx={{
            display: "flex",
            gap: 1,
          }}
        >
          <Button
            onClick={handleClose}
            variant="outlined"
            color="inherit"
            size="small"
            sx={{
              color:
                theme.palette.mode === "dark"
                  ? theme.palette.grey[400]
                  : theme.palette.text.primary,
              borderColor:
                theme.palette.mode === "dark"
                  ? theme.palette.grey[700]
                  : theme.palette.grey[300],
              backgroundColor:
                theme.palette.mode === "dark"
                  ? theme.palette.grey[700]
                  : theme.palette.grey[300],
              "&:hover": {
                borderColor: theme.palette.grey[500],
                backgroundColor: theme.palette.action.hover,
              },
              textTransform: "none",
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleClose}
            autoFocus
            variant="contained"
            size="small"
            color="success"
            sx={{
              color: theme.palette.getContrastText(theme.palette.success.main),
              backgroundColor: theme.palette.success.main,
              "&:hover": {
                backgroundColor: theme.palette.success.dark,
              },
              textTransform: "none",
            }}
          >
            Save
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default FunctionAddDialog;
