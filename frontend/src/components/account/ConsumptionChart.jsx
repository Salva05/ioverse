import { Card, CardContent, useTheme, useMediaQuery } from "@mui/material";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const ConsumptionChart = ({ chartData }) => {
  const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.down("sm"));

  /* helpers */
  const formatDate = (d) =>
    new Date(d).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  const formatNumber = (n) =>
    n >= 1_000_000
      ? `${(n / 1_000_000).toFixed(1)}M`
      : n >= 1_000
      ? `${(n / 1_000).toFixed(1)}k`
      : n;

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 2,
        bgcolor: theme.palette.mode === "dark" ? "grey.900" : "grey.50",
      }}
    >
      <CardContent sx={{ height: isSm ? 220 : 300, p: isSm ? 1 : 2 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={
              isSm
                ? { top: 8, right: 8, left: -10, bottom: 0 }
                : { top: 16, right: 24, bottom: 0, left: 8 }
            }
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: isSm ? 10 : 12 }}
              tickFormatter={formatDate}
              interval={isSm ? "preserveStartEnd" : 0}
            />
            {/* tokens (left) */}
            <YAxis
              yAxisId="left"
              tickFormatter={formatNumber}
              tick={{ fontSize: isSm ? 10 : 12 }}
              width={isSm ? 32 : 40}
            />
            {/* cost (right) */}
            <YAxis
              yAxisId="right"
              orientation="right"
              tickFormatter={(v) => `$${v.toFixed(2)}`}
              tick={{ fontSize: isSm ? 10 : 12 }}
              width={isSm ? 40 : 50}
              hide={isSm}
            />
            <Tooltip
              labelFormatter={(v) => formatDate(v)}
              formatter={(value, name) =>
                name === "Cost ($)"
                  ? `$${value.toFixed(2)}`
                  : value.toLocaleString()
              }
            />
            {!isSm && <Legend verticalAlign="top" height={36} />}
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="tokens"
              name="Tokens"
              stroke={theme.palette.primary.main}
              strokeWidth={2}
              dot={false}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="cost"
              name="Cost ($)"
              stroke={theme.palette.secondary.main}
              strokeDasharray="5 5"
              strokeWidth={2}
              dot={false}
              hide={isSm}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default ConsumptionChart;
