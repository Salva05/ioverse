import TokenManager from "../services/tokenManager";
import axios from "axios";
import config from "../config";

const getToken = async (refreshToken) => {
  try {
    const response = await axios.post(`${config.API_BASE_URL}/token/refresh/`, {
      refresh: refreshToken,
    });

    const newAccessToken = response.data.access;

    // Check if 'remember me' was checked at the moment of login
    if (localStorage.getItem("refreshToken")) {
      localStorage.setItem("accessToken", newAccessToken);
    } else {
      sessionStorage.setItem("accessToken", newAccessToken);
    }

    return newAccessToken;
  } catch (error) {
    console.error(
      "An error occurred while retrieving access token for websocket connection: ",
      error
    );
  }
};

/*
This function ensures that the access token provided to the authentication 
middleware for establishing a WebSocket connection with the server is valid 
and not expired.

This validation is necessary because only HTTP-based calls utilize the 
configured Axios mechanism to automatically retrieve a new access token 
and then proceed with the API call. The WebSocket layer does not follow 
this structure.
*/

export const getAccessToken = async () => {
  if (TokenManager.isAccessTokenInvalid()) {
    // Call the server and get a valid access token
    if (!TokenManager.isRefreshTokenInvalid()) {
      const refreshToken = TokenManager.getRefreshToken();
      return await getToken(refreshToken);
    } else {
      console.log(TokenManager.isRefreshTokenInvalid())
      throw new Error("Authentication failed: Please log in again.");
    }
  } else {
    return TokenManager.getAccessToken();
  }
};
