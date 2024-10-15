import axios from "axios";
import config from "../config";

const axiosInstance = axios.create({
  baseURL: config.API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/* // Interceptors fro request and response for authorization
axiosInstance.interceptors.request.use(
  (config) => {
    // Authorization token into header
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // This handle global errors
    if (error.response.status === 401) {
      // Nothing for now but will implement authorization
    }
    return Promise.reject(error);
  }
);

*/

export default axiosInstance;