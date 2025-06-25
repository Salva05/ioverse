import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./components/layout/Layout";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import SignUp from "./pages/Register";
import Login from "./pages/Login";
import SharedConversation from "./pages/SharedConversation";
import SharedImage from "./pages/SharedImage";
import ProtectedRoute from "./pages/ProtectedRoute";
import ChatSystem from "./pages/ChatSystem";
import "./styles/general.css";
import TextToImage from "./pages/TextToImage";
import Account from "./pages/Account";
import Assistant from "./pages/Assistant";
import { DarkModeProvider } from "./contexts/DarkModeContext";
import Home from "./pages/Home";

const queryClient = new QueryClient();

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <Layout />,
      children: [
        {
          path: "home",
          element: <Home />,
        },
        {
          path: "account",
          element: (
            <ProtectedRoute>
              <Account />
            </ProtectedRoute>
          ),
        },
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
          path: "assistant",
          element: (
            <ProtectedRoute>
              <Assistant />
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
  ],
  {
    future: {
      v7_skipActionErrorRevalidation: true, // Prevents revalidation when action errors occur
      v7_startTransition: true, // Wrap state updates in React.startTransition
      v7_relativeSplatPath: true, // Enables relative paths in nested routes
      v7_fetcherPersist: true, // Retains fetcher state during navigation
      v7_normalizeFormMethod: true, // Normalizes form methods (e.g., POST or GET)
      v7_partialHydration: true, // Supports partial hydration for server-side rendering
    },
  }
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <DarkModeProvider>
        <RouterProvider
          future={{ v7_startTransition: true }} // Enables React's startTransition API
          router={router}
        />
      </DarkModeProvider>
    </QueryClientProvider>
  </StrictMode>
);
