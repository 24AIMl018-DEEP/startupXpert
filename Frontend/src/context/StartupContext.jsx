import React, { createContext, useState, useContext, useEffect } from 'react';
import { useToast } from './ToastContext';

const StartupContext = createContext(null);

export const useStartup = () => {
  const context = useContext(StartupContext);
  if (!context) {
    throw new Error('useStartup must be used within a StartupProvider');
  }
  return context;
};

export const StartupProvider = ({ children }) => {
  const { showToast } = useToast();

  // 1. Authentication & User Profile States (persisted under startup_user & startupxpert_user)
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('startup_user') || localStorage.getItem('startupxpert_user');
    return savedUser ? JSON.parse(savedUser) : {
      fullName: '',
      email: '',
      role: 'Founder',
      avatarUrl: '', // simulated avatar base64 or URL
      isNewUser: false,
    };
  });

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });

  // 2. Settings State (persisted under startup_settings)
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('startup_settings');
    return saved ? JSON.parse(saved) : {
      themeMode: 'Dark',
      theme: 'Dark Futurism', // dynamic active theme
      notificationsEnabled: true,
      autoSaveDrafts: true,
      analysisPreference: 'Comprehensive'
    };
  });

  // 3. Onboarding Role Setup (Step 1)
  const [onboardingRole, setOnboardingRole] = useState({
    fullName: '',
    age: '',
    gender: '',
    city: '',
    country: '',
    profession: '',
    experience: '',
    founderCount: '',
    founderSkillset: [],
  });

  // 4. Onboarding Startup Details (Step 2 - 17 Fields)
  const [startupDetails, setStartupDetails] = useState({
    startupName: '',
    startupDomain: '',
    problemStatement: '',
    startupDescription: '',
    targetAudience: '',
    geographicMarket: '',
    existingCompetitors: '',
    revenueModel: '',
    estimatedPricing: '',
    availableFunding: '',
    monthlyBurnCapacity: '',
    platformType: [],
    techComplexity: '',
    mvpTimeline: '',
    scalabilityGoal: '',
    acquisitionStrategy: '',
    startupStage: '',
  });

  // 5. Analysis Scores (Step 3)
  const [analysisScores, setAnalysisScores] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // 6. Upgraded System States & History
  const [analysisHistory, setAnalysisHistory] = useState(() => {
    const savedHistory = localStorage.getItem('startup_history');
    return savedHistory ? JSON.parse(savedHistory) : [];
  });

  const [loadingState, setLoadingState] = useState(false);
  const [errorState, setErrorState] = useState(null);
  const [currentStep, setCurrentStep] = useState(0); // Onboarding डिटेल्स index (0 to 16)
  const [resumeState, setResumeState] = useState(false);

  // Check draft presence on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('startup_draft');
    if (savedDraft) {
      setResumeState(true);
    }
  }, []);

  // Synchronous State Commit
  const loginUser = (email, password, name = 'Innovator') => {
    const activeUser = {
      fullName: name,
      email: email,
      role: 'Founder',
      avatarUrl: user.avatarUrl || ''
    };
    setUser(activeUser);
    setIsLoggedIn(true);
    
    // Direct localStorage sets to prevent async timeout delays
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('startup_user', JSON.stringify(activeUser));
    localStorage.setItem('startupxpert_user', JSON.stringify(activeUser));
  };

  const registerUser = (fullName, email, role) => {
    const activeUser = {
      fullName,
      email,
      role,
      avatarUrl: '',
      isNewUser: true // Register sets new user
    };
    setUser(activeUser);
    setIsLoggedIn(true);
    setOnboardingRole(prev => ({ ...prev, fullName }));
    
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('startup_user', JSON.stringify(activeUser));
    localStorage.setItem('startupxpert_user', JSON.stringify(activeUser));
  };

  const logoutUser = () => {
    setIsLoggedIn(false);
    setUser({ fullName: '', email: '', role: 'Founder', avatarUrl: '' });
    
    // Purge localStorage keys explicitly as requested
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('startup_user');
    localStorage.removeItem('startupxpert_user');
    
    // Clear onboarding states
    setOnboardingRole({
      fullName: '',
      age: '',
      gender: '',
      city: '',
      country: '',
      profession: '',
      experience: '',
      founderCount: '',
      founderSkillset: [],
    });
    setStartupDetails({
      startupName: '',
      startupDomain: '',
      problemStatement: '',
      startupDescription: '',
      targetAudience: '',
      geographicMarket: '',
      existingCompetitors: '',
      revenueModel: '',
      estimatedPricing: '',
      availableFunding: '',
      monthlyBurnCapacity: '',
      platformType: [],
      techComplexity: '',
      mvpTimeline: '',
      scalabilityGoal: '',
      acquisitionStrategy: '',
      startupStage: '',
    });
    setAnalysisScores(null);
    setResumeState(false);
    showToast('Logged out successfully.', 'info');
  };

  const setUserInfo = (userInfo) => {
    setUser(userInfo);
    localStorage.setItem('startup_user', JSON.stringify(userInfo));
    localStorage.setItem('startupxpert_user', JSON.stringify(userInfo));
  };

  // Sync Active Theme Class to DOM
  useEffect(() => {
    const activeTheme = settings.theme || 'Dark Futurism';
    
    // Remove other theme classes
    document.body.classList.remove('theme-dark-futurism', 'theme-midnight-blue', 'theme-neo-emerald');
    
    // Add active theme class
    if (activeTheme === 'Midnight Blue') {
      document.body.classList.add('theme-midnight-blue');
    } else if (activeTheme === 'Neo Emerald') {
      document.body.classList.add('theme-neo-emerald');
    } else {
      document.body.classList.add('theme-dark-futurism');
    }
  }, [settings.theme]);

  const setNewUserStatus = (status) => {
    setUser(prev => {
      const updated = { ...prev, isNewUser: status };
      localStorage.setItem('startup_user', JSON.stringify(updated));
      localStorage.setItem('startupxpert_user', JSON.stringify(updated));
      return updated;
    });
  };

  const saveSettings = (newSettings) => {
    setLoadingState(true);
    setTimeout(() => {
      setSettings(newSettings);
      localStorage.setItem('startup_settings', JSON.stringify(newSettings));
      setLoadingState(false);
      showToast('Settings saved successfully!', 'success');
    }, 800);
  };

  const resetSettingsDefaults = () => {
    const defaults = {
      themeMode: 'Dark',
      theme: 'Dark Futurism',
      notificationsEnabled: true,
      autoSaveDrafts: true,
      analysisPreference: 'Comprehensive'
    };
    setSettings(defaults);
    localStorage.setItem('startup_settings', JSON.stringify(defaults));
    showToast('Settings reset to defaults.', 'info');
  };

  const setStartupInfo = (info) => {
    setStartupDetails(prev => ({ ...prev, ...info }));
  };

  const setLoading = (loading) => {
    setLoadingState(loading);
  };

  const setError = (err) => {
    setErrorState(err);
  };

  // Onboarding Setup Setters
  const updateOnboardingRole = (fields) => {
    setOnboardingRole(prev => ({
      ...prev,
      ...fields
    }));
    if (fields.fullName) {
      const updatedUser = { ...user, fullName: fields.fullName };
      setUser(updatedUser);
      localStorage.setItem('startup_user', JSON.stringify(updatedUser));
    }
  };

  const updateStartupDetails = (fieldName, value) => {
    setStartupDetails(prev => {
      const updated = { ...prev, [fieldName]: value };
      if (settings.autoSaveDrafts) {
        saveDraftSilent(updated);
      }
      return updated;
    });
  };

  const updateStartupDetailsBulk = (data) => {
    setStartupDetails(prev => {
      const updated = { ...prev, ...data };
      if (settings.autoSaveDrafts) {
        saveDraftSilent(updated);
      }
      return updated;
    });
  };

  // Onboarding draft storage auto-saves
  const saveDraftSilent = (currentDetails) => {
    const draftPayload = {
      onboardingRole,
      startupDetails: currentDetails,
      currentStep,
      timestamp: Date.now()
    };
    localStorage.setItem('startup_draft', JSON.stringify(draftPayload));
  };

  const saveDraft = (stepIndex, activeDetails) => {
    setLoadingState(true);
    setTimeout(() => {
      const draftPayload = {
        onboardingRole,
        startupDetails: activeDetails || startupDetails,
        currentStep: stepIndex !== undefined ? stepIndex : currentStep,
        timestamp: Date.now()
      };
      localStorage.setItem('startup_draft', JSON.stringify(draftPayload));
      setResumeState(true);
      setLoadingState(false);
      showToast('Startup draft auto-saved successfully!', 'success');
    }, 800);
  };

  const restoreDraft = () => {
    const savedDraft = localStorage.getItem('startup_draft');
    if (savedDraft) {
      setLoadingState(true);
      const parsed = JSON.parse(savedDraft);
      
      if (parsed.onboardingRole) setOnboardingRole(parsed.onboardingRole);
      if (parsed.startupDetails) setStartupDetails(parsed.startupDetails);
      if (parsed.currentStep !== undefined) setCurrentStep(parsed.currentStep);
      
      setResumeState(false);
      setLoadingState(false);
      showToast('Onboarding progress draft restored!', 'success');
      return parsed;
    }
    showToast('No active draft found.', 'error');
    return null;
  };

  const clearDraft = () => {
    localStorage.removeItem('startup_draft');
    setResumeState(false);
    setCurrentStep(0);
  };

  // History & score archiving operations
  const appendHistory = (entry) => {
    const updated = [entry, ...analysisHistory];
    setAnalysisHistory(updated);
    localStorage.setItem('startup_history', JSON.stringify(updated));
  };

  const saveAnalysis = (scoresToSave) => {
    setLoadingState(true);
    setTimeout(() => {
      const activeScores = scoresToSave || analysisScores;
      if (!activeScores) {
        setLoadingState(false);
        showToast('No active analysis scores available to save.', 'error');
        return;
      }

      const newHistoryEntry = {
        id: Math.random().toString(36).substring(2, 9),
        startupName: startupDetails.startupName || 'Unnamed Venture',
        date: new Date().toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        scores: activeScores,
        risk: activeScores.riskLevel?.status || 'Medium',
        status: activeScores.feasibility?.status || 'High',
        summary: activeScores.marketDemand?.details || 'Feasibility analysis report compiled.'
      };

      appendHistory(newHistoryEntry);
      clearDraft();
      
      setLoadingState(false);
      showToast('Feasibility analysis archived successfully!', 'success');
    }, 1000);
  };

  const deleteHistoryItem = (id) => {
    setLoadingState(true);
    setTimeout(() => {
      const updated = analysisHistory.filter((item) => item.id !== id);
      setAnalysisHistory(updated);
      localStorage.setItem('startup_history', JSON.stringify(updated));
      setLoadingState(false);
      showToast('Analysis entry deleted from history.', 'info');
    }, 600);
  };

  const clearHistory = () => {
    setLoadingState(true);
    setTimeout(() => {
      setAnalysisHistory([]);
      localStorage.removeItem('startup_history');
      setLoadingState(false);
      showToast('All analysis records cleared.', 'info');
    }, 800);
  };

  const runAnalysis = () => {
    setIsAnalyzing(true);
    setAnalysisScores(null);
    setNewUserStatus(false); // Persist isNewUser=false after first validation
    
    setTimeout(() => {
      const mockResult = {
        marketDemand: { score: 84, status: 'High', details: 'Significant demand driven by rapid digital transformation.' },
        targetAudienceFit: { score: 79, status: 'High', details: 'Niche demographics show high initial willingness to pay.' },
        problemSolutionFit: { score: 88, status: 'High', details: 'Directly addresses friction points identified in user studies.' },
        competitorPresence: { score: 45, status: 'Medium', details: 'Moderately crowded space; unique visual workflows recommended.' },
        revenuePotential: { score: 74, status: 'High', details: 'Subscription-based models support robust recurring revenues.' },
        riskLevel: { score: 38, status: 'Low', details: 'Low regulatory hurdles and low initial capital expenditure.' },
        innovationLevel: { score: 81, status: 'High', details: 'Proprietary automated workflow separates it from incumbents.' },
        scalability: { score: 92, status: 'High', details: 'Zero-marginal-cost distribution models permit rapid growth.' },
        feasibility: { score: 72, status: 'Medium', details: 'Requires specialized tech execution but within standard roadmap.' }
      };
      setAnalysisScores(mockResult);
      setIsAnalyzing(false);
    }, 2000);
  };

  const dashboardStats = {
    totalStartups: analysisHistory.length,
    completedAnalysis: analysisHistory.filter((h) => h.scores).length,
    savedDraftCount: resumeState ? 1 : 0,
    roadmapProgress: analysisHistory.length > 0 ? '4 / 10' : '0 / 10',
  };

  // Helper: Get Name Initials
  const getInitials = () => {
    if (!user.fullName) return 'IN';
    return user.fullName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <StartupContext.Provider
      value={{
        user,
        isLoggedIn,
        settings,
        onboardingRole,
        startupDetails,
        analysisScores,
        isAnalyzing,
        analysisHistory,
        loadingState,
        errorState,
        currentStep,
        resumeState,
        dashboardStats,

        loginUser,
        registerUser,
        logoutUser,
        setUserInfo,
        saveSettings,
        resetSettingsDefaults,
        updateOnboardingRole,
        updateStartupDetails,
        updateStartupDetailsBulk,
        setStartupInfo,
        runAnalysis,
        setAnalysisScores,
        saveAnalysis,
        saveDraft,
        restoreDraft,
        clearDraft,
        deleteHistoryItem,
        clearHistory,
        setLoading,
        setError,
        setCurrentStep,
        getInitials,
        setNewUserStatus
      }}
    >
      {children}
    </StartupContext.Provider>
  );
};

export default StartupContext;
