import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStartup } from '../context/StartupContext';
import { useToast } from '../context/ToastContext';
import Navbar from '../components/Navbar';
import AnalysisCard from '../components/AnalysisCard';
import { 
  Sparkles, 
  ArrowRight, 
  TrendingUp, 
  Target, 
  Users, 
  Gauge, 
  AlertCircle, 
  Zap, 
  Layers, 
  Search, 
  Download, 
  RefreshCw, 
  Save, 
  LayoutDashboard 
} from 'lucide-react';

const AnalysisResult = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { analysisScores, startupDetails, saveAnalysis } = useStartup();

  const handleExport = () => {
    showToast('Exporting metrics sheet as PDF... Module coming soon in V2.0!', 'info');
  };

  const handleSave = () => {
    saveAnalysis(analysisScores);
    // Directly navigate to dashboard after small timeout to show persistence update
    setTimeout(() => {
      navigate('/dashboard');
    }, 1200);
  };

  const handleReanalyze = () => {
    showToast('Re-compiling venture inputs...', 'info');
    navigate('/analysis/loader');
  };

  // Safe fallback if scores are missing (should not happen due to ProtectedRoute checks)
  if (!analysisScores) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col justify-between text-white">
        <Navbar />
        <main className="flex-grow flex items-center justify-center p-6">
          <div className="text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-rose-500 mx-auto" />
            <h2 className="font-heading text-lg font-bold">Analysis Data Missing</h2>
            <button onClick={() => navigate('/startup/validate')} className="px-4 py-2 bg-indigo-600 rounded-lg text-xs">
              Go to Validation
            </button>
          </div>
        </main>
      </div>
    );
  }

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
    <div className="relative min-h-screen bg-[#0a0a0f] flex flex-col justify-between overflow-x-hidden text-white">
      <Navbar />

      <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8 relative z-10 max-w-6xl mx-auto w-full">
        <div className="space-y-8">
          
          {/* Header Details */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-indigo-500/5 pb-6 text-left">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">Analysis Complete</span>
              <h1 className="font-heading text-3xl font-extrabold text-white mt-1">
                Feasibility Report: {startupDetails.startupName || 'Venture Proposal'}
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Venture profile analyzed against competitive indices, pricing formats, and scalability metrics.
              </p>
            </div>

            {/* Actions Panel */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                onClick={handleReanalyze}
                className="group flex items-center gap-2 rounded-xl border border-indigo-500/10 bg-indigo-500/5 px-4.5 py-3 text-xs font-bold uppercase tracking-wider text-gray-300 hover:bg-indigo-500/10 hover:text-white transition-all duration-300"
              >
                <RefreshCw className="h-4 w-4 transition-transform group-hover:rotate-180 duration-500" />
                Reanalyze
              </button>

              <button
                onClick={handleExport}
                className="flex items-center gap-2 rounded-xl border border-indigo-500/10 bg-[#0e0e16]/80 px-4.5 py-3 text-xs font-bold uppercase tracking-wider text-gray-300 hover:bg-indigo-500/10 hover:text-white transition-all duration-300"
              >
                <Download className="h-4 w-4" />
                Export
              </button>

              <button
                onClick={handleSave}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-indigo-600/10 hover:bg-indigo-500 transition-all duration-300 hover:shadow-indigo-600/20"
              >
                <Save className="h-4 w-4" />
                Save &amp; Finish
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="rounded-xl border border-indigo-500/5 bg-indigo-950/10 px-6 py-4 flex flex-wrap items-center justify-around gap-4 text-left">
            <div>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">DOMAIN</span>
              <p className="text-xs font-bold text-white mt-0.5">{startupDetails.startupDomain || 'N/A'}</p>
            </div>
            <div className="h-8 w-[1px] bg-indigo-500/10 hidden sm:block"></div>
            <div>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">REVENUE MODEL</span>
              <p className="text-xs font-bold text-white mt-0.5">{startupDetails.revenueModel || 'N/A'}</p>
            </div>
            <div className="h-8 w-[1px] bg-indigo-500/10 hidden sm:block"></div>
            <div>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">FUNDING</span>
              <p className="text-xs font-bold text-white mt-0.5">{startupDetails.availableFunding || 'N/A'}</p>
            </div>
            <div className="h-8 w-[1px] bg-indigo-500/10 hidden sm:block"></div>
            <div>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">TIMELINE</span>
              <p className="text-xs font-bold text-white mt-0.5">{startupDetails.mvpTimeline || 'N/A'}</p>
            </div>
          </div>

          {/* 3x3 Feasibility Cards Grid */}
          <section>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {metricMeta.map((m) => {
                const Icon = m.icon;
                const scoreDetails = analysisScores[m.id];
                return (
                  <AnalysisCard
                    key={m.id}
                    label={m.label}
                    score={scoreDetails.score}
                    status={scoreDetails.status}
                    details={scoreDetails.details}
                    icon={Icon}
                  />
                );
              })}
            </div>
          </section>

          {/* Navigation base */}
          <div className="pt-4 flex justify-start">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 rounded-xl border border-indigo-500/20 bg-indigo-500/5 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-indigo-400 hover:bg-indigo-500/10 hover:text-white transition-all duration-300"
            >
              <LayoutDashboard className="h-4.5 w-4.5" />
              Return to Dashboard Workspace
            </button>
          </div>

        </div>
      </main>

      <footer className="border-t border-indigo-500/5 py-8 text-center text-xs text-gray-600 bg-[#08080c]/60">
        &copy; {new Date().getFullYear()} StartupXpert. AI Feasibility Engine.
      </footer>
    </div>
  );
};

export default AnalysisResult;
