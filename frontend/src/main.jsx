import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Chat from "./pages/Chat";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./components/Layout";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConversationProvider } from "./contexts/ConversationContext";
import theme from "./themes/theme";
import { ThemeProvider } from "@mui/material";
import Login from "./pages/Login";
import { AuthProvider } from "./contexts/AuthContext";

// Manages chaching, fetching and synchronization of server side data
const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "chat",
        element: <Chat />,
      },
      {
        path: "login",
        element: <Login />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <ConversationProvider>
          <ThemeProvider theme={theme}>
            {/*Custom MUI theming*/}
            <RouterProvider router={router} />
          </ThemeProvider>
        </ConversationProvider>
      </QueryClientProvider>
    </AuthProvider>
  </StrictMode>
);
