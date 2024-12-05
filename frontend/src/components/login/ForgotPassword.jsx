import * as React from "react";
import PropTypes from "prop-types";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { TextField, useTheme } from "@mui/material";
import { account } from "../../api/user";

function ForgotPassword({ open, handleClose }) {
  const theme = useTheme();
  const [email, setEmail] = React.useState("");
  const [status, setStatus] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const validateEmail = () => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError("A valid email address must be provided.");
      return false;
    }
    setError("");
    return true;
  };

  const handleReset = async () => {
    setError("");
    if (!validateEmail()) return;

    setLoading(true);
    setStatus(null);
    try {
      const response = await account.resetPassword(email);
      setStatus({ success: response.message });
    } catch (error) {
      setStatus({ error: error.response?.data?.error || "An error occurred." });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseWrapper = () => {
    // Reset states
    setEmail("");
    setStatus(null);
    setLoading(false);
    setError("");

    handleClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleCloseWrapper}
      PaperProps={{
        component: "form",
        onSubmit: (event) => {
          event.preventDefault();
          handleReset();
        },
      }}
    >
      <DialogTitle sx={{ fontFamily: "'Montserrat', serif" }}>
        Reset password
      </DialogTitle>
      <DialogContent
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          width: "100%",
        }}
      >
        <DialogContentText sx={{ fontFamily: "'Montserrat', serif" }}>
          Enter your account&apos;s email address, and we&apos;ll send you a
          link to reset your password.
        </DialogContentText>
        <TextField
          error={error.length > 0}
          helperText={error}
          autoFocus
          required
          margin="dense"
          id="email"
          name="email"
          label="Email address"
          placeholder="Email address"
          type="email"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
        {status?.success && (
          <DialogContentText
            sx={{
              color: theme.palette.success.main,
              fontFamily: "'Montserrat', serif",
            }}
          >
            {status.success}
          </DialogContentText>
        )}
        {status?.error && (
          <DialogContentText
            sx={{
              color: theme.palette.error.main,
              fontFamily: "'Montserrat', serif",
            }}
          >
            {status.error}
          </DialogContentText>
        )}
      </DialogContent>
      <DialogActions sx={{ pb: 3, px: 3 }}>
        {!status?.success && (
          <Button
            onClick={handleCloseWrapper}
            sx={{ fontFamily: "'Montserrat', serif", textTransform: "none" }}
          >
            Cancel
          </Button>
        )}
        <Button
          onClick={status?.success ? handleCloseWrapper : handleReset}
          variant="contained"
          type="submit"
          disabled={loading}
          sx={{ fontFamily: "'Montserrat', serif", textTransform: "none" }}
        >
          {loading ? "Sending..." : status?.success ? "Back" : "Continue"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

ForgotPassword.propTypes = {
  handleClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
};

export default ForgotPassword;
