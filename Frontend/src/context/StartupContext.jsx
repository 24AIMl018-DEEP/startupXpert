import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
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

export const StartupProvider = ({ children }) => {
  const { showToast } = useToast();

  // 1. Auth state — restored from localStorage on refresh (auth only, not logic)
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('startup_user') || localStorage.getItem('startupxpert_user');
    const parsed = savedUser ? JSON.parse(savedUser) : null;
    if (parsed) {
      return parsed;
    }
    return { fullName: '', email: '', role: 'Founder', avatarUrl: '', isNewUser: false, onboardingCompleted: false };
  });

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });

  // On mount: if user is logged in but userId is missing from localStorage,
  // restore it from Supabase session so API calls work correctly
  useEffect(() => {
    if (isLoggedIn && !user?.userId) {
      import('../services/authService').then(({ getCurrentUserId }) => {
        getCurrentUserId().then(id => {
          if (id) {
            setUser(prev => {
              const updated = { ...prev, userId: id, onboardingCompleted: true };
              localStorage.setItem('startup_user', JSON.stringify(updated));
              localStorage.setItem('startupxpert_user', JSON.stringify(updated));
              return updated;
            });
          }
        });
      });
    }
  }, [isLoggedIn]);

  // ── Post-login DB restoration ──────────────────────────────────────────────
  // If sessionStorage was cleared (logout / new tab), fetch the latest
  // analysis from Supabase so Market / Competition / Risks / Intelligence /
  // Pitch tabs all show real data instead of "0 N/A".
  useEffect(() => {
    const uid = user?.userId;
    if (!isLoggedIn || !uid) return;
    if (analysisScores && fullAnalysisData) return; // already populated

    import('../services/startupApi').then(({ fetchLatestAnalysis }) => {
      fetchLatestAnalysis(uid)
        .then(data => {
          if (!data) return;
          if (!analysisScores)    setAnalysisScores(data.analysisScores);
          if (!fullAnalysisData)  setFullAnalysisData(data.fullAnalysisData);
          // Restore startupDetails so the hero header shows startup name / domain
          setStartupDetails(prev => {
            if (prev.startupName) return prev; // already set this session
            return data.startupDetails;
          });
        })
        .catch(err => console.warn('[Context] DB restore failed:', err.message));
    });
  }, [isLoggedIn, user?.userId]); // eslint-disable-line



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

  // Roadmap State — DB is the only source of truth, zero localStorage/sessionStorage
  const [roadmapNodes,       setRoadmapNodesRaw] = useState([]);
  const [roadmapData,        setRoadmapDataRaw]  = useState(null);
  const [allRoadmaps,        setAllRoadmaps]     = useState([]); // history list [{sessionId,startupName,domain,createdAt}]
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);

  // Simple wrappers (no storage side-effects)
  const setRoadmapNodesFromDB = (nodes) => setRoadmapNodesRaw(nodes);
  const setRoadmapNodes = (val) =>
    setRoadmapNodesRaw(prev => typeof val === 'function' ? val(prev) : val);

  // Auto-load: on login, fetch ALL user roadmaps list + latest roadmap nodes from DB
  useEffect(() => {
    const uid = user?.userId;
    if (!isLoggedIn || !uid) return;
    import('../services/startupApi').then(({ fetchAllUserRoadmaps, fetchSessionRoadmap }) => {
      fetchAllUserRoadmaps(uid).then(list => {
        setAllRoadmaps(list);
        if (list.length > 0 && roadmapNodes.length === 0) {
          // Load the latest one automatically
          fetchSessionRoadmap(list[0].sessionId).then(data => {
            if (data?.branches?.length > 0) {
              setRoadmapNodesRaw(_dbDataToNodes(data));
              setRoadmapDataRaw(data);
            }
          }).catch(() => {});
        }
      }).catch(() => {});
    });
  }, [isLoggedIn, user?.userId]); // eslint-disable-line

  // Helper: convert DB roadmap response → ReactFlow node array
  function _dbDataToNodes(data) {
    const nodes = [{
      id: 'root', parentId: null, branchDbId: null,
      title: data.profiler?.startup_name || 'Startup',
      description: data.profiler?.business_type || '',
      status: 'In Progress', priority: 'High', isExpanded: true, tasks: [], notes: [],
      recommendations: data.profiler?.reasoning || '',
    }];
    (data.branches || []).forEach(b => {
      nodes.push({
        id: `branch-${b.branch}`, parentId: 'root', branchDbId: b.id || null,
        title: b.branch.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        description: b.summary || '', status: 'In Progress', priority: 'Medium',
        isExpanded: true, recommendations: b.summary || '',
        tasks: (b.tasks || []).map((t, i) => ({
          id: t.task_id || `t-${i}`,
          dbTaskId: t.id || null,
          title: t.title || '',
          text: `[${t.timeline || ''}] ${t.title}`.trim(),
          completed: t.dep_status === 'Done' || t.completed === true,
          priority: t.priority || 'Medium',
          assignedTo: t.assigned_to || 'Unassigned',
          assigneeRole: t.assignee_role || '',
          assignedMemberId: t.assigned_member_id || null,
          complexity: t.complexity || 'Low',
          costImpact: t.cost_impact || 'None',
          depStatus: t.dep_status || 'Ready',
          description: t.description || '',
          timeline: t.timeline || '',
          blockedBy: t.blocked_by || [],
        })),
        notes: [],
      });
    });
    return nodes;
  }

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

  // 4. Onboarding Startup Details — persisted to sessionStorage
  const _detailsDefault = {
    startupName: '', startupDomain: '', problemStatement: '', startupDescription: '',
    targetAudience: '', geographicMarket: '', existingCompetitors: '', revenueModel: '',
    estimatedPricing: '', availableFunding: '', monthlyBurnCapacity: '', platformType: [],
    techComplexity: '', mvpTimeline: '', scalabilityGoal: '', acquisitionStrategy: '', startupStage: '',
  };
  const [startupDetails, setStartupDetailsRaw] = useState(() => {
    try { const s = sessionStorage.getItem('sx_startup_details'); return s ? { ..._detailsDefault, ...JSON.parse(s) } : _detailsDefault; } catch { return _detailsDefault; }
  });
  const setStartupDetails = (valOrFn) => {
    setStartupDetailsRaw(prev => {
      const next = typeof valOrFn === 'function' ? valOrFn(prev) : valOrFn;
      try { sessionStorage.setItem('sx_startup_details', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  // 5. Analysis Scores — persisted in sessionStorage (survives reload, cleared on tab close)
  const [analysisScores, setAnalysisScoresRaw] = useState(() => {
    try { const s = sessionStorage.getItem('sx_scores'); return s ? JSON.parse(s) : null; } catch { return null; }
  });
  const [fullAnalysisData, setFullAnalysisDataRaw] = useState(() => {
    try { const s = sessionStorage.getItem('sx_analysis'); return s ? JSON.parse(s) : null; } catch { return null; }
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Wrapped setters that also persist to sessionStorage
  const setAnalysisScores = (val) => {
    setAnalysisScoresRaw(val);
    try { if (val) sessionStorage.setItem('sx_scores', JSON.stringify(val)); else sessionStorage.removeItem('sx_scores'); } catch {}
  };
  const setFullAnalysisData = (val) => {
    setFullAnalysisDataRaw(val);
    try { if (val) sessionStorage.setItem('sx_analysis', JSON.stringify(val)); else sessionStorage.removeItem('sx_analysis'); } catch {}
  };

  // 6. History — loaded from DB after login, never from localStorage
  const [analysisHistory, setAnalysisHistory] = useState([]);

  const [loadingState, setLoadingState] = useState(false);
  const [errorState, setErrorState] = useState(null);
  const [currentStep, setCurrentStep] = useState(0); // Onboarding index (0 to 16)
  const [resumeState, setResumeState] = useState(false);

  // Check draft presence on mount (draft = only localStorage use)
  useEffect(() => {
    const savedUser = localStorage.getItem('startup_user') || localStorage.getItem('startupxpert_user');
    const parsedUser = savedUser ? JSON.parse(savedUser) : null;
    if (parsedUser?.email) {
      const savedDraft = localStorage.getItem(`startup_draft_${parsedUser.email}`);
      if (savedDraft) setResumeState(true);
    }
  }, []);

  // Track previous email to detect genuine account switches (not initial mount)
  const prevEmailRef = useRef(null);
  useEffect(() => {
    const prev = prevEmailRef.current;
    prevEmailRef.current = user?.email || null;
    // On initial mount, prev is null — don't wipe sessionStorage data
    if (prev === null) {
      if (user?.email) {
        const savedDraft = localStorage.getItem(`startup_draft_${user.email}`);
        setResumeState(!!savedDraft);
      }
      return;
    }
    // Genuine account switch — clear everything
    if (user?.email !== prev) {
      setRoadmapNodesRaw([]);
      setRoadmapDataRaw(null);
      setAnalysisHistory([]);
      try { sessionStorage.removeItem('sx_roadmap_nodes'); sessionStorage.removeItem('sx_roadmap_data'); sessionStorage.removeItem('sx_scores'); sessionStorage.removeItem('sx_analysis'); sessionStorage.removeItem('sx_startup_details'); } catch {}
      if (user?.email) {
        const savedDraft = localStorage.getItem(`startup_draft_${user.email}`);
        setResumeState(!!savedDraft);
      } else {
        setResumeState(false);
      }
    }
  }, [user?.email]);

  // Synchronous State Commit
  const loginUser = (email, password, name = 'Innovator', supabaseUserId = null, role = 'Founder', userType = 'solo', orgMode = null) => {
    const prevSavedUser = localStorage.getItem('startup_user');
    const prevUser = prevSavedUser ? JSON.parse(prevSavedUser) : null;

    const activeUser = {
      fullName:            name,
      email:               email,
      userId:              supabaseUserId || prevUser?.userId || null,
      role:                role,
      userType:            userType,
      orgMode:             orgMode,
      avatarUrl:           prevUser?.avatarUrl || '',
      isNewUser:           false,  // will be set by DB check in Login.jsx
      onboardingCompleted: false,  // will be set by DB check in Login.jsx
    };
    setUser(activeUser);
    setIsLoggedIn(true);
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('startup_user', JSON.stringify(activeUser));
    localStorage.setItem('startupxpert_user', JSON.stringify(activeUser));
  };

  const registerUser = (fullName, email, role, supabaseUserId = null, meta = {}) => {
    const activeUser = {
      fullName, email,
      userId:              supabaseUserId,
      role,
      userType:            meta.userType || 'solo',   // 'solo' | 'org'
      orgMode:             meta.orgMode  || null,      // 'create' | 'join'
      avatarUrl:           '',
      isNewUser:           true,
      onboardingCompleted: false,
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
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('startup_user');
    localStorage.removeItem('startupxpert_user');
    // Clear draft on logout
    if (user?.email) {
      localStorage.removeItem(`startup_draft_${user.email}`);
    }
    setRoadmapNodesRaw([]);
    setRoadmapDataRaw(null);
    setAnalysisScoresRaw(null);
    setFullAnalysisDataRaw(null);
    setAnalysisHistory([]);
    try {
      sessionStorage.removeItem('analysis_scores');
      sessionStorage.removeItem('full_analysis_data');
      sessionStorage.removeItem('roadmap_nodes');
      sessionStorage.removeItem('roadmap_data');
    } catch {}
    setResumeState(false);
    try { sessionStorage.removeItem('sx_roadmap_nodes'); sessionStorage.removeItem('sx_roadmap_data'); sessionStorage.removeItem('sx_scores'); sessionStorage.removeItem('sx_analysis'); sessionStorage.removeItem('sx_startup_details'); } catch {}
    setOnboardingRole({ fullName: '', age: '', gender: '', city: '', country: '', profession: '', experience: '', founderCount: '', founderSkillset: [] });
    setStartupDetails({ startupName: '', startupDomain: '', problemStatement: '', startupDescription: '', targetAudience: '', geographicMarket: '', existingCompetitors: '', revenueModel: '', estimatedPricing: '', availableFunding: '', monthlyBurnCapacity: '', platformType: [], techComplexity: '', mvpTimeline: '', scalabilityGoal: '', acquisitionStrategy: '', startupStage: '' });
    setUser({ fullName: '', email: '', role: 'Founder', avatarUrl: '' });
    showToast('Logged out successfully.', 'info');
  };

  const setUserInfo = (userInfo) => {
    setUser(userInfo);
    localStorage.setItem('startup_user', JSON.stringify(userInfo));
    localStorage.setItem('startupxpert_user', JSON.stringify(userInfo));
  };

  // Sync Active Theme Class to DOM (dark/light + theme variant)
  useEffect(() => {
    const activeTheme = settings.theme || 'Dark Futurism';
    const isLight     = settings.themeMode === 'Light';

    // Remove all theme/mode classes
    document.body.classList.remove(
      'theme-dark-futurism', 'theme-midnight-blue', 'theme-neo-emerald', 'light-mode'
    );
    document.documentElement.removeAttribute('data-theme');

    // Add theme class
    if (activeTheme === 'Midnight Blue') {
      document.body.classList.add('theme-midnight-blue');
    } else if (activeTheme === 'Neo Emerald') {
      document.body.classList.add('theme-neo-emerald');
    } else {
      document.body.classList.add('theme-dark-futurism');
    }

    // Add light mode class
    if (isLight) {
      document.body.classList.add('light-mode');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, [settings.theme, settings.themeMode]);

  const setNewUserStatus = (status) => {
    setUser(prev => {
      const updated = { ...prev, isNewUser: status };
      localStorage.setItem('startup_user', JSON.stringify(updated));
      localStorage.setItem('startupxpert_user', JSON.stringify(updated));
      return updated;
    });
  };

  const saveSettings = (newSettings) => {
    // Apply settings immediately so theme/mode changes take effect at once.
    // A brief loading indicator is still shown for user feedback.
    setSettings(newSettings);
    localStorage.setItem('startup_settings', JSON.stringify(newSettings));
    setLoadingState(true);
    setTimeout(() => {
      setLoadingState(false);
      showToast('Settings saved successfully!', 'success');
    }, 600);
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
    // History stored in memory only — DB is source of truth
    // Dashboard loads history from DB via fetchUserSessions
    const updated = [entry, ...analysisHistory];
    setAnalysisHistory(updated);
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
          day: '2-digit', month: 'short', year: 'numeric',
          hour: '2-digit', minute: '2-digit'
        }),
        scores: activeScores,
        risk:    activeScores.riskLevel?.status    || 'Medium',
        status:  activeScores.feasibility?.status  || 'High',
        summary: activeScores.marketDemand?.details || 'Feasibility analysis report compiled.'
      };

      appendHistory(newHistoryEntry);
      clearDraft();

      // Update auth state — onboardingCompleted flag in localStorage (auth only, not logic)
      setUser(prev => {
        const updated = { ...prev, onboardingCompleted: true, isNewUser: false };
        localStorage.setItem('startup_user', JSON.stringify(updated));
        localStorage.setItem('startupxpert_user', JSON.stringify(updated));
        return updated;
      });

      setLoadingState(false);
      showToast('Analysis saved! Onboarding complete.', 'success');
    }, 1000);
  };

  const updateRoadmapNode = (id, updatedFields) => {
    setRoadmapNodesRaw(prev => prev.map(node => node.id === id ? { ...node, ...updatedFields } : node));
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
        const dbId = taskPayload.dbTaskId || node.tasks?.find(t => t.id === taskPayload.id)?.dbTaskId;
        updatedTasks = updatedTasks.filter(t => t.id !== taskPayload.id);
        if (dbId) {
          import('../services/startupApi').then(({ deleteTask }) => {
            deleteTask(dbId).catch(err => console.warn('[RoadmapSync] task deletion failed:', err.message));
          });
        }
      } else if (action === 'updateField') {
        // Used for inline field edits (priority, assigned_to, etc.)
        updatedTasks = updatedTasks.map(t => {
          if (t.id !== taskPayload.id) return t;
          const updated = { ...t, ...taskPayload.fields };
          if (t.dbTaskId && taskPayload.fields) {
            // Map frontend field names to DB column names
            const dbFields = {};
            if (taskPayload.fields.title       !== undefined) dbFields.title       = taskPayload.fields.title;
            if (taskPayload.fields.description !== undefined) dbFields.description = taskPayload.fields.description;
            if (taskPayload.fields.timeline    !== undefined) dbFields.timeline    = taskPayload.fields.timeline;
            if (taskPayload.fields.priority    !== undefined) dbFields.priority    = taskPayload.fields.priority;
            if (taskPayload.fields.assignedTo  !== undefined) dbFields.assigned_to = taskPayload.fields.assignedTo;
            if (taskPayload.fields.assigned_member_id !== undefined) dbFields.assigned_member_id = taskPayload.fields.assigned_member_id;
            if (taskPayload.fields.assignee_role !== undefined) dbFields.assignee_role = taskPayload.fields.assignee_role;
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
    // Remove from in-memory state only — DB deletion not implemented yet
    setAnalysisHistory(prev => prev.filter(item => item.id !== id));
    showToast('Analysis entry removed from view.', 'info');
  };

  const clearHistory = () => {
    setAnalysisHistory([]);
    showToast('All analysis records cleared from view.', 'info');
  };

  const runAnalysis = async (startupDetailsArg, onboardingRoleArg) => {
    setIsAnalyzing(true);
    setAnalysisScores(null);
    setNewUserStatus(false);

    const details = startupDetailsArg || startupDetails;
    const role    = onboardingRoleArg  || onboardingRole;

    try {
      // Use stored userId from context first (already verified at login)
      // getCurrentUserId() is async and may return null if session not yet restored
      const userId = user?.userId || await getCurrentUserId();
      
      if (!userId) {
        throw new Error('User not authenticated. Please log in again before validating.');
      }

      const payload = {
        user_id:                       userId,
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
        customer_acquisition_strategy: Array.isArray(details.acquisitionStrategy)
          ? details.acquisitionStrategy.join(', ')
          : (details.acquisitionStrategy || ''),
        current_startup_stage:         details.startupStage        || '',
      };

      const result = await submitValidation(payload);


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

      setAnalysisScores(scores);     // persists to sx_scores via setter
      setFullAnalysisData(result);    // persists to sx_analysis via setter
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
      if (user?.userId) {
        try {
          const { checkUserHasValidation } = await import('../services/startupApi');
          const { hasValidation, sessionId: sid } = await checkUserHasValidation(user.userId);
          if (hasValidation && sid) { sessionId = sid; }
        } catch (e) { console.warn('[Roadmap] session check failed:', e.message); }
      }
      if (!sessionId) {
        showToast('No validated session found. Please validate your idea first.', 'error');
        return null;
      }

      // Map names to member IDs
      let enrichedTeam = [...team];
      if (user?.userId) {
        try {
          const { getMyOrganization } = await import('../services/startupApi');
          const orgData = await getMyOrganization(user.userId);
          if (orgData && orgData.members) {
            const memberMap = {};
            orgData.members.forEach(m => {
              if (m.full_name) {
                memberMap[m.full_name.toLowerCase().trim()] = m.id;
              }
            });
            enrichedTeam = team.map(m => {
              const nameKey = m.name ? m.name.toLowerCase().trim() : '';
              return {
                ...m,
                id: memberMap[nameKey] || m.id || null
              };
            });
          }
        } catch (e) {
          console.warn('[Roadmap] org member mapping failed:', e.message);
        }
      }

      let result = null;
      try {
        result = await submitRoadmap(sessionId, enrichedTeam);
      } catch (apiErr) {
        const isTimeout = apiErr.message === 'ROADMAP_TIMEOUT';
        if (isTimeout) {
          showToast('Generation is taking longer… polling DB for result.', 'info');
          for (let i = 0; i < 18; i++) {
            await new Promise(r => setTimeout(r, 10_000));
            try {
              const { fetchSessionRoadmap } = await import('../services/startupApi');
              const dbRoadmap = await fetchSessionRoadmap(sessionId);
              if (dbRoadmap?.branches?.length > 0) {
                setRoadmapNodesRaw(_dbDataToNodes(dbRoadmap));
                setRoadmapDataRaw(dbRoadmap);
                await _refreshAllRoadmaps();
                showToast('Roadmap generated successfully!', 'success');
                return dbRoadmap;
              }
            } catch { /* keep polling */ }
          }
          throw new Error('Roadmap generation timed out. Please try again.');
        }
        // Non-timeout failure — try loading existing roadmap from DB
        try {
          const { fetchSessionRoadmap } = await import('../services/startupApi');
          const dbRoadmap = await fetchSessionRoadmap(sessionId);
          if (dbRoadmap?.branches?.length > 0) {
            setRoadmapNodesRaw(_dbDataToNodes(dbRoadmap));
            setRoadmapDataRaw(dbRoadmap);
            await _refreshAllRoadmaps();
            showToast('Loaded your previously generated roadmap.', 'info');
            return dbRoadmap;
          }
        } catch { /* ignore */ }
        throw apiErr;
      }

      const nodes = _buildRoadmapNodes(result);
      setRoadmapNodesRaw(nodes);
      setRoadmapDataRaw(result);
      await _refreshAllRoadmaps();
      showToast('Roadmap generated successfully!', 'success');
      return result;
    } catch (err) {
      showToast(`Roadmap generation failed: ${err.message || 'Unknown error'}`, 'error');
      return null;
    } finally {
      setIsGeneratingRoadmap(false);
    }
  };

  async function _refreshAllRoadmaps() {
    if (!user?.userId) return;
    try {
      const { fetchAllUserRoadmaps } = await import('../services/startupApi');
      const list = await fetchAllUserRoadmaps(user.userId);
      setAllRoadmaps(list);
    } catch { /* ignore */ }
  }

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
        tasks: tasksToMap.map((t, idx) => ({
          id:           t.task_id || `task-${idx}-${Math.random().toString(36).slice(2)}`,
          dbTaskId:     t.db_id || t.id || null,         // DB uuid from roadmap_tasks
          title:        t.title || '',
          text:         `[${t.timeline || ''}] ${t.title}`.trim(),
          completed:    t.status === 'Done' || t.dep_status === 'Done' || t.completed === true,
          priority:     t.priority     || 'Medium',
          assignedTo:   t.assigned_to  || 'Unassigned',
          assigneeRole: t.assignee_role || '',
          assignedMemberId: t.assigned_member_id || null,
          complexity:   t.complexity   || 'Low',
          costImpact:   t.cost_impact  || 'None',
          depStatus:    t.status || t.dep_status || 'Ready',
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
    totalStartups:     analysisHistory.length,
    completedAnalysis: analysisHistory.filter(h => h.isValidated || h.scores).length,
    savedDraftCount:   resumeState ? 1 : 0,
    roadmapProgress:   roadmapNodes.filter(n => n.parentId === 'root').length > 0
      ? `${roadmapNodes.filter(n => n.tasks?.some(t => t.completed)).length} / ${roadmapNodes.filter(n => n.parentId === 'root').length}`
      : '0 / 0',
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
        allRoadmaps,
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
        setAnalysisHistory,
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
        generateRoadmap,
        setRoadmapNodesFromDB,
        loadRoadmapBySession: async (sessionId) => {
          const { fetchSessionRoadmap } = await import('../services/startupApi');
          const data = await fetchSessionRoadmap(sessionId);
          if (data?.branches?.length > 0) {
            setRoadmapNodesRaw(_dbDataToNodes(data));
            setRoadmapDataRaw(data);
          }
        },
      }}
    >
      {children}
    </StartupContext.Provider>
  );
};

export default StartupContext;

