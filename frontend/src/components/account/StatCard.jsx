import { Card, CardContent, Stack, Typography, useTheme } from "@mui/material";

const StatCard = ({ label, value, prefix = "" }) => {
  const theme = useTheme();

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 2,
        height: "100%",
        bgcolor:
          theme.palette.mode === "dark" ? "grey.900" : theme.palette.grey[50],
      }}
    >
      <CardContent>
        <Stack spacing={0.5}>
          <Typography variant="subtitle2" color="text.secondary">
            {label}
          </Typography>
          <Typography variant="h6">
            {prefix}
            {value}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default StatCard;
