import { Button } from "@mui/material";
import { Outlet } from "react-router-dom";

function App() {
  return (
    <>
      <Button variant="contained">Contained</Button>
      <Outlet />
    </>
  );
}

export default App;
