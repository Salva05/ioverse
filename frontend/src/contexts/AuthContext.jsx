import React, { createContext, useState } from "react";
import login from "../services/authService";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setAuthenticated] = useState(false);

  const authenticate = async (username, password) => {
    try {
      const success = await login(username, password);
      if (success) {
        setAuthenticated(true);
      } else {
        throw new Error("Invalid credentials");
      }
    } catch (error) {
      return error.message;
    }
  };

  const logout = () => {
    setAuthenticated(false);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, authenticate, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
