import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useStartup } from '../context/StartupContext';

/**
 * ProtectedRoute — enforces three gates in order:
 *
 *  1. Not logged in → /login
 *  2. Onboarding not complete AND not on an onboarding path → /onboarding/role
 *  3. requireAnalysis=true but no scores in context → /startup/validate
 *
 * skipOnboardingCheck is kept for the onboarding pages themselves so they
 * don't redirect to themselves in a loop.
 */
const ProtectedRoute = ({
  children,
  requireAnalysis    = false,
  skipOnboardingCheck = false,
}) => {
  const { isLoggedIn, startupDetails, analysisScores, user } = useStartup();
  const location = useLocation();

  // Gate 1 — must be logged in
  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Paths that are part of the onboarding flow — don't redirect away from these
  const onboardingPaths = [
    '/onboarding/role',
    '/onboarding/details',
    '/startup/validate',
    '/analysis/loader',
    '/analysis/result',
  ];
  const isOnOnboardingPath = onboardingPaths.some(p => location.pathname.startsWith(p));

  // Gate 2 — onboarding must be complete before accessing any non-onboarding protected page
  if (!skipOnboardingCheck && !user?.onboardingCompleted && !isOnOnboardingPath) {
    return <Navigate to="/onboarding/role" replace />;
  }

  // Gate 3 — analysis result page requires scores to be present
  if (requireAnalysis) {
    const hasDetails = startupDetails?.startupName;
    const hasScores  = !!analysisScores;
    if (!hasDetails || !hasScores) {
      return <Navigate to="/startup/validate" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
