import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useStartup } from '../context/StartupContext';

const ProtectedRoute = ({ children, requireAnalysis = false }) => {
  const { isLoggedIn, analysisScores, startupDetails } = useStartup();
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (requireAnalysis) {
    const hasDetails = startupDetails && startupDetails.startupName;
    const hasScores = !!analysisScores;
    if (!hasDetails || !hasScores) {
      return <Navigate to="/startup/validate" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
