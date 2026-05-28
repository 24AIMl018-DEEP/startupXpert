import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStartup } from '../context/StartupContext';
import Navbar from '../components/Navbar';
import ProgressBar from '../components/ProgressBar';
import { 
  Sparkles, 
  ArrowRight, 
  Search, 
  Layers, 
  AlertCircle, 
  TrendingUp, 
  Target, 
  Users, 
  Gauge, 
  Zap,
  Lock,
  LayoutDashboard
} from 'lucide-react';

const StartupInput = () => {
  const { startupDetails, onboardingRole, runAnalysis, analysisScores, isAnalyzing } = useStartup();
  const navigate = useNavigate();
  const [hasRun, setHasRun] = useState(false);

  // Formatted data list to display on the review card
  const reviewFields = [
    { label: 'Startup Name', value: startupDetails.startupName },
    { label: 'Domain', value: startupDetails.startupDomain },
    { label: 'Platform Type', value: Array.isArray(startupDetails.platformType) ? startupDetails.platformType.join(', ') : startupDetails.platformType },
    { label: 'Tech Complexity', value: startupDetails.techComplexity },
    { label: 'Available Funding', value: startupDetails.availableFunding },
    { label: 'Monthly Burn Capacity', value: startupDetails.monthlyBurnCapacity },
    { label: 'Estimated Pricing', value: startupDetails.estimatedPricing },
    { label: 'MVP Timeline', value: startupDetails.mvpTimeline },
    { label: 'Scalability Goal', value: startupDetails.scalabilityGoal },
    { label: 'Startup Stage', value: startupDetails.startupStage },
    { label: 'Geographic Market', value: startupDetails.geographicMarket },
    { label: 'Competitors', value: startupDetails.existingCompetitors },
    { label: 'Revenue Model', value: startupDetails.revenueModel },
    { label: 'Target Audience', value: startupDetails.targetAudience },
  ];

  const handleAnalyzeClick = () => {
    navigate('/analysis/loader');
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case 'High':
        return 'bg-emerald-950/60 border border-emerald-500/30 text-emerald-400';
      case 'Medium':
        return 'bg-amber-950/60 border border-amber-500/30 text-amber-400';
      case 'Low':
        return 'bg-rose-950/60 border border-rose-500/30 text-rose-400';
      default:
        return 'bg-indigo-950/60 border border-indigo-500/30 text-indigo-400';
    }
  };

  const metricMeta = [
    { id: 'marketDemand', label: 'Market Demand', icon: TrendingUp },
    { id: 'targetAudienceFit', label: 'Target Audience Fit', icon: Target },
    { id: 'problemSolutionFit', label: 'Problem-Solution Fit', icon: Sparkles },
    { id: 'competitorPresence', label: 'Competitor Presence', icon: Users },
    { id: 'revenuePotential', label: 'Revenue Potential', icon: Gauge },
    { id: 'riskLevel', label: 'Risk Level', icon: AlertCircle },
    { id: 'innovationLevel', label: 'Innovation Level', icon: Zap },
    { id: 'scalability', label: 'Scalability', icon: Layers },
    { id: 'feasibility', label: 'Feasibility', icon: Search }
  ];

  return (
    <div className="relative min-h-screen bg-[#0a0a0f] flex flex-col justify-between overflow-x-hidden">
      <Navbar />

      <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8 relative z-10 max-w-5xl mx-auto w-full">
        {/* Progress Tracker */}
        <ProgressBar currentStep={3} />

        <div className="space-y-8">
          
          {/* Section Heading */}
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <h2 className="font-heading text-3xl font-extrabold text-white">
              Stress-Test Your Startup Idea
            </h2>
            <p className="text-sm text-gray-500">
              Review your collected parameters, compile models, and trigger StartupXpert's feasibility analytics.
            </p>
          </div>

          {/* Raw Input Review Card */}
          <div className="rounded-2xl border border-indigo-500/10 bg-[#0e0e16]/80 p-6 md:p-8 shadow-xl backdrop-blur-md relative overflow-hidden">
            <div className="absolute -left-12 -bottom-12 h-32 w-32 rounded-full bg-indigo-500/5 blur-2xl"></div>
            
            <div className="border-b border-indigo-500/5 pb-4 mb-6 text-left">
              <h3 className="font-heading text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Layers className="h-5 w-5 text-indigo-400" />
                Raw Startup Input Review
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Verify parameters loaded from your onboarding context
              </p>
            </div>

            {/* Accompanying descriptive paragraph block */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left mb-6 text-sm">
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">Core Proposal Details</h4>
                <p className="leading-relaxed text-gray-300">
                  <span className="text-indigo-400 font-semibold">Problem:</span> {startupDetails.problemStatement || 'Not provided'}
                </p>
                <p className="leading-relaxed text-gray-300 mt-2">
                  <span className="text-indigo-400 font-semibold">Description:</span> {startupDetails.startupDescription || 'Not provided'}
                </p>
              </div>
              <div className="space-y-3 border-t md:border-t-0 md:border-l border-indigo-500/5 pt-4 md:pt-0 md:pl-8">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">Acquisition Strategy</h4>
                <p className="leading-relaxed text-gray-300 italic">
                  "{startupDetails.acquisitionStrategy || 'Not provided'}"
                </p>
              </div>
            </div>

            {/* Parameters Grid list */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left border-t border-indigo-500/5 pt-6">
              {reviewFields.map((f, i) => (
                <div key={i} className="space-y-0.5 rounded-lg bg-indigo-950/10 border border-indigo-500/5 p-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">{f.label}</span>
                  <p className="text-xs font-semibold text-white truncate">{f.value || 'N/A'}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Trigger Action Panel */}
          <div className="flex flex-col items-center justify-center space-y-4">
            <button
              onClick={handleAnalyzeClick}
              disabled={isAnalyzing}
              className="group relative flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-8 py-4.5 text-base font-bold text-white shadow-[0_0_35px_rgba(99,102,241,0.4)] transition-all duration-300 hover:from-indigo-500 hover:to-indigo-600 hover:scale-[1.02] hover:shadow-[0_0_45px_rgba(99,102,241,0.6)] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Synthesizing Market Intelligence...
                </>
              ) : (
                <>
                  Analyze My Startup Idea
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>

            {analysisScores && (
              <button
                onClick={() => {
                  // Direct to dashboard, mark isLoggedIn = true since they completed validation
                  localStorage.setItem('isLoggedIn', 'true');
                  navigate('/dashboard');
                }}
                className="flex items-center gap-2 rounded-xl border border-cyan-500/20 bg-cyan-950/20 px-6 py-3 text-sm font-bold text-cyan-300 hover:bg-cyan-500/20 hover:text-white transition-all duration-300 animate-bounce mt-2 shadow-[0_0_20px_rgba(34,211,238,0.15)]"
              >
                <LayoutDashboard className="h-4.5 w-4.5" />
                Proceed to Dashboard Workspace
              </button>
            )}
          </div>

          {/* 3x3 Feasibility Metrics Card Grid */}
          <section className="pt-4">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {metricMeta.map((m) => {
                const Icon = m.icon;
                const scoreDetails = analysisScores ? analysisScores[m.id] : null;
                const isPending = !scoreDetails;

                return (
                  <div 
                    key={m.id}
                    className={`relative flex flex-col justify-between p-6 rounded-2xl border bg-[#0e0e16]/60 backdrop-blur-md transition-all duration-500 ${
                      isPending 
                        ? 'border-indigo-500/5 opacity-60' 
                        : 'border-indigo-500/15 hover:border-indigo-500/30 hover:shadow-[0_0_25px_rgba(99,102,241,0.1)] scale-[1.01]'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-indigo-500/10 bg-indigo-500/5 text-indigo-400">
                          <Icon className="h-5 w-5" />
                        </div>
                        <h4 className="font-heading text-sm font-bold text-white tracking-wide">{m.label}</h4>
                      </div>
                      
                      {/* Score or Locked Badge */}
                      {!isPending ? (
                        <span className={`px-2.5 py-0.5 rounded-full text-3xs font-extrabold uppercase tracking-widest ${getStatusStyles(scoreDetails.status)}`}>
                          {scoreDetails.status}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 rounded-full bg-indigo-950/30 border border-indigo-950 px-2 py-0.5 text-3xs font-medium text-gray-600">
                          <Lock className="h-2.5 w-2.5" />
                          Locked
                        </span>
                      )}
                    </div>

                    {/* Middle Content */}
                    <div className="min-h-[90px] flex flex-col justify-center text-left py-2">
                      {!isPending ? (
                        <>
                          <div className="flex items-baseline gap-1 mb-2">
                            <span className="text-3xl font-heading font-extrabold text-white">
                              {scoreDetails.score}
                            </span>
                            <span className="text-xs text-gray-500">/ 100</span>
                          </div>
                          <p className="text-xs leading-relaxed text-gray-400">
                            {scoreDetails.details}
                          </p>
                        </>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-xs text-gray-500 italic">Pending Feasibility Analysis...</p>
                          <div className="h-1.5 w-2/3 rounded bg-indigo-950/20 overflow-hidden relative">
                            <div className="absolute inset-0 bg-indigo-500/20 animate-pulse"></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

        </div>
      </main>

      <footer className="border-t border-indigo-500/5 py-8 text-center text-xs text-gray-600 bg-[#08080c]/60">
        &copy; {new Date().getFullYear()} StartupXpert. AI Feasibility Engine.
      </footer>
    </div>
  );
};

export default StartupInput;
