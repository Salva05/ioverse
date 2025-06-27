import { useMemo, useState } from "react";
import {
  Box,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import StatCard from "./StatCard";
import ConsumptionChart from "./ConsumptionChart";

const fallbackData = [
  { date: "2025-06-20", model: "gpt-4o", tokens: 120000, cost: 4.8 },
  { date: "2025-06-21", model: "gpt-4o", tokens: 80000, cost: 2 },
  { date: "2025-06-22", model: "gpt-4o", tokens: 95000, cost: 3.8 },

  { date: "2025-06-20", model: "gpt-3.5-turbo", tokens: 150000, cost: 0.5 },
  { date: "2025-06-21", model: "gpt-3.5-turbo", tokens: 100000, cost: 0.34 },
  { date: "2025-06-22", model: "gpt-3.5-turbo", tokens: 170000, cost: 0.59 },

  { date: "2025-06-20", model: "dall-e-3", tokens: 0, cost: 2.4 },
  { date: "2025-06-21", model: "dall-e-3", tokens: 0, cost: 1.2 },
  { date: "2025-06-22", model: "dall-e-3", tokens: 0, cost: 1.6 },
];

const ConsumptionsPanel = ({ data = fallbackData }) => {
  const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.down("sm"));
  const [selectedModel, setSelectedModel] = useState("all");

  // Distinct list of models for the filter dropdown
  const models = useMemo(
    () => [...new Set(data.map((r) => r.model))].sort(),
    [data]
  );

  const handleModelChange = (event) => {
    setSelectedModel(event.target.value);
  };

  // Aggregate daily totals, optionally filtered by model
  const chartData = useMemo(() => {
    const map = new Map();

    data.forEach((r) => {
      if (selectedModel !== "all" && r.model !== selectedModel) return;
      const prev = map.get(r.date) || { tokens: 0, cost: 0 };
      map.set(r.date, {
        tokens: prev.tokens + r.tokens,
        cost: prev.cost + r.cost,
      });
    });

    return Array.from(map.entries())
      .map(([date, val]) => ({ date, ...val }))
      .sort((a, b) => (a.date < b.date ? -1 : 1));
  }, [data, selectedModel]);

  // Totals for summary cards
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

  return (
    <>
      <Divider sx={{ my: 4 }} />
      <Box>
        {/* Header & filter */}
        <Stack
          direction={isSm ? "column" : "row"}
          spacing={2}
          alignItems="center"
        >
          <Typography variant="h6" flexGrow={1}>
            OpenAI Consumptions
          </Typography>

          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel id="model-select-label">Model</InputLabel>
            <Select
              labelId="model-select-label"
              value={selectedModel}
              label="Model"
              onChange={handleModelChange}
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

        {/* Summary stats */}
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
              value={totals.cost.toFixed(2)}
              prefix="$"
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Chart section */}
        {chartData.length ? (
          <ConsumptionChart chartData={chartData} />
        ) : (
          <Typography
            variant="body2"
            color="text.secondary"
            textAlign="center"
            mt={4}
          >
            No consumption data available.
          </Typography>
        )}
      </Box>
    </>
  );
};

export default ConsumptionsPanel;
