import React, { createContext, useState, useContext, useEffect } from 'react';

const StartupContext = createContext(null);

export const useStartup = () => {
  const context = useContext(StartupContext);
  if (!context) {
    throw new Error('useStartup must be used within a StartupProvider');
  }
  return context;
};

export const StartupProvider = ({ children }) => {
  // Authentication & User Profile State
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('startupxpert_user');
    return savedUser ? JSON.parse(savedUser) : {
      fullName: '',
      email: '',
      role: 'Founder', // Founder / Student / Business Team
    };
  });

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });

  // Step 1: Onboarding Role & Profession State
  const [onboardingRole, setOnboardingRole] = useState({
    fullName: '',
    age: '',
    gender: '', // Male / Female / Non-binary / Prefer not to say
    city: '',
    country: '',
    profession: '', // Founder / Student / Developer / Business Analyst / Other
    experience: '', // 0-1 yrs / 1-3 yrs / 3-5 yrs / 5+ yrs
    founderCount: '', // 1 / 2 / 3 / 4+
    founderSkillset: [], // Tech, Marketing, Finance, Design, Operations
  });

  // Step 2: Onboarding Startup Details State (17 Specific Fields)
  const [startupDetails, setStartupDetails] = useState({
    startupName: '',
    startupDomain: '', // HealthTech / EdTech / FinTech / AgriTech / E-Commerce / SaaS / Other
    problemStatement: '',
    startupDescription: '',
    targetAudience: '',
    geographicMarket: '',
    existingCompetitors: '',
    revenueModel: '', // Subscription / Freemium / One-time / Commission / Ads / Other
    estimatedPricing: '',
    availableFunding: '', // Bootstrapped / <₹1L / ₹1L-10L / ₹10L-1Cr / VC Funded
    monthlyBurnCapacity: '',
    platformType: [], // Web App / Mobile App / API / Desktop / SaaS
    techComplexity: '', // Low / Medium / High
    mvpTimeline: '', // 1 month / 3 months / 6 months / 12 months
    scalabilityGoal: '', // Local / National / Global
    acquisitionStrategy: '',
    startupStage: '', // Idea / Validation / MVP / Growth / Scaling
  });

  // Step 3: Analysis State for 9 Metric Cards
  const [analysisScores, setAnalysisScores] = useState(null); // null means pending analysis
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Sync auth state to localStorage
  useEffect(() => {
    localStorage.setItem('isLoggedIn', isLoggedIn ? 'true' : 'false');
  }, [isLoggedIn]);

  useEffect(() => {
    localStorage.setItem('startupxpert_user', JSON.stringify(user));
  }, [user]);

  // Auth Operations
  const loginUser = (email, password, name = 'Innovator') => {
    setUser({
      fullName: name,
      email: email,
      role: 'Founder'
    });
    setIsLoggedIn(true);
  };

  const registerUser = (fullName, email, role) => {
    setUser({
      fullName,
      email,
      role
    });
    setOnboardingRole(prev => ({
      ...prev,
      fullName
    }));
  };

  const logoutUser = () => {
    setIsLoggedIn(false);
    setUser({ fullName: '', email: '', role: 'Founder' });
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('startupxpert_user');
    // Clear onboarding data
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
  };

  // Onboarding Role Actions
  const updateOnboardingRole = (fields) => {
    setOnboardingRole(prev => ({
      ...prev,
      ...fields
    }));
    // Sync full name back to main user state if edited
    if (fields.fullName) {
      setUser(prev => ({
        ...prev,
        fullName: fields.fullName
      }));
    }
  };

  // Onboarding Details Actions
  const updateStartupDetails = (fieldName, value) => {
    setStartupDetails(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const updateStartupDetailsBulk = (data) => {
    setStartupDetails(prev => ({
      ...prev,
      ...data
    }));
  };

  // Step 3: Run Simulated Analysis
  const runAnalysis = () => {
    setIsAnalyzing(true);
    setAnalysisScores(null);
    
    // Simulate API loading state for 2 seconds
    setTimeout(() => {
      setAnalysisScores({
        marketDemand: { score: 84, status: 'High', details: 'Significant demand driven by rapid digital transformation.' },
        targetAudienceFit: { score: 79, status: 'High', details: 'Niche demographics show high initial willingness to pay.' },
        problemSolutionFit: { score: 88, status: 'High', details: 'Directly addresses friction points identified in user studies.' },
        competitorPresence: { score: 45, status: 'Medium', details: 'Moderately crowded space; unique value proposition needed.' },
        revenuePotential: { score: 74, status: 'High', details: 'Subscription-based structure supports long-term LTV growth.' },
        riskLevel: { score: 38, status: 'Low', details: 'Low regulatory hurdles and low initial capital expenditure.' },
        innovationLevel: { score: 81, status: 'High', details: 'Proprietary automated workflow separates it from incumbents.' },
        scalability: { score: 92, status: 'High', details: 'Zero-marginal-cost distribution models permit rapid growth.' },
        feasibility: { score: 72, status: 'Medium', details: 'Requires specialized tech execution but within standard roadmap.' }
      });
      setIsAnalyzing(false);
    }, 2000);
  };

  return (
    <StartupContext.Provider
      value={{
        user,
        isLoggedIn,
        onboardingRole,
        startupDetails,
        analysisScores,
        isAnalyzing,
        loginUser,
        registerUser,
        logoutUser,
        updateOnboardingRole,
        updateStartupDetails,
        updateStartupDetailsBulk,
        runAnalysis,
        setAnalysisScores
      }}
    >
      {children}
    </StartupContext.Provider>
  );
};
export default StartupContext;
