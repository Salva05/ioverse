import axiosInstance from "../api/axiosInstance";

/**
 * Authenticates the user with the provided credentials.
 * @param {string} username - The user's username.
 * @param {string} password - The user's password.
 * @returns {Promise<{ access: string, refresh: string }>} - The access and refresh tokens.
 * @throws {Error} - Throws an error if authentication fails.
 */
const login = async (username, password) => {
  try {
    const response = await axiosInstance.post("token/", { username, password });
    return response.data; // { access: "access_token", refresh: "refresh_token" }
  } catch (error) {
    console.error("Authentication failed:", error);
    throw error; // Propagate the error to be handled by the caller
  }
};

export default login;
