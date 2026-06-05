import React, { createContext, useState, useContext, useEffect } from 'react';
import { useToast } from './ToastContext';
import { submitValidation, submitRoadmap } from '../services/startupApi';
import { getCurrentUserId } from '../services/authService';

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

  // Default Roadmap Milestones Structure (10 Core Stages + parent-child hierarchy)
  const defaultRoadmapNodes = [
    {
      id: 'root',
      parentId: null,
      title: 'Startup Launchpad',
      description: 'The central mission command center of your venture.',
      status: 'In Progress',
      priority: 'High',
      isExpanded: true,
      tasks: [],
      notes: [],
      recommendations: 'This is the core foundation node. Launch your branches to build your startup operating system.'
    },
    {
      id: 'stage-1',
      parentId: 'root',
      title: 'Idea Research',
      description: 'Validate the core problem and design the initial solution concept.',
      status: 'Completed',
      priority: 'High',
      isExpanded: true,
      tasks: [
        { id: 't1-1', text: 'Define core value proposition', completed: true },
        { id: 't1-2', text: 'Create problem statement canvas', completed: true }
      ],
      notes: [
        { id: 'n1-1', text: 'Focus heavily on automated visual creator tools.', timestamp: Date.now() - 3600000 }
      ],
      recommendations: 'Verify target audience pain points through online surveys, social discussions, or direct outreach.'
    },
    {
      id: 'stage-2',
      parentId: 'stage-1',
      title: 'Market Validation',
      description: 'Assess size of the target market, target demographics, and willingness to pay.',
      status: 'In Progress',
      priority: 'High',
      isExpanded: true,
      tasks: [
        { id: 't2-1', text: 'Conduct 10 buyer persona interviews', completed: true },
        { id: 't2-2', text: 'Calculate TAM, SAM, SOM metrics', completed: false },
        { id: 't2-3', text: 'Deploy static landing page test', completed: false }
      ],
      notes: [],
      recommendations: 'Keep validation tests simple. Launch a signup form page and track visitor conversion ratios.'
    },
    {
      id: 'stage-3',
      parentId: 'stage-2',
      title: 'Competitor Analysis',
      description: 'Map competitor positions, research pricing schemes, and identify USPs.',
      status: 'Pending',
      priority: 'Medium',
      isExpanded: true,
      tasks: [
        { id: 't3-1', text: 'Build feature comparison spreadsheet', completed: false },
        { id: 't3-2', text: 'Analyze competitor reviews on G2/Capterra', completed: false }
      ],
      notes: [],
      recommendations: 'Map direct vs indirect competitors and highlight your unfair distribution or pricing advantage.'
    },
    {
      id: 'stage-4',
      parentId: 'root',
      title: 'MVP Development',
      description: 'Scope core features and build a working functional prototype of your app.',
      status: 'Pending',
      priority: 'High',
      isExpanded: true,
      tasks: [
        { id: 't4-1', text: 'Draft system architecture map', completed: false },
        { id: 't4-2', text: 'Create UI wireframes in Figma', completed: false },
        { id: 't4-3', text: 'Build core frontend dashboard view', completed: false }
      ],
      notes: [],
      recommendations: 'Minimize product scopes. Only build features that directly resolve the primary problem statement.'
    },
    {
      id: 'stage-5',
      parentId: 'stage-4',
      title: 'User Testing & Feedback',
      description: 'Recruit beta testers, record session video walkthroughs, and collect reviews.',
      status: 'Pending',
      priority: 'Medium',
      isExpanded: true,
      tasks: [
        { id: 't5-1', text: 'Onboard 5-10 beta cohort users', completed: false },
        { id: 't5-2', text: 'Track conversion drop-offs', completed: false }
      ],
      notes: [],
      recommendations: 'Watch early users interact with your software live without giving them instructions to observe design friction.'
    },
    {
      id: 'stage-6',
      parentId: 'stage-5',
      title: 'Business Registration',
      description: 'Incorporate business structure, draft terms of service, and open bank accounts.',
      status: 'Pending',
      priority: 'Low',
      isExpanded: true,
      tasks: [
        { id: 't6-1', text: 'Incorporate LLC or Private Limited', completed: false },
        { id: 't6-2', text: 'Draft Privacy Policy and Terms of Service', completed: false }
      ],
      notes: [],
      recommendations: 'Use online registration services to automate incorporating, avoiding heavy early legal fees.'
    },
    {
      id: 'stage-7',
      parentId: 'root',
      title: 'Go-To-Market',
      description: 'Create marketing content plans, launch ads, and set up brand channels.',
      status: 'Pending',
      priority: 'High',
      isExpanded: true,
      tasks: [
        { id: 't7-1', text: 'Build email waiting list database', completed: false },
        { id: 't7-2', text: 'Publish 3 search engine optimized articles', completed: false }
      ],
      notes: [],
      recommendations: 'Prioritize content marketing and online community distributions to bootstrap organic acquisitions.'
    },
    {
      id: 'stage-8',
      parentId: 'stage-7',
      title: 'Revenue & Pricing',
      description: 'Set up subscriptions and pricing tables, and integrate stripe checkout forms.',
      status: 'Pending',
      priority: 'High',
      isExpanded: true,
      tasks: [
        { id: 't8-1', text: 'Configure Stripe billing configurations', completed: false },
        { id: 't8-2', text: 'Deploy public pricing tier card grid', completed: false }
      ],
      notes: [],
      recommendations: 'Offer a yearly billing tier with high discounts to boost initial cash reserves.'
    },
    {
      id: 'stage-9',
      parentId: 'root',
      title: 'Funding Preparation',
      description: 'Formulate financial models, outline investment sheets, and draft pitch deck layouts.',
      status: 'Pending',
      priority: 'Medium',
      isExpanded: true,
      tasks: [
        { id: 't9-1', text: 'Create 12-page investor pitch presentation', completed: false },
        { id: 't9-2', text: 'Project 12-month burn calculations', completed: false }
      ],
      notes: [],
      recommendations: 'Prepare a 1-page executive memo summarizing validation scores, revenue margins, and growth metrics.'
    },
    {
      id: 'stage-10',
      parentId: 'stage-9',
      title: 'Growth & Scaling',
      description: 'Scale operational pipelines, optimize onboarding conversions, and execute partnership integrations.',
      status: 'Pending',
      priority: 'Medium',
      isExpanded: true,
      tasks: [
        { id: 't10-1', text: 'Configure segment tracking events', completed: false },
        { id: 't10-2', text: 'Partner with complementary agencies', completed: false }
      ],
      notes: [],
      recommendations: 'Implement referral systems where founders earn usage bonuses for inviting new colleagues.'
    }
  ];

  // 1. Authentication & User Profile States (persisted under startup_user & startupxpert_user)
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('startup_user') || localStorage.getItem('startupxpert_user');
    const parsed = savedUser ? JSON.parse(savedUser) : null;
    if (parsed) {
      if (parsed.onboardingCompleted === undefined) {
        const savedHistory = localStorage.getItem('startup_history');
        const hasHistory = savedHistory ? JSON.parse(savedHistory).length > 0 : false;
        parsed.onboardingCompleted = hasHistory;
      }
      return parsed;
    }
    return {
      fullName: '',
      email: '',
      role: 'Founder',
      avatarUrl: '', // simulated avatar base64 or URL
      isNewUser: false,
      onboardingCompleted: false
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

  // Roadmap State — empty by default, populated only when user generates from backend
  const [roadmapNodes, setRoadmapNodes] = useState(() => {
    const saved = localStorage.getItem('startup_roadmap');
    return saved ? JSON.parse(saved) : [];
  });
  const [roadmapData, setRoadmapData]   = useState(null);  // full backend roadmap response
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);

  // Auto-save roadmap to localStorage
  useEffect(() => {
    if (roadmapNodes.length > 0) {
      localStorage.setItem('startup_roadmap', JSON.stringify(roadmapNodes));
    }
  }, [roadmapNodes]);

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
  const [fullAnalysisData, setFullAnalysisData] = useState(null); // complete backend response
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // 6. Upgraded System States & History
  const [analysisHistory, setAnalysisHistory] = useState(() => {
    const savedHistory = localStorage.getItem('startup_history');
    return savedHistory ? JSON.parse(savedHistory) : [];
  });

  const [loadingState, setLoadingState] = useState(false);
  const [errorState, setErrorState] = useState(null);
  const [currentStep, setCurrentStep] = useState(0); // Onboarding index (0 to 16)
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
    const savedHistory = localStorage.getItem('startup_history');
    const hasHistory = savedHistory ? JSON.parse(savedHistory).length > 0 : false;
    
    // Pehle se saved user data check karo (agar onboarding pehle complete ho chuki ho)
    const prevSavedUser = localStorage.getItem('startup_user');
    const prevUser = prevSavedUser ? JSON.parse(prevSavedUser) : null;
    const wasOnboardingCompleted = prevUser?.onboardingCompleted === true || hasHistory;

    const activeUser = {
      fullName: name,
      email: email,
      role: 'Founder',
      avatarUrl: user.avatarUrl || '',
      isNewUser: !hasHistory,              // new user agar koi history nahi
      onboardingCompleted: wasOnboardingCompleted  // completed if analysis done ya pehle se completed
    };
    setUser(activeUser);
    setIsLoggedIn(true);
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
      isNewUser: true,
      onboardingCompleted: false // naye user ko onboarding complete karni hai
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
    localStorage.removeItem('startup_roadmap');

    // Reset roadmap
    setRoadmapNodes([]);
    setRoadmapData(null);

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
        // setTimeout 0 prevents setState-during-render warning
        setTimeout(() => saveDraftSilent(updated), 0);
      }
      return updated;
    });
  };

  const updateStartupDetailsBulk = (data) => {
    setStartupDetails(prev => {
      const updated = { ...prev, ...data };
      if (settings.autoSaveDrafts) {
        setTimeout(() => saveDraftSilent(updated), 0);
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
        startupDetails: { ...startupDetails },
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

      // Update onboarding status to completed
      setUser(prev => {
        const updated = { ...prev, onboardingCompleted: true };
        localStorage.setItem('startup_user', JSON.stringify(updated));
        localStorage.setItem('startupxpert_user', JSON.stringify(updated));
        return updated;
      });

      setLoadingState(false);
      showToast('Feasibility analysis archived successfully! Onboarding complete.', 'success');
    }, 1000);
  };

  const updateRoadmapNode = (id, updatedFields) => {
    setRoadmapNodes(prev => prev.map(node => node.id === id ? { ...node, ...updatedFields } : node));
  };

  const addRoadmapNode = (parentId, title, description) => {
    const newNode = {
      id: `custom-node-${Date.now()}`,
      parentId: parentId || 'root',
      title: title || 'Custom Milestone',
      description: description || 'No description provided.',
      status: 'Pending',
      priority: 'Medium',
      isExpanded: true,
      tasks: [],
      notes: [],
      recommendations: 'Identify specific targets and run iterative validations for this custom milestone.'
    };
    setRoadmapNodes(prev => [...prev, newNode]);
    showToast(`Added child node "${title}" successfully.`, 'success');
  };

  const deleteRoadmapNode = (id) => {
    if (id === 'root') {
      showToast('Cannot delete the root Startup Launchpad node.', 'error');
      return;
    }
    const getDescendantIds = (nodeId, nodesList) => {
      const children = nodesList.filter(n => n.parentId === nodeId);
      let ids = children.map(c => c.id);
      children.forEach(c => {
        ids = [...ids, ...getDescendantIds(c.id, nodesList)];
      });
      return ids;
    };

    setRoadmapNodes(prev => {
      const toDelete = [id, ...getDescendantIds(id, prev)];
      return prev.filter(node => !toDelete.includes(node.id));
    });
    showToast('Node and its branches deleted.', 'info');
  };

  const manageSubTask = (nodeId, action, taskPayload) => {
    setRoadmapNodes(prev => prev.map(node => {
      if (node.id !== nodeId) return node;

      let updatedTasks = [...node.tasks];
      if (action === 'add') {
        updatedTasks.push({
          id: `task-${Date.now()}`,
          text: taskPayload.text,
          completed: false
        });
      } else if (action === 'toggle') {
        updatedTasks = updatedTasks.map(t => t.id === taskPayload.id ? { ...t, completed: !t.completed } : t);
      } else if (action === 'delete') {
        updatedTasks = updatedTasks.filter(t => t.id !== taskPayload.id);
      }
      return { ...node, tasks: updatedTasks };
    }));
  };

  const manageNote = (nodeId, action, notePayload) => {
    setRoadmapNodes(prev => prev.map(node => {
      if (node.id !== nodeId) return node;

      let updatedNotes = [...node.notes];
      if (action === 'add') {
        updatedNotes.push({
          id: `note-${Date.now()}`,
          text: notePayload.text,
          timestamp: Date.now()
        });
      } else if (action === 'delete') {
        updatedNotes = updatedNotes.filter(n => n.id !== notePayload.id);
      }
      return { ...node, notes: updatedNotes };
    }));
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

  const runAnalysis = async (startupDetailsArg, onboardingRoleArg) => {
    setIsAnalyzing(true);
    setAnalysisScores(null);
    setNewUserStatus(false);

    const details = startupDetailsArg || startupDetails;
    const role    = onboardingRoleArg  || onboardingRole;

    try {
      const userId = await getCurrentUserId();

      const payload = {
        full_name:                     role.fullName         || '',
        age:                           parseInt(role.age)    || 0,
        gender:                        role.gender           || '',
        city:                          role.city             || '',
        country:                       role.country          || '',
        profession:                    role.profession       || '',
        industry_experience:           role.experience       || '',
        founder_count:                 parseInt(role.founderCount) || 1,
        founder_skillset:              role.founderSkillset  || [],
        startup_name:                  details.startupName         || '',
        startup_domain:                details.startupDomain       || '',
        problem_statement:             details.problemStatement    || '',
        startup_description:           details.startupDescription  || '',
        target_audience:               details.targetAudience      || '',
        geographic_market:             details.geographicMarket    || '',
        existing_competitors:          details.existingCompetitors || '',
        revenue_model:                 details.revenueModel        || '',
        estimated_pricing:             details.estimatedPricing    || '',
        available_funding:             details.availableFunding    || '',
        monthly_burn_capacity:         details.monthlyBurnCapacity || '',
        platform_type:                 Array.isArray(details.platformType) ? details.platformType : [],
        technology_complexity:         details.techComplexity      || '',
        mvp_timeline:                  details.mvpTimeline         || '',
        scalability_goal:              details.scalabilityGoal     || '',
        customer_acquisition_strategy: details.acquisitionStrategy || '',
        current_startup_stage:         details.startupStage        || '',
        ...(userId && { user_id: userId }),
      };

      const result = await submitValidation(payload);

      if (result?.session_id) {
        localStorage.setItem('validation_session_id', result.session_id);
      }

      const ap = result?.analysis_phase_state || {};
      const scores = {
        feasibility:        _mapAgent(ap?.feasibility),
        marketDemand:       _mapAgent(ap?.market_opportunity),
        competitorPresence: _mapAgent(ap?.competition),
        riskLevel:          _mapAgent(ap?.risk),
        innovationLevel:    _mapAgent(ap?.innovation_usp),
        targetAudienceFit:  _mapAgent(ap?.feasibility),
        problemSolutionFit: _mapAgent(ap?.feasibility),
        revenuePotential:   _mapAgent(ap?.market_opportunity),
        scalability:        _mapAgent(ap?.feasibility),
      };

      setAnalysisScores(scores);
      setFullAnalysisData(result);
      return scores;
    } catch (err) {
      // Re-throw so AnalysisLoader can catch and show error UI
      throw err;
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Generate Roadmap from backend — only called when user explicitly requests it
  const generateRoadmap = async (team = []) => {
    const sessionId = localStorage.getItem('validation_session_id');
    if (!sessionId) {
      showToast('Run validation first to generate a roadmap.', 'error');
      return null;
    }
    setIsGeneratingRoadmap(true);
    try {
      const result = await submitRoadmap(sessionId, team);
      setRoadmapData(result);

      // Convert backend branches+tasks into ReactFlow-compatible nodes
      const nodes = _buildRoadmapNodes(result);
      setRoadmapNodes(nodes);
      localStorage.setItem('startup_roadmap', JSON.stringify(nodes));
      showToast('Roadmap generated successfully!', 'success');
      return result;
    } catch (err) {
      showToast(err.message || 'Roadmap generation failed.', 'error');
      return null;
    } finally {
      setIsGeneratingRoadmap(false);
    }
  };

  // Convert backend roadmap pipeline output → ReactFlow node tree format
  function _buildRoadmapNodes(result) {
    const branches = result?.branches || [];
    const nodes = [
      {
        id: 'root',
        parentId: null,
        title: result?.startup_name || startupDetails.startupName || 'Startup Launchpad',
        description: `${result?.business_type || ''} — ${result?.reasoning || ''}`.trim(),
        status: 'In Progress',
        priority: 'High',
        isExpanded: true,
        tasks: [],
        notes: [],
        recommendations: result?.reasoning || ''
      }
    ];

    branches.forEach((branch) => {
      const branchId = `branch-${branch.branch}`;
      nodes.push({
        id: branchId,
        parentId: 'root',
        title: branch.branch.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        description: branch.summary || '',
        status: branch.status === 'success' ? 'In Progress' : 'Pending',
        priority: 'Medium',
        isExpanded: true,
        tasks: (branch.tasks || []).map(t => ({
          id:          `task-${t.task_id || Math.random().toString(36).slice(2)}`,
          text:        `[${t.timeline || ''}] ${t.title}`.trim(),
          completed:   false,
          // rich backend fields
          priority:    t.priority   || '',
          assignedTo:  t.assigned_to || '',
          depStatus:   t.dep_status || 'Ready',
          description: t.description || '',
          timeline:    t.timeline   || '',
          blockedBy:   t.blocked_by || [],
        })),
        notes: [],
        recommendations: branch.summary || ''
      });
    });

    return nodes;
  }

  function _mapAgent(agent) {
    if (!agent) return { score: 0, status: 'Low', details: 'Data unavailable.' };
    const score = Math.round(agent.score || 0);
    const status = score >= 70 ? 'High' : score >= 45 ? 'Medium' : 'Low';
    return { score, status, details: agent.summary || agent.verdict || '' };
  }

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
        roadmapNodes,
        roadmapData,
        isGeneratingRoadmap,
        fullAnalysisData,

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
        setNewUserStatus,
        updateRoadmapNode,
        addRoadmapNode,
        deleteRoadmapNode,
        manageSubTask,
        manageNote,
        generateRoadmap
      }}
    >
      {children}
    </StartupContext.Provider>
  );
};

export default StartupContext;

