import axiosInstance from "./api/axiosInstance";

const login = async (username, password) => {
  try {
    const response = await axiosInstance.post("token/", { username, password });
    localStorage.setItem("accessToken", response.data.access);
    localStorage.setItem("refreshToken", response.data.refresh);
  } catch (error) {
    console.log("Authentication failed: ", error);
    return false;
  }
  return true;
};

export default login;
