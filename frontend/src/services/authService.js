import axiosInstance from "../api/axiosInstance";

const login = async (username, password) => {
  try {
    const response = await axiosInstance.post("token/", { username, password });
    return response.data; // { access: "access_token", refresh: "refresh_token" }
  } catch (error) {
    console.error("Authentication failed:", error);
    throw error;
  }
};

export default login;
