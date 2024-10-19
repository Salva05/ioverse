import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);
  const location = useLocation();

  // If the user is not authenticated, redirect to login and pass the state with the message
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: location, message: "You need to login to access this page" }}
      />
    );
  }

  // Otherwise, render the children (protected content)
  return children;
};

export default ProtectedRoute;
