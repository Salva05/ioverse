import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Chat from "./pages/Chat";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./components/Layout";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "chat",
        element: <Chat />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
