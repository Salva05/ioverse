import { useEffect, useMemo, useState, useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  Backdrop,
  Box,
  CircularProgress,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
  Button,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import StatCard from "./StatCard";
import ConsumptionChart from "./ConsumptionChart";
import usage from "../../api/usage";
import { toUiRow } from "../../utils/openaiConsumptionsHelpers";
import { Tooltip } from "@mui/material";
import { AuthContext } from "../../contexts/AuthContext";

const ConsumptionsPanel = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const goToRegistrationPage = () => navigate("/register-admin-key");

  const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.down("sm"));

  const [selectedModel, setSelectedModel] = useState("all");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const locked = !user.has_admin_key;

  const fetchData = useCallback(() => {
    if (locked) return;

    setLoading(true);
    setError(null);

    const end = Math.floor(Date.now() / 1000);
    const start = end - 60 * 60 * 24 * 30;

    usage
      .get({ startTime: start, endTime: end, groupBy: ["model"] })
      .then((res) => setRows(res.map(toUiRow)))
      .catch(() => setError("Could not load usage data."))
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(fetchData, [fetchData]);

  const models = useMemo(
    () => [...new Set(rows.map((r) => r.model))].sort(),
    [rows]
  );

  const chartData = useMemo(() => {
    const map = new Map();
    rows.forEach((r) => {
      if (selectedModel !== "all" && r.model !== selectedModel) return;
      const prev = map.get(r.date) || { tokens: 0, cost: 0 };
      map.set(r.date, {
        tokens: prev.tokens + r.tokens,
        cost: prev.cost + r.cost,
      });
    });
    return [...map.entries()]
      .map(([date, v]) => ({ date, ...v }))
      .sort((a, b) => (a.date < b.date ? -1 : 1));
  }, [rows, selectedModel]);

  const totals = useMemo(() => {
    if (locked) return { tokens: "---", cost: "---" };
    return chartData.reduce(
      (acc, cur) => ({
        tokens: acc.tokens + cur.tokens,
        cost: acc.cost + cur.cost,
      }),
      { tokens: 0, cost: 0 }
    );
  }, [chartData, locked]);

  const sectionUnavailable = !loading && rows.length === 0 && !locked;

  return (
    <>
      <Box sx={{ position: "relative" }}>
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{ mt: 7, mb: 1 }}
        >
          <Typography variant="h6">OpenAI Consumptions</Typography>

          <Tooltip title="Refresh and sync latest usage data" arrow>
            <IconButton onClick={fetchData} size="small">
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
        <Divider />

        {sectionUnavailable && (
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 2 }}>
            <Typography color="text.secondary">No data available.</Typography>
          </Stack>
        )}

        {error && !sectionUnavailable && (
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 2 }}>
            <Typography color="error">{error}</Typography>
            <IconButton onClick={fetchData} size="small">
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Stack>
        )}

        {!sectionUnavailable && (
          <Box sx={{ opacity: loading ? 0.4 : 1 }}>
            <Stack
              direction={isSm ? "column" : "row"}
              sx={{ mt: 5 }}
              spacing={2}
              alignItems="center"
            >
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel id="model-select-label">Model</InputLabel>
                <Select
                  labelId="model-select-label"
                  value={selectedModel}
                  label="Model"
                  disabled={loading}
                  onChange={(e) => setSelectedModel(e.target.value)}
                >
                  <MenuItem value="all">All Models</MenuItem>
                  {models.map((m) => (
                    <MenuItem key={m} value={m}>
                      {m}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            <Grid container spacing={isSm ? 2 : 4} mt={1}>
              <Grid item xs={6} sm={3}>
                <StatCard
                  label="Total Tokens"
                  value={
                    locked ? totals.tokens : totals.tokens.toLocaleString()
                  }
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <StatCard
                  label="Est. Cost (USD)"
                  prefix="$"
                  value={locked ? totals.cost : totals.cost.toFixed(2)}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <ConsumptionChart chartData={locked ? [] : chartData} />

            <Backdrop
              open={loading}
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                zIndex: (t) => t.zIndex.drawer + 1,
                color: "#fff",
              }}
            >
              <CircularProgress color="inherit" />
            </Backdrop>

            {locked && !loading && (
              <Backdrop
                open
                sx={(t) => ({
                  position: "absolute",
                  inset: 0,

                  bgcolor:
                    t.palette.mode === "light"
                      ? "rgba(0,0,0,0.45)"
                      : "rgba(0,0,0,0.5)",

                  color: t.palette.grey[100],

                  zIndex: (z) => z.zIndex.drawer + 1,
                  flexDirection: "column",
                  p: 2,
                })}
              >
                <LockOutlinedIcon sx={{ fontSize: 56, mb: 1 }} />

                <Typography variant="body2" align="center" gutterBottom>
                  Link an Admin key to view usage
                </Typography>

                <Button
                  variant="contained"
                  size="small"
                  sx={(t) => ({
                    flexDirection: "column",
                    alignItems: "center",
                    py: 0.7,
                    px: 1.5,
                    mt: 1,
                  })}
                  onClick={goToRegistrationPage}
                >
                  Add Admin Key
                </Button>
              </Backdrop>
            )}
          </Box>
        )}
      </Box>
    </>
  );
};

export default ConsumptionsPanel;
