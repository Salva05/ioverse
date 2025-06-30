import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { Toolbar } from "@mui/material";
import adminKeyApi from "../api/adminKey";
import { toast } from "react-toastify";
import axios from "axios";

/* ---------- styled helpers ---------- */
const Card = styled(MuiCard)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignSelf: "center",
  width: "100%",
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: "auto",
  [theme.breakpoints.up("sm")]: { maxWidth: "450px" },
  boxShadow:
    "hsla(220, 30%, 5%, 0.05) 0px 5px 15px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px",
  ...theme.applyStyles("dark", {
    boxShadow:
      "hsla(220, 30%, 5%, 0.5) 0px 5px 15px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px",
  }),
}));

const Container = styled(Stack)(({ theme }) => ({
  position: "relative",
  flexGrow: 1,
  justifyContent: "center",
  alignItems: "center",
  padding: theme.spacing(2),
  [theme.breakpoints.up("sm")]: { padding: theme.spacing(4) },
}));

/* ---------- component ---------- */
const AdminKeyRegistration = () => {
  const [adminKey, setAdminKey] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await adminKeyApi.set(adminKey);
      toast.success("Admin key saved ✔️");
      navigate("/"); // happy path
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response) {
          // DRF validation errors
          const payload = err.response.data;
          const human =
            typeof payload === "string"
              ? payload
              : Object.values(payload).flat().join(" ");

          toast.error(human || "Request failed");
        } else {
          /* 🔌 No connection / CORS / timeout */
          toast.error("Network error - are you offline?");
        }
      } else {
        toast.error("Unexpected error");
      }
    }
  };

  return (
    <>
      <CssBaseline enableColorScheme />
      <Toolbar />

      <Container direction="column">
        <Box sx={{ width: "100%", maxWidth: 450, m: "0 auto" }}>
          <Card variant="outlined">
            {/* Heading */}
            <Typography
              component="h1"
              variant="h4"
              sx={{
                width: "100%",
                fontSize: "clamp(2rem, 10vw, 2.15rem)",
                fontFamily: "'Montserrat', serif",
              }}
            >
              Add Admin&nbsp;API&nbsp;Key
            </Typography>

            {/* Short explanation */}
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontFamily: "Montserrat, sans-serif", mb: 3 }}
            >
              An&nbsp;<strong>Admin&nbsp;API&nbsp;key</strong> unlocks
              organization-level analytics (usage by model, project,
              etc.).&nbsp;
              <em>
                Make sure you create the key inside the{" "}
                <u>same organization or project</u> that your regular
                model-access key belongs to.
              </em>
              &nbsp; Generate it in&nbsp;
              <Link
                href="https://platform.openai.com/settings/organization/api-keys"
                target="_blank"
                rel="noopener noreferrer"
              >
                OpenAI Dashboard
              </Link>
              , then paste it below.
            </Typography>

            {/* Form */}
            <Box
              component="form"
              onSubmit={handleSubmit}
              noValidate
              sx={{ display: "flex", flexDirection: "column", gap: 2 }}
            >
              <FormControl>
                <FormLabel
                  htmlFor="admin-key"
                  sx={{ fontFamily: "'Montserrat', serif" }}
                >
                  Admin API Key
                </FormLabel>
                <TextField
                  id="admin-key"
                  type="text"
                  name="admin_key"
                  placeholder="sk-admin-..."
                  required
                  fullWidth
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  variant="outlined"
                  slotProps={{
                    input: {
                      sx: {
                        fontFamily: "'Montserrat', serif",
                        "::placeholder": { fontFamily: "'Montserrat', serif" },
                      },
                    },
                  }}
                />
              </FormControl>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ fontFamily: "Montserrat, sans-serif" }}
              >
                Save Key
              </Button>

              {/* back to dashboard / account */}
              <Typography
                sx={{
                  textAlign: "center",
                  fontFamily: "Montserrat, sans-serif",
                }}
              >
                Added it already?{" "}
                <Link
                  onClick={() => navigate("/")}
                  sx={{
                    cursor: "pointer",
                    fontFamily: "Montserrat, sans-serif",
                  }}
                >
                  Return to dashboard
                </Link>
              </Typography>
            </Box>
          </Card>
        </Box>
      </Container>
    </>
  );
};

export default AdminKeyRegistration;
