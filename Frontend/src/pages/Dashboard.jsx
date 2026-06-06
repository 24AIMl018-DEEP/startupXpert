import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStartup } from '../context/StartupContext';
import { useToast } from '../context/ToastContext';
import Sidebar from '../components/Sidebar';
import { 
  Sparkles, 
  Layers, 
  FileText, 
  Compass, 
  ArrowUpRight, 
  Clock, 
  Plus, 
  Trash2,
  Play,
  Briefcase,
  TrendingUp,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  Gauge,
  Construction,
  WrenchIcon
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  
  const { 
    user, 
    startupDetails, 
    analysisScores,
    dashboardStats, 
    analysisHistory,
    resumeState,
    restoreDraft,
    setAnalysisScores,
    setStartupInfo,
    deleteHistoryItem,
    setNewUserStatus
  } = useStartup();

  const [activeTab, setActiveTab] = useState(() => {
    return location.state?.activeTab || 'overview';
  });

  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

  useEffect(() => {
    if (activeTab === 'roadmap') {
      setActiveTab('overview');
      navigate('/roadmap');
    }
  }, [activeTab, navigate]);

  // Verify if a verified startup exists in current session context
  const hasValidatedStartup = !!startupDetails.startupName;

  // Handle Quick Resume Draft Click (Micro Patch 4)
  const handleQuickResume = () => {
    const restored = restoreDraft();
    if (restored) {
      navigate('/onboarding/details');
    }
  };

  // View Previous Analysis Item
  const handleViewAnalysis = (item) => {
    setAnalysisScores(item.scores);
    // Restore actual startup details saved at analysis time
    if (item.startupDetails) {
      setStartupInfo(item.startupDetails);
    }
    showToast(`Loading analysis for "${item.startupName}"`, 'success');
    navigate('/analysis/result');
  };

  // Delete History Item (Micro Patch 3)
  const handleDeleteHistory = (e, id) => {
    e.stopPropagation(); // prevent card click
    deleteHistoryItem(id);
  };

return (
    <div className="relative min-h-screen bg-[#0a0a0f] flex text-white overflow-hidden">
      
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Board Content */}
      <main className="flex-grow p-8 overflow-y-auto max-h-screen" role="main" aria-label="Dashboard Workspace Overview">
        <div className="max-w-6xl mx-auto space-y-8 animate-[fadeIn_0.3s_ease-out]">
          
          {/* Dashboard Header Bar or New User Onboarding Banner */}
          {user.isNewUser ? (
            <div className="relative rounded-2xl border border-indigo-500/15 bg-indigo-950/15 p-8 text-left backdrop-blur-md overflow-hidden space-y-6 shadow-[0_0_35px_rgba(99,102,241,0.08)]">
              <div className="absolute -right-24 -top-24 h-48 w-48 rounded-full bg-indigo-500/10 blur-2xl"></div>
              
              <div className="space-y-2 max-w-2xl">
                <h2 className="font-heading text-2xl font-bold text-white">
                  Welcome to StartupXpert, {user.fullName?.split(' ')[0] || 'Founder'} 👋
                </h2>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Your account is ready. When you're set, validate your startup idea — our AI will stress-test it across 250+ market parameters.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-start gap-3 pt-1">
                <button
                  onClick={() => {
                    setNewUserStatus(false);
                    navigate('/onboarding/role');
                  }}
                  className="group flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-500 transition-all duration-200 hover:shadow-[0_0_20px_rgba(99,102,241,0.3)]">
                  <Plus className="h-4 w-4" />
                  Validate My First Idea
                </button>
                <button
                  onClick={() => setNewUserStatus(false)}
                  className="text-sm font-medium text-gray-500 hover:text-white transition-colors py-3"
                >
                  Explore dashboard first →
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-500/5 pb-6 text-left">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">V1.0.0 Stable Release</span>
                <h1 className="font-heading text-3xl font-extrabold text-white mt-1">
                  Welcome back, {user.fullName || 'Innovator'}
                </h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  Here is your venture portfolio status and market validation updates.
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate('/onboarding/role')}
                  className="group flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4.5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-indigo-600/10 hover:bg-indigo-500 hover:shadow-indigo-600/20 hover:scale-[1.02] transition-all duration-300 focus:ring-2 focus:ring-indigo-500"
                  aria-label="Validate New Idea"
                >
                  <Plus className="h-4 w-4" />
                  Validate New Idea
                </button>
              </div>
            </div>
          )}

          {/* TAB CONTENTS */}

          {/* 1. OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              
              {/* Statistic Summary Cards */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
                
                {/* Card 1: Total Startups */}
                <div className="relative rounded-2xl border border-indigo-500/10 bg-[#0e0e16]/60 p-6 backdrop-blur-md overflow-hidden hover:border-indigo-500/30 transition-all duration-300">
                  <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-indigo-500/5 blur-xl"></div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-indigo-500/20 bg-indigo-500/5 text-indigo-400">
                      <Briefcase className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500">Total Startups</span>
                  </div>
                  <p className="mt-4 font-heading text-3xl font-black text-white">
                    {dashboardStats.totalStartups}
                  </p>
                  <p className="text-[10px] text-indigo-400 font-semibold mt-1">Venture index profiles registered</p>
                </div>

                {/* Card 2: Completed Analysis */}
                <div className="relative rounded-2xl border border-indigo-500/10 bg-[#0e0e16]/60 p-6 backdrop-blur-md overflow-hidden hover:border-indigo-500/30 transition-all duration-300">
                  <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-emerald-500/5 blur-xl"></div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-emerald-500/20 bg-[#0a0a0f] text-emerald-400">
                      <Layers className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500">Analysis Done</span>
                  </div>
                  <p className="mt-4 font-heading text-3xl font-black text-white">
                    {dashboardStats.completedAnalysis}
                  </p>
                  <p className="text-[10px] text-emerald-400 font-semibold mt-1">Stress-tests fully compiled</p>
                </div>

                {/* Card 3: Saved Draft Count */}
                <div className="relative rounded-2xl border border-indigo-500/10 bg-[#0e0e16]/60 p-6 backdrop-blur-md overflow-hidden hover:border-indigo-500/30 transition-all duration-300">
                  <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-cyan-500/5 blur-xl"></div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-500/20 bg-[#0a0a0f] text-cyan-400">
                      <FileCode className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500">Saved Drafts</span>
                  </div>
                  <p className="mt-4 font-heading text-3xl font-black text-white">
                    {dashboardStats.savedDraftCount}
                  </p>
                  <p className="text-[10px] text-cyan-400 font-semibold mt-1">Pending onboarding drafts</p>
                </div>

                {/* Card 4: Roadmap Progress Completed */}
                <div className="relative rounded-2xl border border-indigo-500/10 bg-[#0e0e16]/60 p-6 backdrop-blur-md overflow-hidden hover:border-indigo-500/30 transition-all duration-300">
                  <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-indigo-500/5 blur-xl"></div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-indigo-500/20 bg-[#0a0a0f] text-indigo-400">
                      <Compass className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500">Roadmap Steps</span>
                  </div>
                  <p className="mt-4 font-heading text-3xl font-black text-white">
                    {dashboardStats.roadmapProgress}
                  </p>
                  <p className="text-[10px] text-indigo-400 font-semibold mt-1">Venture milestones executed</p>
                </div>

              </div>

              {/* Saved Draft Quick Resume Card (Micro Patch 4) */}
              {resumeState && (
                <div className="relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-cyan-950/10 p-6 backdrop-blur-md text-left flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-[0_0_30px_rgba(34,211,238,0.05)] animate-pulse">
                  <div className="absolute -right-16 -top-16 h-32 w-32 rounded-full bg-cyan-500/5 blur-2xl"></div>
                  <div className="space-y-1">
                    <span className="rounded bg-cyan-950 border border-cyan-500/30 px-2 py-0.5 text-3xs font-extrabold tracking-widest text-cyan-400 uppercase">
                      Draft Resume Found
                    </span>
                    <h3 className="text-base font-bold text-white mt-2">
                      Would you like to resume your unfinished onboarding details?
                    </h3>
                    <p className="text-xs text-gray-400">
                      Your changes are saved. Return immediately to compile your venture milestones checklist.
                    </p>
                  </div>
                  <button
                    onClick={handleQuickResume}
                    className="flex items-center gap-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white px-5 py-3 text-xs font-bold uppercase tracking-wider shadow-lg shadow-cyan-600/10 transition-all duration-300 shrink-0 focus:ring-2 focus:ring-cyan-500"
                    aria-label="Resume Draft details step"
                  >
                    <Play className="h-3.5 w-3.5 fill-white" />
                    Quick Resume
                  </button>
                </div>
              )}

              {/* Middle Section: Recent Activity & Quick Action Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Side: Recent Activity & Analysis History List (Micro Patch 3 & 4) */}
                <div className="lg:col-span-2 rounded-2xl border border-indigo-500/10 bg-[#0e0e16]/60 p-6 backdrop-blur-md flex flex-col justify-between min-h-[350px]">
                  <div className="border-b border-indigo-500/5 pb-3 flex items-center justify-between text-left">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-indigo-400" />
                      Venture History &amp; Actions
                    </span>
                    {analysisHistory.length > 0 && (
                      <span className="text-[10px] text-indigo-400 font-bold font-mono">
                        {analysisHistory.length} ENTRIES ARCHIVED
                      </span>
                    )}
                  </div>

                  {analysisHistory.length > 0 ? (
                    <div className="flex-grow py-4 space-y-4 max-h-[320px] overflow-y-auto pr-1">
                      {analysisHistory.map((item) => (
                        <div 
                          key={item.id}
                          onClick={() => handleViewAnalysis(item)}
                          className="group flex items-start justify-between p-4 rounded-xl border border-indigo-500/10 bg-indigo-950/20 hover:border-indigo-500/30 hover:bg-indigo-950/30 transition-all duration-300 cursor-pointer text-left relative"
                        >
                          <div className="space-y-1.5 max-w-md">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                                {item.startupName}
                              </h4>
                              <span className="text-[10px] text-gray-500 font-mono">{item.date}</span>
                            </div>
                            <p className="text-xs text-gray-400 leading-relaxed truncate">
                              {item.summary}
                            </p>
                            <div className="flex flex-wrap gap-2 pt-1">
                              <span className="rounded bg-indigo-950 border border-indigo-500/20 px-2 py-0.5 text-3xs font-extrabold tracking-wider uppercase text-indigo-300">
                                FEASIBILITY: {item.status}
                              </span>
                              <span className="rounded bg-rose-950 border border-rose-500/20 px-2 py-0.5 text-3xs font-extrabold tracking-wider uppercase text-rose-300">
                                RISK: {item.risk}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={(e) => handleDeleteHistory(e, item.id)}
                              className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-rose-400 hover:bg-rose-500/5 border border-transparent hover:border-rose-500/10 transition-all duration-300"
                              title="Delete record"
                              aria-label={`Delete validation history record for ${item.startupName}`}
                            >
                              <Trash2 className="h-4.5 w-4.5" />
                            </button>
                            <ChevronRight className="h-5 w-5 text-gray-600 group-hover:text-white transition-colors" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex-grow flex flex-col items-center justify-center py-12 text-center space-y-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-indigo-500/20 bg-indigo-500/5 text-indigo-400">
                        <Clock className="h-6 w-6" />
                      </div>
                      <div className="max-w-xs space-y-1.5">
                        <h4 className="text-sm font-bold text-white">No validation records compiled</h4>
                        <p className="text-xs leading-relaxed text-gray-500">
                          Stress-test a new startup idea to generate metric score grids and roadmap milestones here.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="text-left pt-3 border-t border-indigo-500/5">
                    <button 
                      onClick={() => showToast('History exports are slatted for Version 2.0 releases.', 'info')}
                      className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors inline-flex items-center gap-1"
                    >
                      Export portfolio history log
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                {/* Right Side: Quick Action Buttons Grid */}
                <div className="rounded-2xl border border-indigo-500/10 bg-[#0e0e16]/60 p-6 backdrop-blur-md flex flex-col justify-between">
                  <div className="border-b border-indigo-500/5 pb-3 text-left">
                    <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-cyan-400" />
                      Quick Operations
                    </span>
                  </div>

                  <div className="flex-grow py-6 space-y-4">
                    {/* Action 1: Validate Idea */}
                    <button
                      onClick={() => navigate('/onboarding/role')}
                      className="w-full flex items-center justify-between p-4 rounded-xl border border-indigo-500/10 bg-indigo-500/5 hover:border-indigo-500/30 hover:bg-indigo-500/10 text-left transition-all duration-300 group"
                    >
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-white">Validate New Idea</h4>
                        <p className="text-[10px] text-gray-500">Stress-test concepts against market demands</p>
                      </div>
                      <ArrowUpRight className="h-5 w-5 text-gray-600 group-hover:text-indigo-400 transition-colors" />
                    </button>

                    {/* Action 2: Generate Roadmap */}
                    <button
                      onClick={() => navigate('/roadmap')}
                      className="w-full flex items-center justify-between p-4 rounded-xl border border-indigo-500/10 bg-indigo-500/5 hover:border-indigo-500/30 hover:bg-indigo-500/10 text-left transition-all duration-300 group"
                    >
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-white">Generate Roadmap</h4>
                        <p className="text-[10px] text-gray-500">Draft actionable project building lists</p>
                      </div>
                      <ArrowUpRight className="h-5 w-5 text-gray-600 group-hover:text-indigo-400 transition-colors" />
                    </button>

                    {/* Action 3: Create Document */}
                    <button
                      onClick={() => showToast('Investor Pitch and compliance document modules coming soon!', 'info')}
                      className="w-full flex items-center justify-between p-4 rounded-xl border border-indigo-500/10 bg-indigo-500/5 hover:border-indigo-500/30 hover:bg-indigo-500/10 text-left transition-all duration-300 group"
                    >
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-white">Create Document</h4>
                        <p className="text-[10px] text-gray-500">Compile investor pitch decks and revenue sheets</p>
                      </div>
                      <ArrowUpRight className="h-5 w-5 text-gray-600 group-hover:text-indigo-400 transition-colors" />
                    </button>
                  </div>

                  <div className="text-xs text-gray-500 leading-relaxed italic pt-3 border-t border-indigo-500/5 text-left">
                    Use quick buttons to expedite product launch cycles.
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* 2. MY STARTUPS TAB */}
          {activeTab === 'startups' && (
            <div className="space-y-8 text-left">
              <div>
                <h3 className="font-heading text-xl font-bold text-white flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-indigo-400" />
                  My Startups Portfolio
                </h3>
                <p className="text-xs text-gray-500 mt-1">Manage and view details of your tracked venture ideas.</p>
              </div>

              {analysisHistory.length > 0 ? (
                <div className="space-y-6">
                  {analysisHistory.map((item) => (
                    <div 
                      key={item.id}
                      onClick={() => handleViewAnalysis(item)}
                      className="rounded-2xl border border-indigo-500/10 bg-[#0e0e16]/80 p-6 backdrop-blur-md space-y-6 cursor-pointer hover:border-indigo-500/30 transition-all duration-300"
                    >
                      {/* Header Row */}
                      <div className="flex items-center justify-between border-b border-indigo-500/5 pb-4">
                        <div>
                          <h4 className="text-lg font-bold font-heading text-white">{item.startupName}</h4>
                          <p className="text-xs text-indigo-400 mt-0.5">{item.startupDetails?.startupDomain || 'Venture Proposal'}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="rounded-full bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 text-2xs font-bold uppercase tracking-widest text-emerald-400">
                            Validated Index: {item.status}
                          </span>
                          <button
                            onClick={(e) => handleDeleteHistory(e, item.id)}
                            className="p-2 text-gray-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-all duration-300"
                            aria-label="Delete analysis"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        </div>
                      </div>

                      {/* Summary Description block */}
                      <div className="space-y-1 text-left">
                        <span className="text-indigo-400 font-bold uppercase tracking-wider text-[10px] block">Feasibility Summary</span>
                        <p className="text-xs leading-relaxed text-gray-400">{item.summary}</p>
                      </div>

                      {/* Metric Score Quick review */}
                      <div className="pt-4 border-t border-indigo-500/5">
                        <span className="text-indigo-400 font-bold uppercase tracking-wider text-[10px] block mb-3">Key Feasibility Metrics</span>
                        <div className="grid grid-cols-3 sm:grid-cols-9 gap-3 text-center">
                          {Object.entries(item.scores).map(([k, v]) => (
                            <div key={k} className="bg-indigo-950/15 border border-indigo-500/5 rounded-lg p-2.5">
                              <span className="text-[9px] uppercase tracking-wider text-gray-500 block truncate">{k.replace(/([A-Z])/g, ' $1')}</span>
                              <span className="text-sm font-bold text-white font-heading mt-1 block">{v.score}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-indigo-500/10 bg-[#0e0e16]/60 p-12 text-center backdrop-blur-md space-y-4">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/5 text-indigo-400">
                    <Briefcase className="h-6 w-6" />
                  </div>
                  <div className="max-w-xs mx-auto space-y-1">
                    <h4 className="text-sm font-bold text-white">No startups registered yet</h4>
                    <p className="text-xs text-gray-500">Go through the validation process to register and track your ideas.</p>
                  </div>
                  <button 
                    onClick={() => navigate('/onboarding/role')}
                    className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-indigo-500 transition-colors"
                  >
                    Stress-Test New Venture
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 3. ROADMAP TAB */}
          {activeTab === 'roadmap' && (
            <div className="space-y-8 text-left">
              <div>
                <h3 className="font-heading text-xl font-bold text-white flex items-center gap-2">
                  <Compass className="h-5 w-5 text-indigo-400" />
                  Interactive Milestone Roadmap
                </h3>
                <p className="text-xs text-gray-500 mt-1">Actionable checks and engineering timelines generated by our AI models.</p>
              </div>

              <div className="rounded-2xl border border-indigo-500/10 bg-[#0e0e16]/60 p-12 text-center backdrop-blur-md space-y-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-[#0a0a0f]/90 z-10 flex flex-col items-center justify-center space-y-4">
                  <Construction className="h-10 w-10 text-indigo-400 animate-bounce" />
                  <div className="max-w-xs space-y-1">
                    <h4 className="text-sm font-bold text-white">Milestone Roadmap Module</h4>
                    <p className="text-xs text-gray-500">This module is locked and slated for deployment in StartupXpert v2.0.</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('overview')}
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-indigo-500 transition-all duration-300"
                  >
                    Return to Overview
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 4. DOCUMENTS TAB */}
          {activeTab === 'documents' && (
            <div className="space-y-8 text-left">
              <div>
                <h3 className="font-heading text-xl font-bold text-white flex items-center gap-2">
                  <FileText className="h-5 w-5 text-cyan-400" />
                  Document Repository
                </h3>
                <p className="text-xs text-gray-500 mt-1">Investor pitch decks, financial sheets, and compliance documents.</p>
              </div>

              <div className="rounded-2xl border border-indigo-500/10 bg-[#0e0e16]/60 p-12 text-center backdrop-blur-md space-y-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-[#0a0a0f]/90 z-10 flex flex-col items-center justify-center space-y-4">
                  <Construction className="h-10 w-10 text-cyan-400 animate-bounce" />
                  <div className="max-w-xs space-y-1">
                    <h4 className="text-sm font-bold text-white">Document Generator Module</h4>
                    <p className="text-xs text-gray-500">Draft pitch decks and compliance forms in Version 2.0.</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('overview')}
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-indigo-500 transition-all"
                  >
                    Return to Overview
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 5. SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div className="space-y-8 text-left">
              <div>
                <h3 className="font-heading text-xl font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-indigo-400" />
                  Workspace Settings
                </h3>
                <p className="text-xs text-gray-500 mt-1">Configure profile and platform metrics triggers.</p>
              </div>

              <div className="rounded-2xl border border-indigo-500/10 bg-[#0e0e16]/60 p-12 text-center backdrop-blur-md space-y-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-[#0a0a0f]/90 z-10 flex flex-col items-center justify-center space-y-4">
                  <div className="h-10 w-10 rounded-full border border-indigo-500/20 bg-indigo-500/5 flex items-center justify-center text-indigo-400">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div className="max-w-xs space-y-1">
                    <h4 className="text-sm font-bold text-white">Separate Settings Page Active</h4>
                    <p className="text-xs text-gray-500">StartupXpert settings have been migrated to a dedicated panel for premium accessibility.</p>
                  </div>
                  <button
                    onClick={() => navigate('/settings')}
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-indigo-500 transition-all duration-300"
                  >
                    Open Settings Page
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 6. ANALYSIS HISTORY TAB */}
          {activeTab === 'history' && (
            <div className="space-y-8 text-left">
              <div>
                <h3 className="font-heading text-xl font-bold text-white flex items-center gap-2">
                  <Clock className="h-5 w-5 text-indigo-400" />
                  Venture Stress-Test Archive
                </h3>
                <p className="text-xs text-gray-500 mt-1">A detailed log of all your previous startup idea stress-tests and validation scores.</p>
              </div>

              {analysisHistory.length > 0 ? (
                <div className="space-y-4">
                  {analysisHistory.map((item) => (
                    <div 
                      key={item.id}
                      onClick={() => handleViewAnalysis(item)}
                      className="group flex flex-col md:flex-row md:items-center justify-between p-6 rounded-2xl border border-indigo-500/10 bg-[#0e0e16]/80 hover:border-indigo-500/30 hover:bg-indigo-950/20 transition-all duration-300 cursor-pointer relative"
                    >
                      <div className="space-y-2 max-w-2xl">
                        <div className="flex items-center gap-3">
                          <h4 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                            {item.startupName}
                          </h4>
                          <span className="rounded bg-indigo-950/60 border border-indigo-500/20 px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase text-indigo-400">
                            {item.startupDetails?.startupDomain || 'Startup Idea'}
                          </span>
                          <span className="text-xs text-gray-500 font-mono">{item.date}</span>
                        </div>
                        <p className="text-xs text-gray-400 leading-relaxed">
                          {item.summary}
                        </p>
                        <div className="flex flex-wrap gap-2 pt-1">
                          <span className="rounded bg-indigo-950 border border-indigo-500/20 px-2 py-0.5 text-3xs font-extrabold tracking-wider uppercase text-indigo-300">
                            FEASIBILITY: {item.status}
                          </span>
                          <span className="rounded bg-rose-950 border border-rose-500/20 px-2 py-0.5 text-3xs font-extrabold tracking-wider uppercase text-rose-300">
                            RISK LEVEL: {item.risk}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mt-4 md:mt-0 justify-end shrink-0">
                        <button
                          onClick={(e) => handleDeleteHistory(e, item.id)}
                          className="h-9 w-9 flex items-center justify-center rounded-xl text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 border border-indigo-500/5 hover:border-rose-500/20 transition-all duration-300"
                          title="Delete archived analysis"
                          aria-label={`Delete record for ${item.startupName}`}
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                        <span className="hidden md:flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-indigo-400 group-hover:text-white transition-colors">
                          View Report
                          <ChevronRight className="h-4 w-4" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-indigo-500/10 bg-[#0e0e16]/60 p-12 text-center backdrop-blur-md space-y-4">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/5 text-indigo-400">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div className="max-w-xs mx-auto space-y-1">
                    <h4 className="text-sm font-bold text-white">No archived records found</h4>
                    <p className="text-xs text-gray-500">Run a stress-test to save feasibility records in your persistent archive.</p>
                  </div>
                  <button 
                    onClick={() => navigate('/onboarding/role')}
                    className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-indigo-500 transition-colors"
                  >
                    Validate New Concept
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default Dashboard;
