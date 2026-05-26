import { useState, useEffect, useCallback } from 'react';

export const useStartupStorage = () => {
  const [draftExists, setDraftExists] = useState(false);

  // Check draft presence on mount or trigger
  const checkDraft = useCallback(() => {
    const draft = localStorage.getItem('startup_draft');
    setDraftExists(!!draft);
    return !!draft;
  }, []);

  useEffect(() => {
    checkDraft();
  }, [checkDraft]);

  // Manually commit draft state
  const saveDraft = useCallback((onboardingRole, startupDetails, currentStep) => {
    try {
      const payload = {
        onboardingRole,
        startupDetails,
        currentStep,
        timestamp: Date.now()
      };
      localStorage.setItem('startup_draft', JSON.stringify(payload));
      setDraftExists(true);
      return true;
    } catch (e) {
      console.error('Failed to commit startup draft to local storage:', e);
      return false;
    }
  }, []);

  // Restore onboarding draft
  const restoreDraft = useCallback(() => {
    try {
      const raw = localStorage.getItem('startup_draft');
      if (raw) {
        return JSON.parse(raw);
      }
      return null;
    } catch (e) {
      console.error('Failed to restore draft from local storage:', e);
      return null;
    }
  }, []);

  // Purge onboarding draft
  const clearDraft = useCallback(() => {
    localStorage.removeItem('startup_draft');
    setDraftExists(false);
  }, []);

  return {
    draftExists,
    checkDraft,
    saveDraft,
    restoreDraft,
    clearDraft
  };
};
export default useStartupStorage;
