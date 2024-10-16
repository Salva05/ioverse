import { createTheme, darken } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    action: {
      selected: darken("#f0f0f0", 0.74),
      hover: darken("#f0f0f0", 0.74),
    },
  },
});

export default theme;