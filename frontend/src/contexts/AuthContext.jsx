import React, { createContext, useEffect, useState, useCallback } from "react";
import loginService from "../services/authService";
import TokenManager from "../services/tokenManager";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null); // Retain base user information
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [logoutTimer, setLogoutTimer] = useState(null); // Timer for logout

  // Clears existing logout timers to prevent multiple timers running simultaneously
  const clearLogoutTimer = () => {
    if (logoutTimer) {
      clearTimeout(logoutTimer);
      setLogoutTimer(null);
    }
  };

  // Schedules a logout based on the refresh token's expiry time
  const scheduleLogout = useCallback(() => {
    clearLogoutTimer();
    const expiry = TokenManager.getRefreshTokenExpiry();
    if (expiry) {
      const now = Date.now();
      const timeout = expiry - now;
      if (timeout > 0) {
        const timer = setTimeout(() => {
          logout();
        }, timeout);
        setLogoutTimer(timer);
      } else {
        // Refresh token already expired
        logout();
      }
    }
  }, []);

  // Initializes the authentication state on component mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (!TokenManager.isAccessTokenInvalid()) {
          setIsAuthenticated(true);
        } else if (!TokenManager.isRefreshTokenInvalid()) {
          const refreshed = await TokenManager.refreshAccessToken();
          if (refreshed) {
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(false);
            TokenManager.clearTokens();
          }
        } else {
          setIsAuthenticated(false);
          TokenManager.clearTokens();
        }

        // Schedule logout based on refresh token expiry
        if (!TokenManager.isRefreshTokenInvalid()) {
          scheduleLogout();
        }
      } catch (err) {
        console.error("Error during authentication initialization:", err);
        setIsAuthenticated(false);
        TokenManager.clearTokens();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Cleanup on unmount
    return () => {
      clearLogoutTimer();
    };
  }, [scheduleLogout]);

  // Fetch user data when authenticated
  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (isAuthenticated) {
        try {
          const response = await axiosInstance.get("/current-user/");
          setUser(response.data);
        } catch (err) {
          console.error("Failed to fetch user data:", err);
          setError("Failed to fetch user data.");
          setIsAuthenticated(false);
          TokenManager.clearTokens();
          navigate("/login");
        }
      } else {
        setUser(null);
      }
    };

    fetchCurrentUser();
  }, [isAuthenticated, navigate]);

  const authenticate = useCallback(
    async (username, password) => {
      setLoading(true);
      setError(null);
      try {
        const response = await loginService(username, password); // { access, refresh }

        const { access, refresh } = response;

        if (access && refresh) {
          TokenManager.setAccessToken(access);
          TokenManager.setRefreshToken(refresh);
          setIsAuthenticated(true);
          scheduleLogout(); // Schedule logout based on refresh token
        } else {
          throw new Error("Invalid credentials: Tokens not received.");
        }
      } catch (err) {
        console.error("Authentication failed:", err);
        setError(
          err.response?.data?.detail || err.message || "Authentication failed."
        );
        setIsAuthenticated(false);
        TokenManager.clearTokens();
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [scheduleLogout]
  );

  // Handles user logout
  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setUser(null);
    TokenManager.clearTokens();
    clearLogoutTimer();
    // Redirect to login page
    navigate("/login");
  }, []);

  // Synchronizes authentication state across multiple tabs
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === "accessToken" || event.key === "refreshToken") {
        if (TokenManager.isRefreshTokenInvalid()) {
          logout();
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [logout]);

  const contextValue = {
    isAuthenticated,
    user,
    loading,
    error,
    authenticate,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
