import { jwtDecode } from 'jwt-decode';

function isJwtExpired(token) {
  if (!token) return true; // Consider no token as expired

  try {
    const { exp } = jwtDecode(token);
    if (!exp) return true;

    // Check if the token has expired
    const currentTime = Date.now() / 1000;
    return currentTime > exp;
  } catch (error) {
    console.log("An error occurred while checking for token expiration.", error);
    return true;
  }
}

export default isJwtExpired;
