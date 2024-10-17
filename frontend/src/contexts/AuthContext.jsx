import React, { createContext, useState } from "react";
import login from "../authService";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setAuthenticated] = useState(false);

  const authenticate = (username, password) => {
    if (login(username, password)) {
      setAuthenticated(true);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, authenticate }}>
      {children}
    </AuthContext.Provider>
  );
};
