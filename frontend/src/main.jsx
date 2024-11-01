import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./components/layout/Layout";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConversationProvider } from "./contexts/ConversationContext";
import theme from "./themes/theme";
import { ThemeProvider } from "@mui/material";
import SignUp from "./pages/Register";
import Login from "./pages/Login";
import SharedConversation from "./pages/SharedConversation";
import SharedImage from "./pages/SharedImage";
import ProtectedRoute from "./pages/ProtectedRoute";
import ChatSystem from "./pages/ChatSystem";
import "./styles/general.css";
import TextToImage from "./pages/TextToImage";

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "chat",
        element: (
          <ProtectedRoute>
            <ChatSystem />
          </ProtectedRoute>
        ),
      },
      {
        path: "text-to-image",
        element: (
          <ProtectedRoute>
            <TextToImage />
          </ProtectedRoute>
        ),
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "register",
        element: <SignUp />,
      },
      {
        path: "shared-conversation/:share_token",
        element: <SharedConversation />,
      },
      {
        path: "shared-image/:share_token",
        element: <SharedImage />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ConversationProvider>
        <ThemeProvider theme={theme}>
          <RouterProvider router={router} />
        </ThemeProvider>
      </ConversationProvider>
    </QueryClientProvider>
  </StrictMode>
);
