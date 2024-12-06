import axios from "axios";
import config from "../config";

// Service for signup API calls
const register = async (userData) => {
  // POST
  try {
    const response = await axios.post(
      config.VITE_BASE_DOMAIN_URL + "/register/",
      userData,
    );
    return response;
  } catch (error) {
    console.error("Registration failed:", error);
    if (error.code === 'ECONNABORTED') {
      throw new Error("A network error occurred. Please try again.");
    }
    throw error; // Re-throw error for handling in the component
  }
};

export default register;
