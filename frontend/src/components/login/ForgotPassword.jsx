import * as React from "react";
import PropTypes from "prop-types";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { TextField } from "@mui/material";
import { account } from "../../api/user";

function ForgotPassword({ open, handleClose }) {
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

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      PaperProps={{
        component: "form",
        onSubmit: (event) => {
          event.preventDefault();
          handleReset();
        },
      }}
    >
      <DialogTitle>Reset password</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, width: "100%" }}>
        <DialogContentText>
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
        />
        {status?.success && (
          <DialogContentText sx={{ color: "green" }}>{status.success}</DialogContentText>
        )}
        {status?.error && (
          <DialogContentText sx={{ color: "red" }}>{status.error}</DialogContentText>
        )}
      </DialogContent>
      <DialogActions sx={{ pb: 3, px: 3 }}>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleReset} variant="contained" type="submit" disabled={loading}>
          {loading ? "Sending..." : "Continue"}
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
