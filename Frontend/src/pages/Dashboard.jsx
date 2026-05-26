import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStartup } from '../context/StartupContext';
import Sidebar from '../components/Sidebar';
import { 
  Sparkles, 
  Layers, 
  FileText, 
  Compass, 
  ArrowUpRight, 
  Clock, 
  Plus, 
  HelpCircle,
  Construction,
  Briefcase,
  TrendingUp,
  ChevronRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

const Dashboard = () => {
  const { user, startupDetails, onboardingRole, analysisScores } = useStartup();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Custom toast state
  const [toastMsg, setToastMsg] = useState('');

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg('');
    }, 3000);
  };

  // Check if a startup has been validated in the current session
  const hasValidatedStartup = !!startupDetails.startupName;

  return (
    <div className="relative min-h-screen bg-[#0a0a0f] flex text-white overflow-hidden">
      
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 rounded-xl border border-indigo-500/30 bg-indigo-950 px-5 py-3.5 shadow-2xl backdrop-blur-md animate-fade-in flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-indigo-400 animate-pulse" />
          <span className="text-sm font-semibold text-white">{toastMsg}</span>
        </div>
      )}

      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Board Content */}
      <main className="flex-grow p-8 overflow-y-auto max-h-screen">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Dashboard Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-500/5 pb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">V1.0.0 Production Release</span>
              <h1 className="font-heading text-3xl font-extrabold text-white mt-1">
                Welcome back, {user.fullName || 'Innovator'}
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Here is your venture portfolio status and market validation updates.
              </p>
            </div>
            
            {/* Quick Actions Header */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/onboarding/role')}
                className="group flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4.5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-indigo-600/10 hover:bg-indigo-500 hover:shadow-indigo-600/20 hover:scale-[1.02] transition-all duration-300"
              >
                <Plus className="h-4 w-4" />
                Validate New Idea
              </button>
            </div>
          </div>

          {/* TAB CONTENTS */}

          {/* 1. OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-fade-in">
              {/* Statistic Summary Cards */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                
                {/* Card 1: Startups Analyzed */}
                <div className="relative rounded-2xl border border-indigo-500/10 bg-[#0e0e16]/60 p-6 backdrop-blur-md overflow-hidden">
                  <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-indigo-500/5 blur-xl"></div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-indigo-500/20 bg-indigo-500/5 text-indigo-400">
                      <Layers className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Startups Analyzed</span>
                  </div>
                  <p className="mt-4 font-heading text-3xl font-black text-white">
                    {hasValidatedStartup ? '1' : '0'}
                  </p>
                  <p className="text-2xs text-indigo-400 font-semibold mt-1">AI stress-test reports compiled</p>
                </div>

                {/* Card 2: Documents Generated */}
                <div className="relative rounded-2xl border border-indigo-500/10 bg-[#0e0e16]/60 p-6 backdrop-blur-md overflow-hidden">
                  <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-cyan-500/5 blur-xl"></div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-500/20 bg-[#0a0a0f] text-cyan-400">
                      <FileText className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Docs Generated</span>
                  </div>
                  <p className="mt-4 font-heading text-3xl font-black text-white">0</p>
                  <p className="text-2xs text-cyan-400 font-semibold mt-1">Investor pitches &amp; compliances</p>
                </div>

                {/* Card 3: Roadmap Steps Completed */}
                <div className="relative rounded-2xl border border-indigo-500/10 bg-[#0e0e16]/60 p-6 backdrop-blur-md overflow-hidden">
                  <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-indigo-500/5 blur-xl"></div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-indigo-500/20 bg-[#0a0a0f] text-indigo-400">
                      <Compass className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Roadmap Progress</span>
                  </div>
                  <p className="mt-4 font-heading text-3xl font-black text-white">
                    {hasValidatedStartup ? '0 / 10' : '0 / 0'}
                  </p>
                  <p className="text-2xs text-indigo-400 font-semibold mt-1">Venture milestone steps executed</p>
                </div>

              </div>

              {/* Middle Section: Recent Activity & Quick Action Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Side: Recent Activity (Empty state or short list) */}
                <div className="lg:col-span-2 rounded-2xl border border-indigo-500/10 bg-[#0e0e16]/60 p-6 backdrop-blur-md flex flex-col justify-between min-h-[350px]">
                  <div className="border-b border-indigo-500/5 pb-3 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-indigo-400" />
                      Recent Activity
                    </span>
                  </div>

                  {hasValidatedStartup ? (
                    <div className="flex-grow flex flex-col justify-center py-6 text-left space-y-4">
                      <div className="flex items-start gap-4 p-4 rounded-xl border border-indigo-500/10 bg-indigo-950/20">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-500/20 shrink-0">
                          <CheckCircle2 className="h-4 w-4" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold text-white">Startup validated: {startupDetails.startupName}</h4>
                          <p className="text-xs text-gray-400 leading-relaxed">
                            Completed 17-field parameters capture. Simulated market, problem, scalability, and target-audience fit scores compiled successfully.
                          </p>
                          <span className="text-[10px] text-gray-600 block pt-1 font-mono">Just Now • Session Validation</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-grow flex flex-col items-center justify-center py-12 text-center space-y-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-indigo-500/20 bg-indigo-500/5 text-indigo-400">
                        <Clock className="h-6 w-6" />
                      </div>
                      <div className="max-w-xs space-y-1.5">
                        <h4 className="text-sm font-bold text-white">No recent activities</h4>
                        <p className="text-xs leading-relaxed text-gray-500">
                          Start by stress-testing a new startup concept to compile roadmap milestones and documents.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="text-left pt-3 border-t border-indigo-500/5">
                    <button 
                      onClick={() => triggerToast('Activity tracking logs are disabled in mockup mode.')}
                      className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors inline-flex items-center gap-1"
                    >
                      View all activities
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                {/* Right Side: Quick Action Buttons Grid */}
                <div className="rounded-2xl border border-indigo-500/10 bg-[#0e0e16]/60 p-6 backdrop-blur-md flex flex-col justify-between">
                  <div className="border-b border-indigo-500/5 pb-3 text-left">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-cyan-400" />
                      Quick Actions
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
                      onClick={() => triggerToast('Roadmap generation modules are coming soon in Version 2.0!')}
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
                      onClick={() => triggerToast('Investor Pitch and compliance document modules coming soon!')}
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
            <div className="space-y-8 animate-fade-in text-left">
              <div>
                <h3 className="font-heading text-xl font-bold text-white flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-indigo-400" />
                  My Startups Portfolio
                </h3>
                <p className="text-xs text-gray-500 mt-1">Manage and view details of your tracked venture ideas.</p>
              </div>

              {hasValidatedStartup ? (
                <div className="rounded-2xl border border-indigo-500/10 bg-[#0e0e16]/80 p-6 backdrop-blur-md space-y-6">
                  {/* Header Row */}
                  <div className="flex items-center justify-between border-b border-indigo-500/5 pb-4">
                    <div>
                      <h4 className="text-lg font-bold font-heading text-white">{startupDetails.startupName}</h4>
                      <p className="text-xs text-indigo-400 mt-0.5">{startupDetails.startupDomain} • {startupDetails.startupStage} Stage</p>
                    </div>
                    <span className="rounded-full bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 text-2xs font-bold uppercase tracking-widest text-emerald-400">
                      Validated
                    </span>
                  </div>

                  {/* Summary Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Platform Type</span>
                      <p className="text-xs font-semibold text-white">{Array.isArray(startupDetails.platformType) ? startupDetails.platformType.join(', ') : startupDetails.platformType}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Tech Complexity</span>
                      <p className="text-xs font-semibold text-white">{startupDetails.techComplexity}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Revenue Model</span>
                      <p className="text-xs font-semibold text-white">{startupDetails.revenueModel}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Estimated Price</span>
                      <p className="text-xs font-semibold text-white">{startupDetails.estimatedPricing}</p>
                    </div>
                  </div>

                  {/* Descriptions block */}
                  <div className="space-y-3 pt-4 border-t border-indigo-500/5">
                    <p className="text-xs leading-relaxed text-gray-400">
                      <span className="text-indigo-400 font-bold uppercase tracking-wider text-[10px] block mb-1">Problem Statement</span>
                      {startupDetails.problemStatement}
                    </p>
                    <p className="text-xs leading-relaxed text-gray-400">
                      <span className="text-indigo-400 font-bold uppercase tracking-wider text-[10px] block mb-1">Product Proposal</span>
                      {startupDetails.startupDescription}
                    </p>
                  </div>

                  {/* Metric Score Quick review if exists */}
                  {analysisScores && (
                    <div className="pt-4 border-t border-indigo-500/5">
                      <span className="text-indigo-400 font-bold uppercase tracking-wider text-[10px] block mb-3">Key Feasibility Metrics</span>
                      <div className="grid grid-cols-3 sm:grid-cols-9 gap-3">
                        {Object.entries(analysisScores).map(([k, v]) => (
                          <div key={k} className="bg-indigo-950/15 border border-indigo-500/5 rounded-lg p-2.5 text-center">
                            <span className="text-[9px] uppercase tracking-wider text-gray-500 block truncate">{k.replace(/([A-Z])/g, ' $1')}</span>
                            <span className="text-sm font-bold text-white font-heading mt-1 block">{v.score}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

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
            <div className="space-y-8 animate-fade-in text-left">
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
            <div className="space-y-8 animate-fade-in text-left">
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
            <div className="space-y-8 animate-fade-in text-left">
              <div>
                <h3 className="font-heading text-xl font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-indigo-400" />
                  Workspace Settings
                </h3>
                <p className="text-xs text-gray-500 mt-1">Configure profile and platform metrics triggers.</p>
              </div>

              <div className="rounded-2xl border border-indigo-500/10 bg-[#0e0e16]/60 p-12 text-center backdrop-blur-md space-y-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-[#0a0a0f]/90 z-10 flex flex-col items-center justify-center space-y-4">
                  <Construction className="h-10 w-10 text-indigo-400 animate-bounce" />
                  <div className="max-w-xs space-y-1">
                    <h4 className="text-sm font-bold text-white">Workspace Configuration</h4>
                    <p className="text-xs text-gray-500">Venture settings and profile keys will lock in next releases.</p>
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

        </div>
      </main>
    </div>
  );
};

export default Dashboard;
