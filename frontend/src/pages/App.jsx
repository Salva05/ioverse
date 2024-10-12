import { Button, CssBaseline } from "@mui/material";
import { Outlet } from "react-router-dom";
import Layout from "../components/Layout";

function App() {
  return (
    <>
      <CssBaseline />
      <Layout />
      <Outlet />
    </>
  );
}

export default App;
