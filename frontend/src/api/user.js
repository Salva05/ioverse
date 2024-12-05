import axios from "axios";
import config from "../config";

// Service for User-related API calls
export const account = {
  // POST
  resetPassword: async (email) => {
    const response = await axios.post(
      `${config.VITE_BASE_DOMAIN_URL}/account/reset-password/`,
      {email: email}
    );
    return response.data;
  },
};
