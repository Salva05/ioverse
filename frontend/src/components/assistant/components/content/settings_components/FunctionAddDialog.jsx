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
  CircularProgress,
} from "@mui/material";
import { BsStars } from "react-icons/bs";
import { IoIosArrowDown } from "react-icons/io";
import Editor from "react-simple-code-editor";
import Prism from "prismjs";
import "prismjs/components/prism-json";
import "prismjs/themes/prism.css";
import { exampleJSONs } from "../../../../../utils/exampleJSONFunctions";
import { toast } from "react-toastify";
import { handleEditorKeyDown } from "../../../../../utils/codeFormatter";
import { useUpdateAssistant } from "../../../../../hooks/assistant/useUpdateAssistant";
import { getFunctionToolErrorMessage } from "../../../../../utils/getFunctionToolErrorMessage";
import { GoTrash } from "react-icons/go";

// Remove default background of prism.css for semicolon
// which was causing it to be white
Prism.hooks.add("wrap", function (env) {
  if (env.type === "operator") {
    env.attributes.style =
      "background: none !important; color: inherit !important;";
  }
});

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const FunctionAddDialog = ({
  openDialog,
  handleClose,
  assistant,
  activeFunction,
  handleRemove,
  isRemovalPending,
  menuOptions = ["get_weather()", "get_stock_price()", "get_traffic()"],
  isResponseFormat = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(`(max-width:500px)`);
  const fullScreen = useMediaQuery("(max-width:600px)");

  const { mutate, isPending, isSuccess } = useUpdateAssistant();

  // highlight boolean values
  Prism.hooks.add("wrap", function (env) {
    if (env.type === "boolean") {
      env.attributes.style = `color: ${theme.palette.primary.main};`;
    }
  });

  // Examples List
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  // JSON Content State
  const [jsonContent, setJsonContent] = useState("");

  useEffect(() => {
    if (activeFunction && openDialog) {
      try {
        const formattedJSON = JSON.stringify(activeFunction, null, 2);
        setJsonContent(formattedJSON);
      } catch (error) {
        console.error("Failed to stringify activeFunction:", error);
        setJsonContent("");
      }
    } else {
      setJsonContent("");
    }
  }, [activeFunction, openDialog]);

  // Syntax highlighting function
  const highlightCode = (code) =>
    Prism.highlight(code, Prism.languages.json, "json");

  const handleExamplesClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  // Save function handler
  const handleSave = () => {
    const f = jsonContent.trim();

    if (!f) {
      toast.error("Function definition is empty.");
      return;
    }

    try {
      // Attempt to parse the JSON content
      const parsedJSON = JSON.parse(f);

      // Check for 'name' required property
      if (!parsedJSON.name) {
        toast.error("The JSON must contain a 'name' property.");
        return;
      }

      // For function
      if (!isResponseFormat) {
        // Add default 'strict' and 'parameters' fields if not provided
        if (parsedJSON.strict === undefined) {
          parsedJSON.strict = false;
        }
        if (!parsedJSON.parameters) {
          parsedJSON.parameters = {
            type: "object",
            properties: {},
            required: [],
          };
        }
      }

      let updatedAssistant;

      // Conditional insertion of function or json_schema
      if (isResponseFormat) {
        // Schema creation
        const newSchema = {
          type: "json_schema",
          json_schema: parsedJSON,
        };
        // Assistant update
        updatedAssistant = {
          ...assistant,
          response_format: newSchema,
        };

      } else {
        // Function creation
        const newFunction = {
          type: "function",
          function: parsedJSON,
        };

        if (activeFunction) {
          // Update the existing function
          updatedAssistant = {
            ...assistant,
            tools: [
              ...assistant.tools.filter(
                (tool) =>
                  tool.type !== "function" || // Keep all non-function tools
                  tool.function.name !== activeFunction.name // Exclude the active function tool
              ),
              newFunction,
            ],
          };
        } else {
          // Create a new function
          updatedAssistant = {
            ...assistant,
            tools: [...assistant.tools, newFunction],
          };
        }
      }

      // Update the assistant and catch any API-specific error
      mutate({
        id: assistant.id,
        assistantData: updatedAssistant,
        customOnError: (error) => {
          const errorMessage = getFunctionToolErrorMessage(error);
          toast.error(errorMessage);
        },
      });
    } catch (error) {
      toast.error(error.message || "Invalid JSON format.");
    }
  };

  useEffect(() => {
    if (isSuccess) {
      setJsonContent("");
      handleClose();
    }
  }, [isSuccess]);

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
          {isPending && (
            <CircularProgress
              color="inherit"
              size={18}
              sx={{ verticalAlign: "middle", mr: 2, mb: 0.5 }}
            />
          )}
          {isResponseFormat ? "Add response format" : "Add Function"}
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
          {!isResponseFormat
            ? "The model will intelligently decide to call functions based on input it receives from the user."
            : "Use a JSON schema to define the structure of the model's response format."}{" "}
          <Link
            href={
              isResponseFormat
                ? "https://platform.openai.com/docs/guides/structured-outputs"
                : "https://platform.openai.com/docs/guides/function-calling"
            }
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
                {menuOptions.map((text, index) => (
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
                ))}
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
              placeholder={exampleJSONs["placeholder_function"]}
              value={jsonContent}
              onValueChange={(code) => setJsonContent(code)} // Updates the content
              onKeyDown={(event) =>
                handleEditorKeyDown(event, jsonContent, setJsonContent)
              }
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
          {!isResponseFormat && (
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
          )}
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
        {activeFunction && !isResponseFormat && (
          <Button
            onClick={() => handleRemove(activeFunction.name, handleClose)}
            variant="contained"
            size="small"
            sx={{
              paddingX: 1,
              paddingY: 0.8,
              minWidth: "auto",
              color: "inherit",
              backgroundColor: (theme) => theme.palette.error.light,
              "&:hover": {
                backgroundColor: (theme) => theme.palette.error.dark,
              },
              textTransform: "none",
            }}
          >
            {isRemovalPending ? (
              <CircularProgress
                color="inherit"
                size={18}
                sx={{ verticalAlign: "middle" }}
              />
            ) : (
              <GoTrash size={18} />
            )}
          </Button>
        )}

        <Box sx={{ flexGrow: 1 }} />
        <Box
          sx={{
            display: "flex",
            gap: 1,
          }}
        >
          <Button
            onClick={handleClose}
            disabled={isRemovalPending}
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
            onClick={handleSave}
            disabled={isRemovalPending}
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
