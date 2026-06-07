import React, { createContext, useState, useContext, useEffect } from 'react';
import { useToast } from './ToastContext';
import { submitValidation, submitRoadmap, patchBranch, patchTask } from '../services/startupApi';
import { getCurrentUserId } from '../services/authService';

const StartupContext = createContext(null);

export const useStartup = () => {
  const context = useContext(StartupContext);
  if (!context) {
    throw new Error('useStartup must be used within a StartupProvider');
  }
  return context;
};

// Migration utility helper for localStorage legacy keys to scoped keys
const migrateLegacyData = (email) => {
  if (!email) return;
  const keys = ['startup_history', 'startup_roadmap', 'validation_session_id', 'startup_draft'];
  keys.forEach(key => {
    const legacyValue = localStorage.getItem(key);
    const scopedKey = `${key}_${email}`;
    const scopedValue = localStorage.getItem(scopedKey);
    if (legacyValue && !scopedValue) {
      localStorage.setItem(scopedKey, legacyValue);
      console.log(`Migrated legacy key: ${key} to ${scopedKey}`);
    }
  });
};

export const StartupProvider = ({ children }) => {
  const { showToast } = useToast();

  // 1. Authentication & User Profile States (persisted under startup_user & startupxpert_user)
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('startup_user') || localStorage.getItem('startupxpert_user');
    const parsed = savedUser ? JSON.parse(savedUser) : null;
    if (parsed) {
      if (parsed.email) {
        migrateLegacyData(parsed.email);
      }
      if (parsed.onboardingCompleted === undefined) {
        const savedHistory = localStorage.getItem(`startup_history_${parsed.email}`) || localStorage.getItem('startup_history');
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
    const savedUser = localStorage.getItem('startup_user') || localStorage.getItem('startupxpert_user');
    const parsedUser = savedUser ? JSON.parse(savedUser) : null;
    if (parsedUser && parsedUser.email) {
      migrateLegacyData(parsedUser.email);
      const saved = localStorage.getItem(`startup_roadmap_${parsedUser.email}`);
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [roadmapData, setRoadmapData]   = useState(() => {
    // Restore full roadmap backend response from localStorage on mount
    const savedUser = localStorage.getItem('startup_user') || localStorage.getItem('startupxpert_user');
    const parsedUser = savedUser ? JSON.parse(savedUser) : null;
    if (parsedUser?.email) {
      const saved = localStorage.getItem(`startup_roadmap_data_${parsedUser.email}`);
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  });  // full backend roadmap response
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);

  // Auto-save roadmap to localStorage
  useEffect(() => {
    if (user?.email) {
      if (roadmapNodes.length > 0) {
        localStorage.setItem(`startup_roadmap_${user.email}`, JSON.stringify(roadmapNodes));
      } else {
        localStorage.removeItem(`startup_roadmap_${user.email}`);
      }
    }
  }, [roadmapNodes, user?.email]);

  // Auto-save full roadmap data response to localStorage
  useEffect(() => {
    if (user?.email) {
      if (roadmapData) {
        localStorage.setItem(`startup_roadmap_data_${user.email}`, JSON.stringify(roadmapData));
      } else {
        localStorage.removeItem(`startup_roadmap_data_${user.email}`);
      }
    }
  }, [roadmapData, user?.email]);

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
    const savedUser = localStorage.getItem('startup_user') || localStorage.getItem('startupxpert_user');
    const parsedUser = savedUser ? JSON.parse(savedUser) : null;
    if (parsedUser && parsedUser.email) {
      migrateLegacyData(parsedUser.email);
      const savedHistory = localStorage.getItem(`startup_history_${parsedUser.email}`);
      return savedHistory ? JSON.parse(savedHistory) : [];
    }
    return [];
  });

  const [loadingState, setLoadingState] = useState(false);
  const [errorState, setErrorState] = useState(null);
  const [currentStep, setCurrentStep] = useState(0); // Onboarding index (0 to 16)
  const [resumeState, setResumeState] = useState(false);

  // Check draft presence on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('startup_user') || localStorage.getItem('startupxpert_user');
    const parsedUser = savedUser ? JSON.parse(savedUser) : null;
    if (parsedUser && parsedUser.email) {
      migrateLegacyData(parsedUser.email);
      const savedDraft = localStorage.getItem(`startup_draft_${parsedUser.email}`);
      if (savedDraft) {
        setResumeState(true);
      }
    }
  }, []);

  // Synchronize user-specific state when user logs in/switches/logs out
  useEffect(() => {
    if (user && user.email) {
      migrateLegacyData(user.email);

      const savedHistory = localStorage.getItem(`startup_history_${user.email}`);
      setAnalysisHistory(savedHistory ? JSON.parse(savedHistory) : []);

      const savedRoadmap = localStorage.getItem(`startup_roadmap_${user.email}`);
      setRoadmapNodes(savedRoadmap ? JSON.parse(savedRoadmap) : []);

      const savedDraft = localStorage.getItem(`startup_draft_${user.email}`);
      setResumeState(!!savedDraft);
    } else {
      setAnalysisHistory([]);
      setRoadmapNodes([]);
      setResumeState(false);
    }
  }, [user?.email]);

  // Synchronous State Commit
  const loginUser = (email, password, name = 'Innovator', supabaseUserId = null) => {
    migrateLegacyData(email);
    const savedHistory = localStorage.getItem(`startup_history_${email}`);
    const hasHistory = savedHistory ? JSON.parse(savedHistory).length > 0 : false;

    // Check if onboarding was previously completed for this email
    const prevSavedUser = localStorage.getItem(`startup_user_${email}`) || localStorage.getItem('startup_user');
    const prevUser = prevSavedUser ? JSON.parse(prevSavedUser) : null;
    const wasOnboardingCompleted =
      (prevUser && prevUser.email === email && prevUser.onboardingCompleted === true) ||
      hasHistory;

    const activeUser = {
      fullName:           name,
      email:              email,
      userId:             supabaseUserId || prevUser?.userId || null,  // store Supabase UUID
      role:               'Founder',
      avatarUrl:          prevUser?.avatarUrl || '',
      isNewUser:          !wasOnboardingCompleted,
      onboardingCompleted: wasOnboardingCompleted,
    };
    setUser(activeUser);
    setIsLoggedIn(true);
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('startup_user', JSON.stringify(activeUser));
    localStorage.setItem('startupxpert_user', JSON.stringify(activeUser));
    localStorage.setItem(`startup_user_${email}`, JSON.stringify(activeUser));
  };

  const registerUser = (fullName, email, role, supabaseUserId = null) => {
    migrateLegacyData(email);
    const activeUser = {
      fullName,
      email,
      userId:             supabaseUserId,   // store Supabase UUID from registration
      role,
      avatarUrl:          '',
      isNewUser:          true,
      onboardingCompleted: false,           // new user must complete onboarding
    };
    setUser(activeUser);
    setIsLoggedIn(true);
    setOnboardingRole(prev => ({ ...prev, fullName }));
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('startup_user', JSON.stringify(activeUser));
    localStorage.setItem('startupxpert_user', JSON.stringify(activeUser));
    localStorage.setItem(`startup_user_${email}`, JSON.stringify(activeUser));
  };


  const logoutUser = () => {
    setIsLoggedIn(false);

    // Purge localStorage keys explicitly as requested
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('startup_user');
    localStorage.removeItem('startupxpert_user');
    localStorage.removeItem('startup_roadmap');
    if (user?.email) {
      localStorage.removeItem(`startup_roadmap_data_${user.email}`);
    }

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
    
    // Set user to empty at the end to trigger sync and clean states
    setUser({ fullName: '', email: '', role: 'Founder', avatarUrl: '' });
    
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
    if (!user?.email) return;
    const draftPayload = {
      onboardingRole,
      startupDetails: currentDetails,
      currentStep,
      timestamp: Date.now()
    };
    localStorage.setItem(`startup_draft_${user.email}`, JSON.stringify(draftPayload));
  };

  const saveDraft = (stepIndex, activeDetails) => {
    if (!user?.email) return;
    setLoadingState(true);
    setTimeout(() => {
      const draftPayload = {
        onboardingRole,
        startupDetails: activeDetails || startupDetails,
        currentStep: stepIndex !== undefined ? stepIndex : currentStep,
        timestamp: Date.now()
      };
      localStorage.setItem(`startup_draft_${user.email}`, JSON.stringify(draftPayload));
      setResumeState(true);
      setLoadingState(false);
      showToast('Startup draft auto-saved successfully!', 'success');
    }, 800);
  };

  const restoreDraft = () => {
    if (!user?.email) return null;
    const savedDraft = localStorage.getItem(`startup_draft_${user.email}`);
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
    if (user?.email) {
      localStorage.removeItem(`startup_draft_${user.email}`);
    }
    setResumeState(false);
    setCurrentStep(0);
  };

  // History & score archiving operations
  const appendHistory = (entry) => {
    if (!user?.email) return;
    const updated = [entry, ...analysisHistory];
    setAnalysisHistory(updated);
    localStorage.setItem(`startup_history_${user.email}`, JSON.stringify(updated));
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

      // Update onboarding status to completed — preserve userId
      setUser(prev => {
        const updated = { ...prev, onboardingCompleted: true, isNewUser: false };
        localStorage.setItem('startup_user', JSON.stringify(updated));
        localStorage.setItem('startupxpert_user', JSON.stringify(updated));
        if (prev.email) {
          localStorage.setItem(`startup_user_${prev.email}`, JSON.stringify(updated));
        }
        return updated;
      });

      setLoadingState(false);
      showToast('Feasibility analysis archived successfully! Onboarding complete.', 'success');
    }, 1000);
  };

  const updateRoadmapNode = (id, updatedFields) => {
    setRoadmapNodes(prev => prev.map(node => node.id === id ? { ...node, ...updatedFields } : node));

    // Sync branch-level edits to Supabase if node has a DB id (branch-*)
    // branchDbId is stored on the node when roadmap is built from backend
    const node = roadmapNodes.find(n => n.id === id);
    if (!node) return;

    // Sync branch status/summary changes
    if (node.branchDbId && (updatedFields.status !== undefined || updatedFields.summary !== undefined)) {
      const fields = {};
      if (updatedFields.status  !== undefined) fields.status  = updatedFields.status;
      if (updatedFields.summary !== undefined) fields.summary = updatedFields.summary;
      patchBranch(node.branchDbId, fields).catch(err =>
        console.warn('[RoadmapSync] branch patch failed:', err.message)
      );
    }
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
        updatedTasks = updatedTasks.map(t => {
          if (t.id !== taskPayload.id) return t;
          const updated = { ...t, completed: !t.completed };
          // Sync dep_status change to DB if task has a real DB id
          if (t.dbTaskId) {
            patchTask(t.dbTaskId, {
              dep_status: updated.completed ? 'Ready' : (t.depStatus || 'Ready')
            }).catch(err => console.warn('[RoadmapSync] task toggle failed:', err.message));
          }
          return updated;
        });
      } else if (action === 'delete') {
        updatedTasks = updatedTasks.filter(t => t.id !== taskPayload.id);
      } else if (action === 'updateField') {
        // Used for inline field edits (priority, assigned_to, etc.)
        updatedTasks = updatedTasks.map(t => {
          if (t.id !== taskPayload.id) return t;
          const updated = { ...t, ...taskPayload.fields };
          if (t.dbTaskId && taskPayload.fields) {
            // Map frontend field names to DB column names
            const dbFields = {};
            if (taskPayload.fields.priority    !== undefined) dbFields.priority    = taskPayload.fields.priority;
            if (taskPayload.fields.assignedTo  !== undefined) dbFields.assigned_to = taskPayload.fields.assignedTo;
            if (taskPayload.fields.depStatus   !== undefined) dbFields.dep_status  = taskPayload.fields.depStatus;
            if (taskPayload.fields.complexity  !== undefined) dbFields.complexity  = taskPayload.fields.complexity;
            if (taskPayload.fields.costImpact  !== undefined) dbFields.cost_impact = taskPayload.fields.costImpact;
            if (Object.keys(dbFields).length > 0) {
              patchTask(t.dbTaskId, dbFields).catch(err =>
                console.warn('[RoadmapSync] task field update failed:', err.message)
              );
            }
          }
          return updated;
        });
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
    if (!user?.email) return;
    setLoadingState(true);
    setTimeout(() => {
      const updated = analysisHistory.filter((item) => item.id !== id);
      setAnalysisHistory(updated);
      localStorage.setItem(`startup_history_${user.email}`, JSON.stringify(updated));
      setLoadingState(false);
      showToast('Analysis entry deleted from history.', 'info');
    }, 600);
  };

  const clearHistory = () => {
    if (!user?.email) return;
    setLoadingState(true);
    setTimeout(() => {
      setAnalysisHistory([]);
      localStorage.removeItem(`startup_history_${user.email}`);
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
        user_id:                       userId || user?.userId || null,
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
      };

      const result = await submitValidation(payload);

      if (result?.session_id && user?.email) {
        localStorage.setItem(`validation_session_id_${user.email}`, result.session_id);
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

  // Generate Roadmap from backend — always uses latest validated session from DB
  const generateRoadmap = async (team = []) => {
    if (!user?.email) return null;

    setIsGeneratingRoadmap(true);
    try {
      let sessionId = null;

      // Step 1: Try to get the latest validated session from DB using user's Supabase UUID
      if (user?.userId) {
        try {
          const { fetchLatestValidatedSession } = await import('../services/startupApi');
          const latest = await fetchLatestValidatedSession(user.userId);
          if (latest?.id) {
            sessionId = latest.id;
            // Keep localStorage in sync
            localStorage.setItem(`validation_session_id_${user.email}`, sessionId);
            console.log(`[Roadmap] Using latest DB session: ${sessionId} (${latest.startup_name})`);
          }
        } catch (e) {
          console.warn('[Roadmap] DB session fetch failed, falling back to localStorage:', e.message);
        }
      }

      // Step 2: Fall back to localStorage if DB fetch failed
      if (!sessionId) {
        sessionId = localStorage.getItem(`validation_session_id_${user.email}`)
          || localStorage.getItem('validation_session_id');
      }

      if (!sessionId) {
        showToast('Validate your idea first before generating a roadmap.', 'error');
        return null;
      }

      const result = await submitRoadmap(sessionId, team);
      setRoadmapData(result);
      const nodes = _buildRoadmapNodes(result);
      setRoadmapNodes(nodes);
      localStorage.setItem(`startup_roadmap_${user.email}`, JSON.stringify(nodes));
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
    const branches    = result?.branch_roadmaps || result?.branches || [];
    const syncedTasks = result?.synced_tasks    || [];

    const nodes = [
      {
        id:              'root',
        parentId:        null,
        branchDbId:      null,
        title:           result?.startup_name || startupDetails.startupName || 'Startup Launchpad',
        description:     `${result?.profiler_output?.business_type || ''} — ${result?.profiler_output?.reasoning || ''}`.trim(),
        status:          'In Progress',
        priority:        'High',
        isExpanded:      true,
        tasks:           [],
        notes:           [],
        recommendations: result?.profiler_output?.reasoning || '',
      }
    ];

    branches.forEach((branch) => {
      const branchId   = `branch-${branch.branch}`;
      const branchTasks = syncedTasks.filter(t => t.branch === branch.branch);
      const tasksToMap  = branchTasks.length > 0 ? branchTasks : (branch.tasks || []);

      nodes.push({
        id:              branchId,
        parentId:        'root',
        branchDbId:      branch.db_id || null,   // DB uuid from roadmap_branches
        title:           branch.branch.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        description:     branch.summary || '',
        status:          branch.status === 'success' ? 'In Progress' : 'Pending',
        priority:        'Medium',
        isExpanded:      true,
        tasks: tasksToMap.map(t => ({
          id:           t.task_id || `task-${Math.random().toString(36).slice(2)}`,
          dbTaskId:     t.db_id   || null,         // DB uuid from roadmap_tasks
          text:         `[${t.timeline || ''}] ${t.title}`.trim(),
          completed:    false,
          priority:     t.priority     || 'Medium',
          assignedTo:   t.assigned_to  || 'Unassigned',
          assigneeRole: t.assignee_role || '',
          complexity:   t.complexity   || 'Low',
          costImpact:   t.cost_impact  || 'None',
          depStatus:    t.status       || 'Ready',
          description:  t.description  || '',
          timeline:     t.timeline     || '',
          blockedBy:    t.blocked_by   || [],
        })),
        notes:           [],
        recommendations: branch.summary || '',
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

