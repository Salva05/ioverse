import axiosInstance from "./api/axiosInstance";

const login = async (username, password) => {
  const response = await axiosInstance.post('token/', { username, password });
  localStorage.setItem('accessToken', response.data.access);
  localStorage.setItem('refreshToken', response.data.refresh);
  console.log("Login successful");
};

export default login;
