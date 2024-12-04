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
import { Alert, Toolbar } from "@mui/material";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Check from "@mui/icons-material/Check";
import StepConnector, {
  stepConnectorClasses,
} from "@mui/material/StepConnector";

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
  const [emailError, setEmailError] = React.useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = React.useState("");
  const [error, setError] = React.useState("");
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState("");
  const [nameError, setNameError] = React.useState(false);
  const [nameErrorMessage, setNameErrorMessage] = React.useState("");
  const navigate = useNavigate();

  const [activeStep, setActiveStep] = React.useState(0);
  const [completedSteps, setCompletedSteps] = React.useState(new Set());
  const steps = ["Credentials", "Key", "Sign-up"];
  const handleNext = () => {
    setCompletedSteps((prev) => new Set([...prev, activeStep])); // Mark current step as completed
    if (activeStep < steps.length - 1) {
      setActiveStep((prev) => prev + 1);
    }
  };
  const handlePrevious = () => {
    if (activeStep > 0) {
      setActiveStep((prev) => prev - 1);
    }
  };
  const isStepCompleted = (step) => completedSteps.has(step);

  const { authenticate } = React.useContext(AuthContext);

  const validateInputs = () => {
    const email = document.getElementById("email");
    const password = document.getElementById("password");
    const password_confirm = document.getElementById("password_confirm");
    const username = document.getElementById("username");

    let isValid = true;

    if (!email.value || !/\S+@\S+\.\S+/.test(email.value)) {
      setEmailError(true);
      setEmailErrorMessage("Please enter a valid email address.");
      isValid = false;
    } else {
      setEmailError(false);
      setEmailErrorMessage("");
    }

    if (!password.value || password.value.length < 8) {
      setPasswordError(true);
      setPasswordErrorMessage("Password must be at least 8 characters long.");
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage("");
    }

    if (password_confirm.value !== password.value) {
      setPasswordError(true);
      setPasswordErrorMessage("Passwords do not match.");
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage("");
    }

    if (!username.value || username.value.length < 1) {
      setNameError(true);
      setNameErrorMessage("Name is required.");
      isValid = false;
    } else {
      setNameError(false);
      setNameErrorMessage("");
    }

    return isValid;
  };

  const handleSubmit = async (event) => {
    setError("");

    event.preventDefault();
    if (nameError || emailError || passwordError) {
      return;
    }

    const data = new FormData(event.currentTarget);
    const userData = {
      username: data.get("username"),
      email: data.get("email"),
      password: data.get("password"),
      password_confirm: data.get("password_confirm"),
    };

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
        setError("Unexpected response status:", response.status);
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        // Access the error messages returned by the backend
        const errorDetails = error.response.data.errors;
        console.log("Registration failed:", errorDetails);

        // Set the specific errors to display in the form
        if (errorDetails.username) {
          setNameError(true);
          setNameErrorMessage(errorDetails.username[0]);
        }
        if (errorDetails.email) {
          setEmailError(true);
          setEmailErrorMessage(errorDetails.email[0]);
        }
        if (errorDetails.password) {
          setPasswordError(true);
          setPasswordErrorMessage(errorDetails.password[0]);
        }
        if (errorDetails.password_confirm) {
          setPasswordError(true);
          setPasswordErrorMessage(errorDetails.password_confirm[0]);
        }
      } else {
        console.log("Registration error:", error);
        const errorMessage =
          error.response?.data?.detail ||
          "An error occurred while registering.";
        setError("Error: " + errorMessage);
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
                <StepLabel slots={{ stepIcon: QontoStepIcon }}>
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
              sx={{ fontSize: "clamp(2rem, 10vw, 2.15rem)" }}
            >
              Register
            </Typography>
            {activeStep > 0 && (
              <Button
                variant="contained"
                color="warning"
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
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            {error && (
              <Alert severity="error" sx={{ width: "100%" }}>
                {error}
              </Alert>
            )}
            <FormControl>
              <FormLabel htmlFor="name">Username</FormLabel>
              <TextField
                name="username"
                required
                fullWidth
                id="username"
                placeholder="JohnDoe"
                error={nameError}
                helperText={nameErrorMessage}
                color={nameError ? "error" : "primary"}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="email">Email</FormLabel>
              <TextField
                required
                fullWidth
                id="email"
                placeholder="your@email.com"
                name="email"
                autoComplete="email"
                variant="outlined"
                error={emailError}
                helperText={emailErrorMessage}
                color={passwordError ? "error" : "primary"}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="password">Password</FormLabel>
              <TextField
                required
                fullWidth
                name="password"
                placeholder="••••••"
                autoComplete="new-password"
                type="password"
                id="password"
                variant="outlined"
                error={passwordError}
                helperText={passwordErrorMessage}
                color={passwordError ? "error" : "primary"}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="password">Confirm Password</FormLabel>
              <TextField
                required
                fullWidth
                name="password_confirm"
                placeholder="••••••"
                autoComplete="new-password"
                type="password"
                id="password_confirm"
                variant="outlined"
                error={passwordError}
                helperText={passwordErrorMessage}
                color={passwordError ? "error" : "primary"}
              />
            </FormControl>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              onClick={
                activeStep === steps.length - 1 ? validateInputs : handleNext
              }
            >
              {activeStep === steps.length - 1 ? "Sign Up" : "Next"}
            </Button>
            <Typography sx={{ textAlign: "center" }}>
              Already have an account?{" "}
              <span>
                <Link
                  onClick={() => navigate("/login")}
                  variant="body2"
                  sx={{ alignSelf: "center", cursor: "pointer" }}
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
