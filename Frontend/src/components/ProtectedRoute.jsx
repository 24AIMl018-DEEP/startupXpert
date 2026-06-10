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

  // Gate 1.5 — Member role restriction
  const isMember = user?.userType === 'org' && (user?.role === 'Member' || user?.role === 'member');
  if (isMember) {
    const allowedMemberPaths = ['/member', '/profile', '/settings'];
    const isAllowed = allowedMemberPaths.some(p => location.pathname.startsWith(p));
    if (!isAllowed) {
      return <Navigate to="/member" replace />;
    }
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
  // If user is logged in and userId exists, they've already completed onboarding (DB verified at login)
  const isOnboardingDone = user?.onboardingCompleted || (isLoggedIn && !!user?.userId);
  if (!skipOnboardingCheck && !isOnboardingDone && !isOnOnboardingPath) {
    return <Navigate to="/onboarding/role" replace />;
  }

  // Gate 3 — analysis result page: check context OR sessionStorage (handles refresh)
  if (requireAnalysis) {
    const hasScores = !!analysisScores;
    const hasCached = (() => { try { return !!sessionStorage.getItem('sx_scores'); } catch { return false; } })();
    if (!hasScores && !hasCached) {
      return <Navigate to="/startup/validate" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
