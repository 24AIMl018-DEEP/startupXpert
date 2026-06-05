import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStartup } from '../context/StartupContext';
import { useToast } from '../context/ToastContext';
import Navbar from '../components/Navbar';
import AnalysisCard from '../components/AnalysisCard';
import {
  Sparkles, ArrowRight, TrendingUp, Target, Users, Gauge,
  AlertCircle, Zap, Layers, Search, Download, RefreshCw,
  Save, LayoutDashboard, CheckCircle, XCircle, ShieldAlert,
  Lightbulb, BarChart3, Swords, ChevronDown, ChevronUp
} from 'lucide-react';

const AnalysisResult = () => {
  const navigate  = useNavigate();
  const { showToast } = useToast();
  const { analysisScores, fullAnalysisData, startupDetails, saveAnalysis } = useStartup();
  const [expandedAgent, setExpandedAgent] = useState(null);

  const handleExport  = () => showToast('PDF export coming in V2.0!', 'info');
  const handleSave    = () => { saveAnalysis(analysisScores); setTimeout(() => navigate('/dashboard'), 1200); };
  const handleReanalyze = () => { showToast('Re-compiling venture inputs...', 'info'); navigate('/analysis/loader'); };

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

  // Rich agent data from backend
  const ap = fullAnalysisData?.analysis_phase_state || {};
  const agents = [
    { key: 'feasibility',        label: 'Feasibility Analysis',   icon: Search,      data: ap.feasibility },
    { key: 'market_opportunity', label: 'Market Opportunity',      icon: TrendingUp,  data: ap.market_opportunity },
    { key: 'competition',        label: 'Competition Analysis',    icon: Swords,      data: ap.competition },
    { key: 'risk',               label: 'Risk Analysis',           icon: ShieldAlert, data: ap.risk },
    { key: 'innovation_usp',     label: 'Innovation & USP',        icon: Lightbulb,   data: ap.innovation_usp },
  ];

  const metricMeta = [
    { id: 'marketDemand',       label: 'Market Demand',        icon: TrendingUp  },
    { id: 'targetAudienceFit',  label: 'Audience Fit',         icon: Target      },
    { id: 'problemSolutionFit', label: 'Problem-Solution Fit', icon: Sparkles    },
    { id: 'competitorPresence', label: 'Competitor Presence',  icon: Users       },
    { id: 'revenuePotential',   label: 'Revenue Potential',    icon: Gauge       },
    { id: 'riskLevel',          label: 'Risk Level',           icon: AlertCircle },
    { id: 'innovationLevel',    label: 'Innovation Level',     icon: Zap         },
    { id: 'scalability',        label: 'Scalability',          icon: Layers      },
    { id: 'feasibility',        label: 'Feasibility',          icon: Search      },
  ];

  const statusColor = (s) => {
    if (!s) return 'text-gray-500';
    const v = s.toLowerCase();
    if (v.includes('high') || v.includes('strong') || v.includes('pass')) return 'text-emerald-400';
    if (v.includes('medium') || v.includes('moderate')) return 'text-yellow-400';
    return 'text-rose-400';
  };

  const renderList = (items, icon = '•', colorClass = 'text-gray-400') => {
    if (!items?.length) return <p className="text-xs text-gray-600 italic">No data available.</p>;
    return (
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className={`text-xs flex gap-2 ${colorClass}`}>
            <span className="mt-0.5 shrink-0">{icon}</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="relative min-h-screen bg-[#0a0a0f] flex flex-col justify-between overflow-x-hidden text-white">
      <Navbar />

      <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8 relative z-10 max-w-6xl mx-auto w-full">
        <div className="space-y-8">

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-indigo-500/5 pb-6 text-left">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">Analysis Complete</span>
              <h1 className="font-heading text-3xl font-extrabold text-white mt-1">
                Feasibility Report: {startupDetails.startupName || 'Venture Proposal'}
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Analyzed against competitive indices, pricing formats, and scalability metrics.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button onClick={handleReanalyze} className="group flex items-center gap-2 rounded-xl border border-indigo-500/10 bg-indigo-500/5 px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-300 hover:bg-indigo-500/10 hover:text-white transition-all duration-300">
                <RefreshCw className="h-4 w-4 transition-transform group-hover:rotate-180 duration-500" />Reanalyze
              </button>
              <button onClick={handleExport} className="flex items-center gap-2 rounded-xl border border-indigo-500/10 bg-[#0e0e16]/80 px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-300 hover:bg-indigo-500/10 hover:text-white transition-all duration-300">
                <Download className="h-4 w-4" />Export
              </button>
              <button onClick={handleSave} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-indigo-600/10 hover:bg-indigo-500 transition-all duration-300">
                <Save className="h-4 w-4" />Save & Finish
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="rounded-xl border border-indigo-500/5 bg-indigo-950/10 px-6 py-4 flex flex-wrap items-center justify-around gap-4 text-left">
            {[
              ['DOMAIN',        startupDetails.startupDomain],
              ['REVENUE MODEL', startupDetails.revenueModel],
              ['FUNDING',       startupDetails.availableFunding],
              ['TIMELINE',      startupDetails.mvpTimeline],
            ].map(([label, val], i) => (
              <React.Fragment key={label}>
                {i > 0 && <div className="h-8 w-[1px] bg-indigo-500/10 hidden sm:block" />}
                <div>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{label}</span>
                  <p className="text-xs font-bold text-white mt-0.5">{val || 'N/A'}</p>
                </div>
              </React.Fragment>
            ))}
          </div>

          {/* Score Cards Grid */}
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-4">Score Overview</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {metricMeta.map((m) => {
                const Icon = m.icon;
                const sd   = analysisScores[m.id];
                return (
                  <AnalysisCard
                    key={m.id}
                    label={m.label}
                    score={sd.score}
                    status={sd.status}
                    details={sd.details}
                    icon={Icon}
                  />
                );
              })}
            </div>
          </section>

          {/* Rich Agent Detail Sections */}
          {agents.some(a => a.data) && (
            <section className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400">Deep Analysis</h2>

              {agents.map(({ key, label, icon: Icon, data }) => {
                if (!data) return null;
                const isOpen = expandedAgent === key;

                return (
                  <div key={key} className="rounded-xl border border-indigo-500/10 bg-[#0d0d14] overflow-hidden">

                    {/* Agent Header — always visible */}
                    <button
                      onClick={() => setExpandedAgent(isOpen ? null : key)}
                      className="w-full flex items-center justify-between px-6 py-4 hover:bg-indigo-500/5 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-indigo-500/10">
                          <Icon className="h-4 w-4 text-indigo-400" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-bold text-white">{label}</p>
                          <p className={`text-xs font-semibold ${statusColor(data.verdict)}`}>
                            {data.verdict || 'N/A'} · Score: {Math.round(data.score || 0)}
                          </p>
                        </div>
                      </div>
                      {isOpen ? <ChevronUp className="h-4 w-4 text-gray-500" /> : <ChevronDown className="h-4 w-4 text-gray-500" />}
                    </button>

                    {/* Expanded Agent Details */}
                    {isOpen && (
                      <div className="px-6 pb-6 space-y-5 border-t border-indigo-500/5 pt-4">

                        {/* Summary */}
                        {data.summary && (
                          <p className="text-xs text-gray-400 leading-relaxed">{data.summary}</p>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                          {/* Strengths */}
                          {data.strengths?.length > 0 && (
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 mb-2">Strengths</p>
                              {renderList(data.strengths, <CheckCircle className="h-3 w-3 text-emerald-500" />, 'text-gray-300')}
                            </div>
                          )}

                          {/* Weaknesses */}
                          {data.weaknesses?.length > 0 && (
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-wider text-rose-400 mb-2">Weaknesses</p>
                              {renderList(data.weaknesses, <XCircle className="h-3 w-3 text-rose-500" />, 'text-gray-300')}
                            </div>
                          )}

                          {/* Key Competitors */}
                          {data.key_competitors?.length > 0 && (
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-wider text-yellow-400 mb-2">Key Competitors</p>
                              {renderList(data.key_competitors, '⚔', 'text-gray-300')}
                            </div>
                          )}

                          {/* Competitive Gaps */}
                          {data.competitive_gaps?.length > 0 && (
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 mb-2">Competitive Gaps</p>
                              {renderList(data.competitive_gaps, '→', 'text-gray-300')}
                            </div>
                          )}

                          {/* Demand Signals */}
                          {data.demand_signals?.length > 0 && (
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-wider text-teal-400 mb-2">Demand Signals</p>
                              {renderList(data.demand_signals, '↑', 'text-gray-300')}
                            </div>
                          )}

                          {/* Risks */}
                          {data.risks?.length > 0 && (
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-wider text-orange-400 mb-2">Risks</p>
                              {renderList(data.risks, <AlertCircle className="h-3 w-3 text-orange-400" />, 'text-gray-300')}
                            </div>
                          )}

                          {/* Innovation Factors */}
                          {data.innovation_factors?.length > 0 && (
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-wider text-purple-400 mb-2">Innovation Factors</p>
                              {renderList(data.innovation_factors, <Sparkles className="h-3 w-3 text-purple-400" />, 'text-gray-300')}
                            </div>
                          )}

                          {/* Recommendations */}
                          {data.recommendations?.length > 0 && (
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-wider text-blue-400 mb-2">Recommendations</p>
                              {renderList(data.recommendations, '✓', 'text-gray-300')}
                            </div>
                          )}
                        </div>

                        {/* Single-value fields */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                          {data.tam_signal && (
                            <div className="rounded-lg bg-indigo-500/5 border border-indigo-500/10 px-4 py-3">
                              <p className="text-[10px] font-bold uppercase text-indigo-400 tracking-wider">TAM Signal</p>
                              <p className="text-xs text-gray-300 mt-1">{data.tam_signal}</p>
                            </div>
                          )}
                          {data.timing_assessment && (
                            <div className="rounded-lg bg-indigo-500/5 border border-indigo-500/10 px-4 py-3">
                              <p className="text-[10px] font-bold uppercase text-indigo-400 tracking-wider">Market Timing</p>
                              <p className="text-xs text-gray-300 mt-1">{data.timing_assessment}</p>
                            </div>
                          )}
                          {data.usp_statement && (
                            <div className="rounded-lg bg-purple-500/5 border border-purple-500/10 px-4 py-3">
                              <p className="text-[10px] font-bold uppercase text-purple-400 tracking-wider">USP Statement</p>
                              <p className="text-xs text-gray-300 mt-1">{data.usp_statement}</p>
                            </div>
                          )}
                          {data.defensibility && (
                            <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/10 px-4 py-3">
                              <p className="text-[10px] font-bold uppercase text-emerald-400 tracking-wider">Defensibility</p>
                              <p className="text-xs text-gray-300 mt-1">{data.defensibility}</p>
                            </div>
                          )}
                          {data.differentiation_strength && (
                            <div className="rounded-lg bg-yellow-500/5 border border-yellow-500/10 px-4 py-3">
                              <p className="text-[10px] font-bold uppercase text-yellow-400 tracking-wider">Differentiation</p>
                              <p className="text-xs text-gray-300 mt-1">{data.differentiation_strength}</p>
                            </div>
                          )}
                          {data.overall_risk_level && (
                            <div className="rounded-lg bg-rose-500/5 border border-rose-500/10 px-4 py-3">
                              <p className="text-[10px] font-bold uppercase text-rose-400 tracking-wider">Overall Risk</p>
                              <p className={`text-xs font-bold mt-1 ${statusColor(data.overall_risk_level)}`}>{data.overall_risk_level}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </section>
          )}

          {/* Back to Dashboard */}
          <div className="pt-4 flex justify-start">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 rounded-xl border border-indigo-500/20 bg-indigo-500/5 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-indigo-400 hover:bg-indigo-500/10 hover:text-white transition-all duration-300"
            >
              <LayoutDashboard className="h-4 w-4" />
              Return to Dashboard
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
