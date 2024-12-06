import axiosInstance from "../api/axiosInstance";
import isJwtExpired from "../utils/isJwtExpired";
import { jwtDecode } from "jwt-decode";

const TokenManager = {
  // Retrieve the access token from localStorage
  getAccessToken() {
    return (
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken")
    );
  },

  // Retrieve the refresh token from localStorage
  getRefreshToken() {
    return (
      localStorage.getItem("refreshToken") ||
      sessionStorage.getItem("refreshToken")
    );
  },

  // Check if the access token is missing or expired
  isAccessTokenInvalid() {
    const token = this.getAccessToken();
    return !token || isJwtExpired(token);
  },

  // Check if the refresh token is missing or expired
  isRefreshTokenInvalid() {
    const token = this.getRefreshToken();
    return !token || isJwtExpired(token);
  },

  // Set the access token after refreshing
  async refreshAccessToken() {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      console.warn("No refresh token available. User needs to log in.");
      this.clearTokens();
      return false;
    }

    try {
      const response = await axiosInstance.post("/token/refresh/", {
        refresh: refreshToken,
      });
      const rememberMe = !!localStorage.getItem("refreshToken");
      this.setAccessToken(response.data.access, rememberMe);
      return true;
    } catch (error) {
      console.error("Failed to refresh access token:", error);
      this.clearTokens();
      return false;
    }
  },

  // Update the access token in localStorage
  setAccessToken(accessToken, rememberMe) {
    if (rememberMe) {
      localStorage.setItem("accessToken", accessToken);
      sessionStorage.removeItem("accessToken");
    } else {
      sessionStorage.setItem("accessToken", accessToken);
      localStorage.removeItem("accessToken");
    }
  },

  // Update the refresh token in localStorage
  setRefreshToken(refreshToken, rememberMe) {
    if (rememberMe) {
      localStorage.setItem("refreshToken", refreshToken);
      sessionStorage.removeItem("refreshToken");
    } else {
      sessionStorage.setItem("refreshToken", refreshToken);
      localStorage.removeItem("refreshToken");
    }
  },

  // Clear both access and refresh tokens from localStorage
  clearTokens() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
  },

  // Decode JWT to get expiry time of accessToken
  getAccessTokenExpiry() {
    const token = this.getAccessToken();
    if (!token) return null;
    try {
      const decoded = jwtDecode(token);
      return decoded.exp * 1000; // Convert to milliseconds
    } catch (err) {
      console.error("Failed to decode access token:", err);
      return null;
    }
  },

  // Decode JWT to get expiry time of refreshToken
  getRefreshTokenExpiry() {
    const token = this.getRefreshToken();
    if (!token) return null;
    try {
      const decoded = jwtDecode(token);
      return decoded.exp * 1000;
    } catch (err) {
      console.error("Failed to decode refresh token:", err);
      return null;
    }
  },
};

export default TokenManager;
