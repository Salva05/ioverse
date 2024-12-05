import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import MuiCard from "@mui/material/Card";
import { styled } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import register from "../api/registration";
import { AuthContext } from "../contexts/AuthContext";
import {
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
  Toolbar,
  Tooltip,
  useTheme,
} from "@mui/material";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Check from "@mui/icons-material/Check";
import StepConnector, {
  stepConnectorClasses,
} from "@mui/material/StepConnector";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import CloseIcon from "@mui/icons-material/Close";

const Card = styled(MuiCard)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignSelf: "center",
  width: "100%",
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: "auto",
  boxShadow:
    "hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px",
  [theme.breakpoints.up("sm")]: {
    width: "450px",
  },
  ...theme.applyStyles("dark", {
    boxShadow:
      "hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px",
  }),
}));

const SignUpContainer = styled(Stack)(({ theme }) => ({
  padding: theme.spacing(2),
  position: "relative",
  flexGrow: 1,
  justifyContent: "center",
  [theme.breakpoints.up("sm")]: {
    padding: theme.spacing(4),
  },
  [theme.breakpoints.down("sm")]: {
    marginBottom: "80px",
  },
  "&::before": {
    content: '""',
    display: "block",
    position: "absolute",
    zIndex: -1,
    inset: 0,
  },
}));

const QontoConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 10,
    left: "calc(-50% + 16px)",
    right: "calc(50% + 16px)",
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: "#784af4",
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: "#784af4",
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    borderColor: "#eaeaf0",
    borderTopWidth: 3,
    borderRadius: 1,
    ...theme.applyStyles("dark", {
      borderColor: theme.palette.grey[800],
    }),
  },
}));

const QontoStepIconRoot = styled("div")(({ theme }) => ({
  color: "#eaeaf0",
  display: "flex",
  height: 22,
  alignItems: "center",
  "& .QontoStepIcon-completedIcon": {
    color: "#784af4",
    zIndex: 1,
    fontSize: 18,
  },
  "& .QontoStepIcon-circle": {
    width: 8,
    height: 8,
    borderRadius: "50%",
    backgroundColor: "currentColor",
  },
  ...theme.applyStyles("dark", {
    color: theme.palette.grey[700],
  }),
  variants: [
    {
      props: ({ ownerState }) => ownerState.active,
      style: {
        color: "#784af4",
      },
    },
  ],
}));

function QontoStepIcon(props) {
  const { active, completed, className } = props;

  return (
    <QontoStepIconRoot ownerState={{ active }} className={className}>
      {completed ? (
        <Check className="QontoStepIcon-completedIcon" />
      ) : (
        <div className="QontoStepIcon-circle" />
      )}
    </QontoStepIconRoot>
  );
}

export default function SignUp(props) {
  const theme = useTheme();
  const [emailError, setEmailError] = React.useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = React.useState("");
  const [error, setError] = React.useState("");
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState("");
  const [passwordConfirmError, setPasswordConfirmError] = React.useState(false);
  const [passwordConfirmErrorMessage, setPasswordConfirmErrorMessage] =
    React.useState("");
  const [nameError, setNameError] = React.useState(false);
  const [nameErrorMessage, setNameErrorMessage] = React.useState("");
  const [keyError, setKeyError] = React.useState(false);
  const [keyErrorMessage, setKeyErrorMessage] = React.useState("");
  const navigate = useNavigate();

  const [formData, setFormData] = React.useState({
    username: "",
    email: "",
    password: "",
    password_confirm: "",
    api_key: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  
    // Reset the specific error state
    switch (name) {
      case 'username':
        setNameError(false);
        setNameErrorMessage('');
        break;
      case 'email':
        setEmailError(false);
        setEmailErrorMessage('');
        break;
      case 'password':
        setPasswordError(false);
        setPasswordErrorMessage('');
        break;
      case 'password_confirm':
        setPasswordConfirmError(false);
        setPasswordConfirmErrorMessage('');
        break;
      case 'api_key':
        setKeyError(false);
        setKeyErrorMessage('');
        break;
      default:
        break;
    }
  };

  const { authenticate } = React.useContext(AuthContext);

  const [activeStep, setActiveStep] = React.useState(0);
  const [completedSteps, setCompletedSteps] = React.useState(new Set());
  const steps = ["Credentials", "Key", "Sign-up"];
  const handleNext = () => {
    if (validateInputs(activeStep)) {
      setCompletedSteps((prev) => new Set([...prev, activeStep])); // Mark step as completed
      if (activeStep < steps.length - 1) {
        setActiveStep((prev) => prev + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (activeStep > 0) {
      setCompletedSteps((prev) => {
        const newCompleted = new Set(prev);
        newCompleted.delete(activeStep);
        return newCompleted;
      });
      setActiveStep((prev) => prev - 1);
    }
  };
  
  const isStepCompleted = (step) => completedSteps.has(step);

  const validateInputs = (step) => {
    let valid = true;

    if (step === 0) {
      const { email, password, password_confirm, username } = formData;

      if (!email || !/\S+@\S+\.\S+/.test(email)) {
        setEmailError(true);
        setEmailErrorMessage("Please enter a valid email address.");
        valid = false;
      } else {
        setEmailError(false);
        setEmailErrorMessage("");
      }

      if (!password || password.length < 8) {
        setPasswordError(true);
        setPasswordErrorMessage("Password must be at least 8 characters long.");
        valid = false;
      } else {
        setPasswordError(false);
        setPasswordErrorMessage("");
      }

      if (password_confirm !== password) {
        setPasswordConfirmError(true);
        setPasswordConfirmErrorMessage("Passwords do not match.");
        valid = false;
      } else {
        setPasswordConfirmError(false);
        setPasswordConfirmErrorMessage("");
      }

      if (!username.trim()) {
        setNameError(true);
        setNameErrorMessage("Name is required.");
        valid = false;
      } else {
        setNameError(false);
        setNameErrorMessage("");
      }
    } else if (step === 1) {
      const { api_key } = formData;
      if (!api_key.trim()) {
        setKeyError(true);
        setKeyErrorMessage("API Key is required.");
        valid = false;
      } else {
        setKeyError(false);
        setKeyErrorMessage("");
      }
    }

    return valid;
  };

  const handleSubmit = async (event) => {
    setError("");
    event.preventDefault();
    // Reset error states
    setNameError(false);
    setEmailError(false);
    setPasswordError(false);
    setPasswordConfirmError(false);
    setKeyError(false);

    const userData = { ...formData };
    try {
      const response = await register(userData);

      if (response.status === 201) {
        const errorMessage = await authenticate(
          userData.username,
          userData.password
        );

        if (errorMessage) {
          setError(errorMessage);
        } else {
          navigate("/chat");
        }
      } else {
        console.error("Unexpected response status:", response.status);
        setError(`Unexpected response status: ${response.status}`);
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        const errorDetails = error.response.data.errors;
        console.log("Registration failed:", errorDetails);

        const stepsWithErrors = [];
        setNameError(false);
        setEmailError(false);
        setPasswordError(false);
        setPasswordConfirmError(false);
        setKeyError(false);
        setNameErrorMessage("");
        setEmailErrorMessage("");
        setPasswordErrorMessage("");
        setPasswordConfirmErrorMessage("");
        setKeyErrorMessage("");

        // Set errors and track affected steps
        if (errorDetails.username) {
          setNameError(true);
          setNameErrorMessage(errorDetails.username[0]);
          stepsWithErrors.push(0);
        }
        if (errorDetails.email) {
          setEmailError(true);
          setEmailErrorMessage(errorDetails.email[0]);
          stepsWithErrors.push(0);
        }
        if (errorDetails.password || errorDetails.password_confirm) {
          setPasswordError(true);
          setPasswordErrorMessage(
            errorDetails.password_confirm
              ? errorDetails.password_confirm[0]
              : errorDetails.password[0]
          );
          stepsWithErrors.push(0);
        }
        if (errorDetails.api_key) {
          setKeyError(true);
          setKeyErrorMessage(errorDetails.api_key[0]);
          stepsWithErrors.push(1);
        }

        // Remove steps with errors from completedSteps
        setCompletedSteps((prev) => {
          const newCompleted = new Set(prev);
          stepsWithErrors.forEach((step) => newCompleted.delete(step));
          return newCompleted;
        });

        // Determine the first step that has an error
        if (stepsWithErrors.length > 0) {
          const firstErrorStep = Math.min(...stepsWithErrors);
          setActiveStep(firstErrorStep);
        }
      } else {
        console.log("Registration error:", error);
        const errorMessage =
          error?.message ||
          error.response?.data?.detail ||
          "An error occurred while registering.";
        setError(errorMessage);
      }
    }
  };

  return (
    <>
      <CssBaseline enableColorScheme />
      <Toolbar />
      <SignUpContainer direction="column" justifyContent="space-between">
        <Card variant="outlined">
          <Stepper
            alternativeLabel
            activeStep={activeStep}
            connector={<QontoConnector />}
          >
            {steps.map((label, index) => (
              <Step key={label} completed={isStepCompleted(index)}>
                <StepLabel
                  slots={{ stepIcon: QontoStepIcon }}
                  sx={{
                    "& .MuiStepLabel-label": {
                      fontFamily: "'Montserrat', serif",
                    },
                  }}
                >
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography
              component="h1"
              variant="h4"
              sx={{
                fontSize: "clamp(2rem, 10vw, 2.15rem)",
                fontFamily: "'Montserrat', serif",
              }}
            >
              Register
            </Typography>
            {activeStep > 0 && (
              <Button
                variant="contained"
                color="warning"
                /* disabled={activeStep === 2 && !error} */
                onClick={handlePrevious}
                sx={{
                  fontSize: "0.875rem",
                  fontFamily: "'Montserrat', serif",
                  px: 0,
                  py: 0,
                  borderRadius: "8px",
                  textTransform: "none",
                }}
              >
                Back
              </Button>
            )}
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {error && (
              <Alert
                severity="error"
                sx={{ width: "100%", fontFamily: "'Montserrat', serif" }}
              >
                {error}
              </Alert>
            )}
            {activeStep === 0 && (
              <>
                <FormControl>
                  <FormLabel
                    htmlFor="username"
                    sx={{
                      fontFamily: "'Montserrat', serif",
                    }}
                  >
                    Username
                  </FormLabel>
                  <TextField
                    name="username"
                    required
                    fullWidth
                    id="username"
                    placeholder="JohnDoe"
                    error={nameError}
                    helperText={nameErrorMessage}
                    value={formData.username}
                    onChange={handleChange}
                    slotProps={{
                      input: {
                        sx: {
                          fontFamily: "'Montserrat', serif",
                          '::placeholder': {
                            fontFamily: "'Montserrat', serif",
                          },
                        },
                      },
                      formHelperText: {
                        sx: { fontFamily: "'Montserrat', serif" },
                      },
                    }}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel
                    htmlFor="email"
                    sx={{
                      fontFamily: "'Montserrat', serif",
                    }}
                  >
                    Email
                  </FormLabel>
                  <TextField
                    required
                    fullWidth
                    id="email"
                    placeholder="your@email.com"
                    name="email"
                    error={emailError}
                    helperText={emailErrorMessage}
                    value={formData.email}
                    onChange={handleChange}
                    slotProps={{
                      input: {
                        sx: {
                          fontFamily: "'Montserrat', serif",
                          '::placeholder': {
                            fontFamily: "'Montserrat', serif",
                          },
                        },
                      },
                      formHelperText: {
                        sx: { fontFamily: "'Montserrat', serif" },
                      },
                    }}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel
                    htmlFor="password"
                    sx={{
                      fontFamily: "'Montserrat', serif",
                    }}
                  >
                    Password
                  </FormLabel>
                  <TextField
                    required
                    fullWidth
                    name="password"
                    placeholder="••••••"
                    type="password"
                    id="password"
                    error={passwordError}
                    helperText={passwordErrorMessage}
                    value={formData.password}
                    onChange={handleChange}
                    slotProps={{
                      input: {
                        sx: {
                          fontFamily: "'Montserrat', serif",
                          '::placeholder': {
                            fontFamily: "'Montserrat', serif",
                          },
                        },
                      },
                      formHelperText: {
                        sx: { fontFamily: "'Montserrat', serif !important" },
                      },
                    }}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel
                    htmlFor="password_confirm"
                    sx={{
                      fontFamily: "'Montserrat', serif",
                    }}
                  >
                    Confirm Password
                  </FormLabel>
                  <TextField
                    required
                    fullWidth
                    name="password_confirm"
                    placeholder="••••••"
                    type="password"
                    id="password_confirm"
                    error={passwordConfirmError}
                    helperText={passwordConfirmErrorMessage}
                    value={formData.password_confirm}
                    onChange={handleChange}
                    slotProps={{
                      input: {
                        sx: {
                          fontFamily: "'Montserrat', serif",
                          '::placeholder': {
                            fontFamily: "'Montserrat', serif",
                          },
                        },
                      },
                      formHelperText: {
                        sx: { fontFamily: "'Montserrat', serif !important" },
                      },
                    }}
                  />
                </FormControl>
              </>
            )}
            {activeStep === 1 && (
              <Box sx={{ mt: 2 }}>
                <Typography
                  variant="body1"
                  color="textSecondary"
                  gutterBottom
                  sx={{
                    fontSize: "0.875rem",
                    fontFamily: "'Montserrat', serif",
                    mb: 3,
                  }}
                >
                  Our platform utilizes OpenAI API services at its core. Please
                  enter your valid OpenAI-issued API Key below. This key is
                  essential for enabling the AI functionalities within your
                  account.
                </Typography>
                <FormControl fullWidth>
                  <FormLabel
                    htmlFor="api_key"
                    sx={{
                      mb: 1,
                      fontWeight: "bold",
                      fontFamily: "'Montserrat', serif",
                    }}
                  >
                    API Key
                  </FormLabel>
                  <TextField
                    name="api_key"
                    required
                    fullWidth
                    id="api_key"
                    placeholder="Enter your OpenAI API Key"
                    error={keyError}
                    helperText={
                      keyErrorMessage ||
                      "Your API Key will be securely stored and used to authenticate requests to OpenAI services."
                    }
                    value={formData.api_key}
                    onChange={handleChange}
                    variant="outlined"
                    slotProps={{
                      input: {
                        sx: {
                          fontFamily: "'Montserrat', serif",
                          '::placeholder': {
                            fontFamily: "'Montserrat', serif",
                          },
                        },
                        endAdornment: (
                          <InputAdornment position="end">
                            <Tooltip
                              title="Need an API Key? Get one from OpenAI"
                              slotProps={{
                                tooltip: {
                                  sx: {
                                    fontFamily: "'Montserrat', serif",
                                  },
                                },
                              }}
                            >
                              <IconButton
                                aria-label="help"
                                onClick={() =>
                                  window.open(
                                    "https://platform.openai.com/account/api-keys",
                                    "_blank"
                                  )
                                }
                                edge="end"
                                disableRipple
                                disableFocusRipple
                              >
                                <HelpOutlineIcon />
                              </IconButton>
                            </Tooltip>
                          </InputAdornment>
                        ),
                      },
                      formHelperText: {
                        sx: { fontFamily: "'Montserrat', serif" },
                      },
                    }}
                  />
                </FormControl>
              </Box>
            )}
            {activeStep === 2 && (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: "200px",
                  gap: 2,
                }}
              >
                <Typography
                  variant="h6"
                  align="center"
                  sx={{ fontFamily: "'Montserrat', serif" }}
                >
                  {error
                    ? "Something went wrong..."
                    : "Completing your registration, please wait..."}
                </Typography>
                {error ? (
                  <CloseIcon
                    sx={{ fontSize: 100, color: theme.palette.error.light }}
                  />
                ) : (
                  <CircularProgress size={60} />
                )}
              </Box>
            )}
            <Button
              fullWidth
              variant="contained"
              disabled={activeStep === 2}
              onClick={(e) => {
                if (activeStep === 1) {
                  handleNext();
                  handleSubmit(e);
                } else {
                  handleNext();
                }
              }}
              sx={{ textTransform: "none", fontFamily: "'Montserrat', serif" }}
            >
              {activeStep > 0 ? "Sign Up" : "Next"}
            </Button>
            <Typography
              sx={{
                textAlign: "center",
                fontFamily: "'Montserrat', serif",
                fontSize: "0.9rem",
              }}
            >
              Already have an account?{" "}
              <span>
                <Link
                  onClick={() => navigate("/login")}
                  variant="body2"
                  sx={{
                    alignSelf: "center",
                    cursor: "pointer",
                    fontFamily: "'Montserrat', serif",
                  }}
                >
                  Sign in
                </Link>
              </span>
            </Typography>
          </Box>
        </Card>
      </SignUpContainer>
    </>
  );
}
