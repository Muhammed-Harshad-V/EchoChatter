import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode; // Explicitly define the type for children
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // Check if the username exists in localStorage, indicating the user is logged in
  const username = localStorage.getItem("username");

  // If username is found in localStorage, it means the user is logged in
  return username ? <>{children}</> : <Navigate to="/login" />;
};

export default ProtectedRoute;
