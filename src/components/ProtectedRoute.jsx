import React from 'react';
import { Navigate } from 'react-router-dom';
import { useStartup } from '../context/StartupContext';

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useStartup();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
