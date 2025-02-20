import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import CssBaseline from "@mui/material/CssBaseline";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import MuiCard from "@mui/material/Card";
import { styled } from "@mui/material/styles";
import ForgotPassword from "../components/login/ForgotPassword";
import Alert from "@mui/material/Alert";
import { AuthContext } from "../contexts/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { Toolbar } from "@mui/material";

const Card = styled(MuiCard)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignSelf: "center",
  width: "100%",
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: "auto",
  [theme.breakpoints.up("sm")]: {
    maxWidth: "450px",
  },
  boxShadow:
    "hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px",
  ...theme.applyStyles("dark", {
    boxShadow:
      "hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px",
  }),
}));

const SignInContainer = styled(Stack)(({ theme }) => ({
  position: "relative",
  flexGrow: 1,
  justifyContent: "center",
  alignItems: "center",
  padding: theme.spacing(2),
  [theme.breakpoints.up("sm")]: {
    padding: theme.spacing(4),
  },
  "&::before": {
    content: '""',
    display: "block",
    position: "absolute",
    zIndex: -1,
    inset: 0,
  },
}));

export default function SignIn(props) {
  const [emailError, setEmailError] = React.useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = React.useState("");
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [rememberMe, setRememberMe] = React.useState(false);
  const [error, setError] = React.useState("");

  const { authenticate } = React.useContext(AuthContext);

  const navigate = useNavigate();
  const location = useLocation();

  const message = location.state?.message || "";

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = async (event) => {
    setError("");
    event.preventDefault();

    if (!validateInputs()) {
      return;
    }

    const data = new FormData(event.currentTarget);

    try {
      const errorMessage = await authenticate(
        data.get("username"),
        data.get("password"),
        rememberMe
      );

      if (errorMessage) {
        setError(errorMessage);
      } else {
        navigate("/chat");
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setError("Invalid username or password.");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
      console.error(err);
    }
  };

  const validateInputs = () => {
    const username = document.getElementById("username");
    const password = document.getElementById("password");

    let isValid = true;

    const trimmedUsername = username.value.trim();

    if (!trimmedUsername) {
      setEmailError(true);
      setEmailErrorMessage("Username cannot be empty.");
      isValid = false;
    } else if (/\s/.test(trimmedUsername)) {
      setEmailError(true);
      setEmailErrorMessage("Username cannot contain spaces.");
      isValid = false;
    } else {
      setEmailError(false);
      setEmailErrorMessage("");
    }

    if (!password.value || password.value.length < 4) {
      setPasswordError(true);
      setPasswordErrorMessage("Password must be at least 4 characters long.");
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage("");
    }

    return isValid;
  };

  return (
    <>
      <CssBaseline enableColorScheme />
      <Toolbar />
      {/* Display the message passed from ProtectedRoute */}
      <SignInContainer
        direction="column"
        justifyContent="center"
        alignItems="center"
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: "450px",
            margin: "0 auto",
          }}
        >
          {message && (
            <Alert
              severity="info"
              sx={{ marginBottom: "1rem", fontFamily: "'Montserrat', serif" }}
            >
              {message}
            </Alert>
          )}
          <Card variant="outlined">
            <Typography
              component="h1"
              variant="h4"
              sx={{
                width: "100%",
                fontSize: "clamp(2rem, 10vw, 2.15rem)",
                fontFamily: "'Montserrat', serif",
              }}
            >
              Sign in
            </Typography>
            {error && (
              <Alert
                severity="error"
                sx={{ width: "100%", fontFamily: "'Montserrat', serif" }}
              >
                {error}
              </Alert>
            )}
            <Box
              component="form"
              onSubmit={handleSubmit}
              noValidate
              sx={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
                gap: 2,
              }}
            >
              <FormControl>
                <FormLabel
                  htmlFor="email"
                  sx={{
                    fontFamily: "'Montserrat', serif",
                  }}
                >
                  Username
                </FormLabel>
                <TextField
                  error={emailError}
                  helperText={emailErrorMessage}
                  id="username"
                  type="text"
                  name="username"
                  placeholder="Username"
                  autoFocus
                  required
                  fullWidth
                  variant="outlined"
                  color={emailError ? "error" : "primary"}
                  slotProps={{
                    input: {
                      sx: {
                        fontFamily: "'Montserrat', serif",
                        "::placeholder": {
                          fontFamily: "'Montserrat', serif",
                        },
                      },
                    },
                    formHelperText: {
                      sx: { fontFamily: "'Montserrat', serif" },
                    },
                  }}
                  sx={{ ariaLabel: "username" }}
                />
              </FormControl>
              <FormControl>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <FormLabel
                    htmlFor="password"
                    sx={{
                      fontFamily: "'Montserrat', serif",
                    }}
                  >
                    Password
                  </FormLabel>
                  <Link
                    component="button"
                    type="button"
                    onClick={handleClickOpen}
                    variant="body2"
                    sx={{
                      alignSelf: "baseline",
                      fontFamily: "'Montserrat', serif",
                    }}
                  >
                    Forgot your password?
                  </Link>
                </Box>
                <TextField
                  error={passwordError}
                  helperText={passwordErrorMessage}
                  name="password"
                  placeholder="••••••"
                  type="password"
                  id="password"
                  autoComplete="new-password"
                  autoFocus
                  required
                  fullWidth
                  variant="outlined"
                  color={passwordError ? "error" : "primary"}
                  slotProps={{
                    input: {
                      sx: {
                        fontFamily: "'Montserrat', serif",
                        "::placeholder": {
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
              <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    name="remember"
                    color="primary"
                  />
                }
                label={
                  <span style={{ fontFamily: "Montserrat, sans-serif" }}>
                    Remember me
                  </span>
                }
              />
              <ForgotPassword open={open} handleClose={handleClose} />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ fontFamily: "Montserrat, sans-serif" }}
              >
                Sign in
              </Button>
              <Typography
                sx={{
                  textAlign: "center",
                  fontFamily: "Montserrat, sans-serif",
                }}
              >
                Don&apos;t have an account?{" "}
                <span>
                  <Link
                    onClick={() => navigate("/register")}
                    variant="body2"
                    sx={{
                      alignSelf: "center",
                      cursor: "pointer",
                      fontFamily: "Montserrat, sans-serif",
                    }}
                  >
                    Sign up
                  </Link>
                </span>
              </Typography>
            </Box>
          </Card>
        </Box>
      </SignInContainer>
    </>
  );
}
