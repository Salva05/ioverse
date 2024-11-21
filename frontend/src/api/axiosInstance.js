import axios from "axios";
import config from "../config";

const axiosInstance = axios.create({
  baseURL: config.API_BASE_URL,
});

// Request interceptor to add the JWT token
axiosInstance.interceptors.request.use(
  (config) => {
    // Authorization token into header
    const token = localStorage.getItem("accessToken");
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
    if (
      error.response.status === 401 &&
      !originalRequest._retry &&
      localStorage.getItem("refreshToken")
    ) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("refreshToken");
      try {
        const response = await axios.post(
          `${config.API_BASE_URL}/token/refresh/`,
          {
            refresh: refreshToken,
          }
        );
        localStorage.setItem("accessToken", response.data.access);
        axiosInstance.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${response.data.access}`;
        originalRequest.headers[
          "Authorization"
        ] = `Bearer ${response.data.access}`;
        return axiosInstance(originalRequest);
      } catch (err) {
        console.error("Refresh token failed", err);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
