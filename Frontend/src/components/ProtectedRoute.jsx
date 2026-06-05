import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useStartup } from '../context/StartupContext';

const ProtectedRoute = ({ children, requireAnalysis = false, skipOnboardingCheck = false }) => {
  const { isLoggedIn, startupDetails, analysisScores, user } = useStartup();
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // Agar user naya hai aur onboarding complete nahi ki, toh onboarding pe bhejo
  // (sirf dashboard aur protected pages ke liye, onboarding pages ke liye nahi)
  const onboardingPaths = ['/onboarding/role', '/onboarding/details', '/startup/validate', '/analysis/loader', '/analysis/result'];
  const isOnOnboardingPath = onboardingPaths.some(p => location.pathname.startsWith(p));
  
  if (!skipOnboardingCheck && !user.onboardingCompleted && !isOnOnboardingPath) {
    return <Navigate to="/onboarding/role" replace />;
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

