import { useEffect, useMemo, useState, useCallback } from "react";
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
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import StatCard from "./StatCard";
import ConsumptionChart from "./ConsumptionChart";
import usage from "../../api/usage";
import { toUiRow } from "../../utils/openaiConsumptionsHelpers";
import { Tooltip } from "@mui/material";

const ConsumptionsPanel = () => {
  const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.down("sm"));

  const [selectedModel, setSelectedModel] = useState("all");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(() => {
    setLoading(true);
    setError(null);

    const end = Math.floor(Date.now() / 1000);
    const start = end - 60 * 60 * 24 * 30;

    usage
      .get({ startTime: start, endTime: end, groupBy: ["model"] })
      .then((res) => setRows(res.map(toUiRow)))
      .catch(() => setError("Could not load usage data."))
      .finally(() => setLoading(false));
  }, []);

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

  const totals = useMemo(
    () =>
      chartData.reduce(
        (acc, cur) => ({
          tokens: acc.tokens + cur.tokens,
          cost: acc.cost + cur.cost,
        }),
        { tokens: 0, cost: 0 }
      ),
    [chartData]
  );

  const sectionUnavailable = !loading && rows.length === 0;

  return (
    <>
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
          <Typography color="text.secondary">No data found.</Typography>
          <IconButton onClick={fetchData} size="small">
            <RefreshIcon fontSize="small" />
          </IconButton>
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
        <Box sx={{ position: "relative", opacity: loading ? 0.4 : 1 }}>
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
                value={totals.tokens.toLocaleString()}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <StatCard
                label="Est. Cost (USD)"
                prefix="$"
                value={totals.cost.toFixed(2)}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <ConsumptionChart chartData={chartData} />

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
        </Box>
      )}
    </>
  );
};

export default ConsumptionsPanel;
