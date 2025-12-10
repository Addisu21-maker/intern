import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // Check if user is authenticated
  const isAuthenticated = () => {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    return token !== null && token !== undefined;
  };

  // If not authenticated, redirect to login
  if (!isAuthenticated()) {
    return <Navigate to="/logging" replace />;
  }

  // If authenticated, render the protected component
  return children;
};

export default ProtectedRoute;

