import axios from "axios";
import config from "../config";

const axiosInstance = axios.create({
  baseURL: config.API_BASE_URL,
});

// Helper to retrieve tokens from both storages
const getToken = (key) => {
  return localStorage.getItem(key) || sessionStorage.getItem(key);
};

// Request interceptor to add the JWT token
axiosInstance.interceptors.request.use(
  (config) => {
    // Authorization token into header
    const token = getToken("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const refreshToken =
      localStorage.getItem("refreshToken") ||
      sessionStorage.getItem("refreshToken");
    if (
      error.response.status === 401 &&
      !originalRequest._retry &&
      refreshToken
    ) {
      originalRequest._retry = true;
      try {
        const response = await axios.post(
          `${config.API_BASE_URL}/token/refresh/`,
          {
            refresh: refreshToken,
          }
        );

        // Save the new access token in the appropriate storage
        const newAccessToken = response.data.access;
        if (localStorage.getItem("refreshToken")) {
          localStorage.setItem("accessToken", newAccessToken);
        } else {
          sessionStorage.setItem("accessToken", newAccessToken);
        }

        axiosInstance.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${response.data.access}`;
        originalRequest.headers[
          "Authorization"
        ] = `Bearer ${response.data.access}`;
        return axiosInstance(originalRequest);
      } catch (err) {
        console.error("Refresh token failed", err);

        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        sessionStorage.removeItem("accessToken");
        sessionStorage.removeItem("refreshToken");
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
