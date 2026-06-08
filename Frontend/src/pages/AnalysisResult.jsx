import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStartup } from '../context/StartupContext';
import { useToast } from '../context/ToastContext';
import Navbar from '../components/Navbar';
import {
  Sparkles, TrendingUp, Target, Users, Gauge, AlertCircle,
  Zap, Layers, Search, Download, Save, ShieldAlert, Lightbulb,
  Swords, ChevronDown, ChevronUp, Globe, DollarSign, Clock,
  BarChart2, Award, Cpu, CheckCircle2, XCircle, Rocket,
  FileText, Database, Activity, ArrowRight, Star, RefreshCw,
  LayoutDashboard, TrendingDown, BookOpen, Shield
} from 'lucide-react';

// ── Helpers ──────────────────────────────────────────────────────────────────

const sc = (s) => s >= 70 ? 'var(--green)' : s >= 45 ? 'var(--amber)' : 'var(--red)';
const vm = (v = '') => {
  const x = v.toLowerCase();
  if (x.includes('high') || x.includes('strong') || x.includes('excellent') || x.includes('low risk'))
    return { color: 'var(--green)', bg: 'var(--green-bg)', border: 'var(--green-border)', cls: 'badge badge-green' };
  if (x.includes('medium') || x.includes('moderate'))
    return { color: 'var(--amber)', bg: 'var(--amber-bg)', border: 'var(--amber-border)', cls: 'badge badge-amber' };
  return   { color: 'var(--red)',   bg: 'var(--red-bg)',   border: 'var(--red-border)',   cls: 'badge badge-red'   };
};

const gradeOf = (score) => {
  if (score >= 80) return { letter: 'A', label: 'Excellent',  color: 'var(--green)', bg: 'var(--green-bg)', border: 'var(--green-border)' };
  if (score >= 65) return { letter: 'B', label: 'Good',       color: 'var(--brand-light)', bg: 'var(--brand-bg)', border: 'var(--brand-border)' };
  if (score >= 50) return { letter: 'C', label: 'Moderate',   color: 'var(--amber)', bg: 'var(--amber-bg)', border: 'var(--amber-border)' };
  return              { letter: 'D', label: 'Needs Work', color: 'var(--red)',   bg: 'var(--red-bg)',   border: 'var(--red-border)'   };
};

// Animated score number
const AnimatedScore = ({ score, size = 100, stroke = 9 }) => {
  const [current, setCurrent] = useState(0);
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  useEffect(() => {
    let s = 0;
    const step = Math.ceil(score / 40);
    const id = setInterval(() => {
      s += step;
      if (s >= score) { setCurrent(score); clearInterval(id); } else setCurrent(s);
    }, 30);
    return () => clearInterval(id);
  }, [score]);
  const color = sc(score);
  const offset = circ * (1 - current / 100);
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)', display: 'block' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--surface3)" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.05s linear' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: size * 0.24, fontWeight: 900, color, lineHeight: 1, fontFamily: 'var(--font-mono)' }}>{current}</span>
        <span style={{ fontSize: size * 0.09, color: 'var(--text3)', fontWeight: 600 }}>/100</span>
      </div>
    </div>
  );
};

// Mini score bar
const ScoreBar = ({ score, label }) => (
  <div>
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
      <span style={{ color: 'var(--text2)', fontWeight: 500 }}>{label}</span>
      <span style={{ color: sc(score), fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{score}</span>
    </div>
    <div className="progress-track" style={{ height: 5 }}>
      <div className="progress-fill" style={{ width: `${score}%`, height: '100%', background: `linear-gradient(90deg, ${sc(score)}, ${sc(score)}aa)` }} />
    </div>
  </div>
);

// Bullet list
const BulletList = ({ items, color, max = 5 }) => {
  if (!items?.length) return <span style={{ fontSize: 12, color: 'var(--text3)', fontStyle: 'italic' }}>No data available</span>;
  return (
    <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
      {items.slice(0, max).map((item, i) => (
        <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: 'var(--text2)', lineHeight: 1.6 }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: color, flexShrink: 0, marginTop: 7 }} />
          {item}
        </li>
      ))}
    </ul>
  );
};

// Tag chips
const TagChips = ({ items, color, bg, border }) => {
  if (!items?.length) return null;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {items.map((item, i) => (
        <span key={i} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 99, background: bg, border: `1px solid ${border}`, color, fontWeight: 600 }}>
          {item}
        </span>
      ))}
    </div>
  );
};

// Section header
const SectionHead = ({ icon: Icon, label, color = 'var(--brand-light)', count }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
    <div style={{ width: 30, height: 30, borderRadius: 8, background: color + '18', border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={14} style={{ color }} />
    </div>
    <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--text1)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
    {count !== undefined && (
      <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 99, background: 'var(--surface3)', color: 'var(--text3)', fontWeight: 700, marginLeft: 'auto' }}>
        {count}
      </span>
    )}
  </div>
);

// ── Main ──────────────────────────────────────────────────────────────────────
const AnalysisResult = () => {
  const navigate   = useNavigate();
  const { showToast } = useToast();
  const { analysisScores, fullAnalysisData, startupDetails, saveAnalysis } = useStartup();
  const [expandedAgent, setExpandedAgent] = useState(null);
  const [activeTab, setActiveTab]         = useState('overview');

  const handleSave = () => { saveAnalysis(analysisScores); setTimeout(() => navigate('/roadmap'), 1200); };
  const handleExport = () => showToast('PDF export coming in V2.0!', 'info');

  if (!analysisScores) {
    return (
      <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
        <Navbar />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: 'var(--red-bg)', border: '1px solid var(--red-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertCircle size={24} style={{ color: 'var(--red)' }} />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text1)', margin: 0 }}>No Analysis Found</h2>
          <p style={{ fontSize: 13, color: 'var(--text2)', margin: 0 }}>Please run a validation first.</p>
          <button onClick={() => navigate('/startup/validate')} className="btn btn-primary" style={{ marginTop: 8 }}>Go to Validation</button>
        </div>
      </div>
    );
  }

  // ── Derived data ──────────────────────────────────────────────────────────
  const ap  = fullAnalysisData?.analysis_phase_state || {};
  const qp  = fullAnalysisData?.query_phase_state    || {};
  const pp  = fullAnalysisData?.pitch_state          || {};

  const scoreValues = Object.values(analysisScores).filter(s => s && typeof s.score === 'number');
  const overall     = Math.round(scoreValues.reduce((a, s) => a + s.score, 0) / Math.max(1, scoreValues.length));
  const grade       = gradeOf(overall);

  const fe  = ap.feasibility        || {};
  const mo  = ap.market_opportunity  || {};
  const co  = ap.competition         || {};
  const ri  = ap.risk                || {};
  const inn = ap.innovation_usp      || {};

  const agents = [
    { key: 'feasibility',      label: 'Feasibility',     icon: Search,      data: fe,  color: 'var(--brand-light)' },
    { key: 'market',           label: 'Market',          icon: TrendingUp,  data: mo,  color: 'var(--green)'       },
    { key: 'competition',      label: 'Competition',     icon: Swords,      data: co,  color: 'var(--amber)'       },
    { key: 'risk',             label: 'Risk',            icon: ShieldAlert, data: ri,  color: 'var(--red)'         },
    { key: 'innovation',       label: 'Innovation',      icon: Lightbulb,   data: inn, color: 'var(--cyan)'        },
  ];

  const metricRows = [
    { id: 'marketDemand',       label: 'Market Demand',       icon: TrendingUp  },
    { id: 'targetAudienceFit',  label: 'Audience Fit',        icon: Target      },
    { id: 'problemSolutionFit', label: 'Problem-Solution',    icon: Sparkles    },
    { id: 'competitorPresence', label: 'Competitor Landscape',icon: Users       },
    { id: 'revenuePotential',   label: 'Revenue Potential',   icon: DollarSign  },
    { id: 'riskLevel',          label: 'Risk Exposure',       icon: ShieldAlert },
    { id: 'innovationLevel',    label: 'Innovation Score',    icon: Zap         },
    { id: 'scalability',        label: 'Scalability',         icon: Layers      },
    { id: 'feasibility',        label: 'Feasibility',         icon: Cpu         },
  ];

  const TABS = [
    { id: 'overview',    label: 'Overview',    icon: BarChart2  },
    { id: 'market',      label: 'Market',      icon: TrendingUp },
    { id: 'competition', label: 'Competition', icon: Swords     },
    { id: 'risks',       label: 'Risks',       icon: Shield     },
    { id: 'intelligence',label: 'Intelligence',icon: Database   },
    { id: 'pitch',       label: 'Pitch',       icon: BookOpen   },
  ];

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text1)' }}>
      <Navbar />

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 20px 80px' }}>

        {/* ── HERO HEADER ── */}
        <div className="animate-fade-up" style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
            <div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                <span className="badge badge-brand"><Sparkles size={10} /> Analysis Complete</span>
                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: grade.color, background: grade.bg, border: `1px solid ${grade.border}`, borderRadius: 99, padding: '3px 10px', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Award size={10} /> Grade {grade.letter} · {grade.label}
                </span>
              </div>
              <h1 style={{ fontSize: 28, fontWeight: 900, color: 'var(--text1)', margin: 0, letterSpacing: '-0.03em', marginBottom: 4 }}>
                {startupDetails.startupName || 'Venture Proposal'}
              </h1>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {[[Globe, startupDetails.startupDomain], [DollarSign, startupDetails.revenueModel], [Clock, startupDetails.mvpTimeline]].filter(([,v]) => v).map(([Icon, val], i) => (
                  <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text2)', padding: '4px 10px', borderRadius: 99, background: 'var(--surface)', border: '1px solid var(--border)' }}>
                    <Icon size={11} style={{ color: 'var(--brand-light)' }} /> {val}
                  </span>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', flexShrink: 0 }}>
              <button onClick={() => navigate('/analysis/loader')} className="btn btn-outline btn-sm">
                <RefreshCw size={12} /> Re-run
              </button>
              <button onClick={handleExport} className="btn btn-outline btn-sm">
                <Download size={12} /> Export
              </button>
              <button onClick={handleSave} className="btn btn-primary btn-sm">
                <Save size={12} /> Save & Finish
              </button>
            </div>
          </div>

          {/* Score + Grade hero card */}
          <div className="gradient-border" style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap', background: 'var(--surface)' }}>
            <AnimatedScore score={overall} size={120} stroke={10} />

            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ fontSize: 32, fontWeight: 900, color: grade.color, lineHeight: 1, marginBottom: 6, fontFamily: 'var(--font-heading)' }}>{grade.label} Viability</div>
              <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7, margin: '0 0 14px' }}>
                {fe.summary || mo.summary || `Your startup scored ${overall}/100 across market, competition, innovation, risk, and feasibility dimensions.`}
              </p>
              <div style={{ display: 'flex', gap: 16 }}>
                {[
                  { label: 'AI Agents',   val: '5',   color: 'var(--brand-light)' },
                  { label: 'Dimensions',  val: '9',   color: 'var(--cyan)'        },
                  { label: 'Data Points', val: '250+',color: 'var(--green)'       },
                ].map(({ label, val, color }) => (
                  <div key={label}>
                    <div style={{ fontSize: 20, fontWeight: 900, color, fontFamily: 'var(--font-mono)', lineHeight: 1 }}>{val}</div>
                    <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Score bars for all 9 metrics */}
            <div style={{ width: 240, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {metricRows.slice(0, 5).map(({ id, label }) => {
                const s = analysisScores[id]?.score || 0;
                return <ScoreBar key={id} score={s} label={label} />;
              })}
            </div>
          </div>
        </div>

        {/* ── TAB NAV ── */}
        <div style={{ display: 'flex', gap: 2, marginBottom: 24, background: 'var(--surface)', padding: 4, borderRadius: 12, overflowX: 'auto', border: '1px solid var(--border)' }}>
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 8, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap', flexShrink: 0,
                background: activeTab === id ? 'var(--brand)' : 'transparent',
                color: activeTab === id ? '#fff' : 'var(--text2)',
              }}
              onMouseEnter={e => { if (activeTab !== id) e.currentTarget.style.color = 'var(--text1)'; }}
              onMouseLeave={e => { if (activeTab !== id) e.currentTarget.style.color = 'var(--text2)'; }}>
              <Icon size={12} /> {label}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════════════════════
            TAB: OVERVIEW
        ══════════════════════════════════════════════════════ */}
        {activeTab === 'overview' && (
          <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* 9-Metric grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
              {metricRows.map(({ id, label, icon: Icon }) => {
                const sd = analysisScores[id] || { score: 0, status: 'N/A', details: '' };
                const color = sc(sd.score);
                const badge = vm(sd.status);
                return (
                  <div key={id} className="glass-card" style={{ padding: '16px 18px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: color + '15', border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={18} style={{ color }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text1)', marginBottom: 4 }}>{label}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <span style={{ fontSize: 22, fontWeight: 900, color, fontFamily: 'var(--font-mono)', lineHeight: 1 }}>{sd.score}</span>
                        <span className={badge.cls} style={{ fontSize: 9 }}>{sd.status}</span>
                      </div>
                      {sd.details && <div style={{ fontSize: 11, color: 'var(--text2)', lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{sd.details}</div>}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Agent accordion */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <h3 style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text3)', margin: '8px 0 4px' }}>Deep AI Analysis</h3>
              {agents.map(({ key, label, icon: Icon, data, color }) => {
                if (!data?.summary && !data?.verdict) return null;
                const isOpen  = expandedAgent === key;
                const agentBadge = vm(data.verdict || '');
                const agentScore = Math.round(data.score || 0);
                return (
                  <div key={key} className={`agent-card${isOpen ? ' open' : ''}`} style={{ borderColor: isOpen ? color + '40' : 'var(--border)', transition: 'all 0.2s' }}>
                    <button onClick={() => setExpandedAgent(isOpen ? null : key)}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: 'transparent', border: 'none', cursor: 'pointer', gap: 14, textAlign: 'left' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 38, height: 38, borderRadius: 10, background: color + '18', border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Icon size={16} style={{ color }} />
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text1)', marginBottom: 3 }}>{label} Analysis</div>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <span className={agentBadge.cls} style={{ fontSize: 9 }}>{data.verdict || 'N/A'}</span>
                            <span style={{ fontSize: 10, color: 'var(--text3)' }}>Score: <strong style={{ color: sc(agentScore) }}>{agentScore}/100</strong></span>
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                        <span style={{ fontSize: 18, fontWeight: 900, color: sc(agentScore), fontFamily: 'var(--font-mono)' }}>{agentScore}</span>
                        {isOpen ? <ChevronUp size={15} style={{ color: 'var(--text3)' }} /> : <ChevronDown size={15} style={{ color: 'var(--text3)' }} />}
                      </div>
                    </button>

                    <div style={{ maxHeight: isOpen ? '2000px' : 0, overflow: 'hidden', transition: 'max-height 0.4s cubic-bezier(0.4,0,0.2,1)' }}>
                      <div style={{ borderTop: '1px solid var(--border)', padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 18 }}>
                        {data.summary && (
                          <div style={{ padding: '14px 18px', background: 'var(--surface2)', borderRadius: 10, borderLeft: `3px solid ${color}` }}>
                            <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color, marginBottom: 8 }}>Summary</div>
                            <p style={{ fontSize: 13, color: 'var(--text1)', lineHeight: 1.75, margin: 0, fontWeight: 500 }}>{data.summary}</p>
                          </div>
                        )}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
                          {[
                            { title: 'Strengths',          items: data.strengths,           color: 'var(--green)'       },
                            { title: 'Weaknesses',         items: data.weaknesses,          color: 'var(--red)'         },
                            { title: 'Recommendations',    items: data.recommendations,     color: 'var(--brand-light)' },
                            { title: 'Key Competitors',    items: data.key_competitors,     color: 'var(--amber)'       },
                            { title: 'Competitive Gaps',   items: data.competitive_gaps,    color: 'var(--cyan)'        },
                            { title: 'Demand Signals',     items: data.demand_signals,      color: 'var(--green)'       },
                            { title: 'Risk Factors',       items: data.risks,               color: 'var(--red)'         },
                            { title: 'Innovation Factors', items: data.innovation_factors,  color: 'var(--cyan)'        },
                          ].filter(s => s.items?.length).map(({ title, items, color: c }) => (
                            <div key={title} style={{ padding: '14px 16px', background: 'var(--surface2)', borderRadius: 10, border: '1px solid var(--border)' }}>
                              <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: c, marginBottom: 10 }}>✦ {title}</div>
                              <BulletList items={items} color={c} />
                            </div>
                          ))}
                        </div>
                        {/* Insight pills */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                          {[
                            data.tam_signal         && { label: 'TAM',           val: data.tam_signal,            color: 'var(--brand-light)', bg: 'var(--brand-bg)', border: 'var(--brand-border)' },
                            data.timing_assessment  && { label: 'Timing',        val: data.timing_assessment,     color: 'var(--cyan)',        bg: 'var(--cyan-bg)',  border: 'var(--cyan-border)'  },
                            data.usp_statement      && { label: 'USP',           val: data.usp_statement,         color: 'var(--brand-light)', bg: 'var(--brand-bg)', border: 'var(--brand-border)' },
                            data.defensibility      && { label: 'Defensibility', val: data.defensibility,         color: 'var(--green)',       bg: 'var(--green-bg)', border: 'var(--green-border)' },
                            data.overall_risk_level && { label: 'Risk Level',    val: data.overall_risk_level,    color: 'var(--red)',         bg: 'var(--red-bg)',   border: 'var(--red-border)'   },
                            data.differentiation_strength && { label: 'Differentiation', val: data.differentiation_strength, color: 'var(--amber)', bg: 'var(--amber-bg)', border: 'var(--amber-border)' },
                          ].filter(Boolean).map(({ label, val, color: c, bg, border }) => (
                            <div key={label} style={{ padding: '10px 14px', background: bg, border: `1px solid ${border}`, borderRadius: 10, maxWidth: 280 }}>
                              <div style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: c, marginBottom: 4 }}>{label}</div>
                              <div style={{ fontSize: 12, color: 'var(--text1)', lineHeight: 1.5 }}>{val}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            TAB: MARKET
        ══════════════════════════════════════════════════════ */}
        {activeTab === 'market' && (
          <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>

              {/* Market Score */}
              <div className="glass-card" style={{ padding: 22 }}>
                <SectionHead icon={TrendingUp} label="Market Opportunity" color="var(--green)" />
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                  <div style={{ fontSize: 48, fontWeight: 900, color: sc(mo.score || 0), fontFamily: 'var(--font-mono)', lineHeight: 1 }}>{Math.round(mo.score || 0)}</div>
                  <div>
                    <span className={vm(mo.verdict || '').cls}>{mo.verdict || 'N/A'}</span>
                    <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4 }}>out of 100</div>
                  </div>
                </div>
                {mo.summary && <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7, margin: 0 }}>{mo.summary}</p>}
              </div>

              {/* TAM */}
              {mo.tam_signal && (
                <div className="glass-card" style={{ padding: 22, borderColor: 'var(--green-border)', background: 'var(--green-bg)' }}>
                  <SectionHead icon={Globe} label="TAM Signal" color="var(--green)" />
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text1)', lineHeight: 1.6, margin: 0 }}>{mo.tam_signal}</p>
                </div>
              )}

              {/* Market timing */}
              {mo.timing_assessment && (
                <div className="glass-card" style={{ padding: 22 }}>
                  <SectionHead icon={Clock} label="Market Timing" color="var(--cyan)" />
                  <p style={{ fontSize: 13, color: 'var(--text1)', lineHeight: 1.7, margin: 0 }}>{mo.timing_assessment}</p>
                </div>
              )}

              {/* Demand signals */}
              {mo.demand_signals?.length > 0 && (
                <div className="glass-card" style={{ padding: 22 }}>
                  <SectionHead icon={Activity} label="Demand Signals" color="var(--green)" count={mo.demand_signals.length} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {mo.demand_signals.map((s, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 10px', background: 'var(--surface2)', borderRadius: 8, border: '1px solid var(--border)' }}>
                        <CheckCircle2 size={13} style={{ color: 'var(--green)', flexShrink: 0, marginTop: 1 }} />
                        <span style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.5 }}>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {mo.recommendations?.length > 0 && (
                <div className="glass-card" style={{ padding: 22 }}>
                  <SectionHead icon={Lightbulb} label="Market Recommendations" color="var(--brand-light)" />
                  <BulletList items={mo.recommendations} color="var(--brand-light)" />
                </div>
              )}

              {/* Query phase stats */}
              {qp.total_agents && (
                <div className="glass-card" style={{ padding: 22 }}>
                  <SectionHead icon={Database} label="Data Collection Stats" color="var(--cyan)" />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {[
                      { label: 'Agents Run',       val: qp.total_agents,       color: 'var(--brand-light)' },
                      { label: 'Successful',        val: qp.successful_agents,  color: 'var(--green)'       },
                      { label: 'Docs Indexed',      val: qp.total_docs_indexed, color: 'var(--cyan)'        },
                      { label: 'Failed',            val: qp.failed_agents || 0, color: qp.failed_agents > 0 ? 'var(--red)' : 'var(--text3)' },
                    ].map(({ label, val, color: c }) => (
                      <div key={label} style={{ padding: '10px 12px', background: 'var(--surface2)', borderRadius: 8, border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: 20, fontWeight: 900, color: c, fontFamily: 'var(--font-mono)', lineHeight: 1 }}>{val}</div>
                        <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 3 }}>{label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            TAB: COMPETITION
        ══════════════════════════════════════════════════════ */}
        {activeTab === 'competition' && (
          <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>

              {/* Competition score */}
              <div className="glass-card" style={{ padding: 22 }}>
                <SectionHead icon={Swords} label="Competition Analysis" color="var(--amber)" />
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
                  <div style={{ fontSize: 48, fontWeight: 900, color: sc(co.score || 0), fontFamily: 'var(--font-mono)', lineHeight: 1 }}>{Math.round(co.score || 0)}</div>
                  <span className={vm(co.verdict || '').cls}>{co.verdict || 'N/A'}</span>
                </div>
                {co.summary && <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7, margin: 0 }}>{co.summary}</p>}
              </div>

              {/* Key competitors */}
              {co.key_competitors?.length > 0 && (
                <div className="glass-card" style={{ padding: 22 }}>
                  <SectionHead icon={Users} label="Key Competitors" color="var(--amber)" count={co.key_competitors.length} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {co.key_competitors.map((c_, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'var(--surface2)', borderRadius: 8, border: '1px solid var(--border)' }}>
                        <div style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--amber-bg)', border: '1px solid var(--amber-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: 'var(--amber)', flexShrink: 0 }}>
                          {i + 1}
                        </div>
                        <span style={{ fontSize: 13, color: 'var(--text1)', fontWeight: 500 }}>{c_}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Competitive gaps */}
              {co.competitive_gaps?.length > 0 && (
                <div className="glass-card" style={{ padding: 22 }}>
                  <SectionHead icon={Target} label="Competitive Gaps to Exploit" color="var(--green)" count={co.competitive_gaps.length} />
                  <BulletList items={co.competitive_gaps} color="var(--green)" />
                </div>
              )}

              {/* Differentiation */}
              {(co.differentiation_strength || co.differentiation_vs_competitors?.length > 0) && (
                <div className="glass-card" style={{ padding: 22, borderColor: 'var(--brand-border)', background: 'var(--brand-bg)' }}>
                  <SectionHead icon={Star} label="Differentiation" color="var(--brand-light)" />
                  {co.differentiation_strength && (
                    <p style={{ fontSize: 13, color: 'var(--text1)', lineHeight: 1.7, margin: '0 0 12px' }}>{co.differentiation_strength}</p>
                  )}
                  {co.differentiation_vs_competitors?.length > 0 && (
                    <TagChips items={co.differentiation_vs_competitors} color="var(--brand-light)" bg="var(--brand-bg)" border="var(--brand-border)" />
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            TAB: RISKS
        ══════════════════════════════════════════════════════ */}
        {activeTab === 'risks' && (
          <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>

              {/* Risk score */}
              <div className="glass-card" style={{ padding: 22, borderColor: ri.overall_risk_level?.toLowerCase().includes('high') ? 'var(--red-border)' : 'var(--border)' }}>
                <SectionHead icon={ShieldAlert} label="Risk Assessment" color="var(--red)" />
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
                  <div style={{ fontSize: 48, fontWeight: 900, color: sc(ri.score || 0), fontFamily: 'var(--font-mono)', lineHeight: 1 }}>{Math.round(ri.score || 0)}</div>
                  <div>
                    <span className={vm(ri.verdict || '').cls}>{ri.verdict || 'N/A'}</span>
                    {ri.overall_risk_level && <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 4 }}>Level: <strong style={{ color: 'var(--red)' }}>{ri.overall_risk_level}</strong></div>}
                  </div>
                </div>
                {ri.summary && <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7, margin: 0 }}>{ri.summary}</p>}
              </div>

              {/* Risk factors */}
              {ri.risks?.length > 0 && (
                <div className="glass-card" style={{ padding: 22 }}>
                  <SectionHead icon={AlertCircle} label="Risk Factors" color="var(--red)" count={ri.risks.length} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {ri.risks.map((r_, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 12px', background: 'var(--red-bg)', borderRadius: 8, border: '1px solid var(--red-border)' }}>
                        <XCircle size={13} style={{ color: 'var(--red)', flexShrink: 0, marginTop: 1 }} />
                        <span style={{ fontSize: 12, color: 'var(--text1)', lineHeight: 1.5 }}>{r_}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mitigation recommendations */}
              {ri.recommendations?.length > 0 && (
                <div className="glass-card" style={{ padding: 22 }}>
                  <SectionHead icon={Shield} label="Risk Mitigation" color="var(--green)" />
                  <BulletList items={ri.recommendations} color="var(--green)" />
                </div>
              )}

              {/* Feasibility */}
              <div className="glass-card" style={{ padding: 22 }}>
                <SectionHead icon={Gauge} label="Feasibility Check" color="var(--brand-light)" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { label: 'Strengths',    items: fe.strengths,       color: 'var(--green)' },
                    { label: 'Weaknesses',   items: fe.weaknesses,      color: 'var(--red)'   },
                  ].filter(s => s.items?.length).map(({ label, items, color: c }) => (
                    <div key={label}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: c, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{label}</div>
                      <BulletList items={items} color={c} max={3} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            TAB: INTELLIGENCE (USP + Innovation)
        ══════════════════════════════════════════════════════ */}
        {activeTab === 'intelligence' && (
          <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>

              {/* Innovation score */}
              <div className="glass-card" style={{ padding: 22 }}>
                <SectionHead icon={Zap} label="Innovation Score" color="var(--cyan)" />
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
                  <div style={{ fontSize: 48, fontWeight: 900, color: sc(inn.score || 0), fontFamily: 'var(--font-mono)', lineHeight: 1 }}>{Math.round(inn.score || 0)}</div>
                  <span className={vm(inn.verdict || '').cls}>{inn.verdict || 'N/A'}</span>
                </div>
                {inn.summary && <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7, margin: 0 }}>{inn.summary}</p>}
              </div>

              {/* USP */}
              {inn.usp_statement && (
                <div className="glass-card" style={{ padding: 22, borderColor: 'var(--cyan-border)', background: 'var(--cyan-bg)' }}>
                  <SectionHead icon={Lightbulb} label="Unique Selling Proposition" color="var(--cyan)" />
                  <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text1)', lineHeight: 1.6, margin: 0, fontStyle: 'italic' }}>"{inn.usp_statement}"</p>
                </div>
              )}

              {/* Defensibility */}
              {inn.defensibility && (
                <div className="glass-card" style={{ padding: 22 }}>
                  <SectionHead icon={Shield} label="Defensibility" color="var(--green)" />
                  <p style={{ fontSize: 13, color: 'var(--text1)', lineHeight: 1.7, margin: 0 }}>{inn.defensibility}</p>
                </div>
              )}

              {/* Innovation factors */}
              {inn.innovation_factors?.length > 0 && (
                <div className="glass-card" style={{ padding: 22 }}>
                  <SectionHead icon={Sparkles} label="Innovation Factors" color="var(--cyan)" count={inn.innovation_factors.length} />
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {inn.innovation_factors.map((f, i) => (
                      <span key={i} style={{ fontSize: 11, padding: '5px 12px', borderRadius: 99, background: 'var(--cyan-bg)', border: '1px solid var(--cyan-border)', color: 'var(--cyan)', fontWeight: 600 }}>
                        ⚡ {f}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            TAB: PITCH
        ══════════════════════════════════════════════════════ */}
        {activeTab === 'pitch' && (
          <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {pp.pitch_text ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16, alignItems: 'start' }}>

                {/* Pitch text */}
                <div className="glass-card" style={{ padding: 28 }}>
                  <SectionHead icon={BookOpen} label="AI-Generated Pitch" color="var(--brand-light)" />
                  <div style={{ fontSize: 14, color: 'var(--text1)', lineHeight: 1.85, whiteSpace: 'pre-wrap', fontWeight: 400 }}>
                    {pp.pitch_text}
                  </div>
                </div>

                {/* Pitch stats */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { label: 'Pitch Length',    val: `${pp.pitch_length || 0} chars`,    color: 'var(--brand-light)' },
                    { label: 'Docs Indexed',    val: pp.indexed_chunks || 0,              color: 'var(--cyan)'        },
                    { label: 'Startup',         val: pp.startup_name || startupDetails.startupName, color: 'var(--text1)' },
                  ].map(({ label, val, color: c }) => (
                    <div key={label} className="glass-card" style={{ padding: '14px 16px' }}>
                      <div style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>{label}</div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: c, fontFamily: 'var(--font-mono)' }}>{val}</div>
                    </div>
                  ))}
                  <button onClick={() => { navigator.clipboard?.writeText(pp.pitch_text); showToast('Pitch copied!', 'success'); }}
                    className="btn btn-outline" style={{ justifyContent: 'center' }}>
                    <FileText size={13} /> Copy Pitch
                  </button>
                </div>
              </div>
            ) : (
              <div className="glass-card" style={{ padding: 48, textAlign: 'center' }}>
                <BookOpen size={32} style={{ color: 'var(--text3)', margin: '0 auto 12px' }} />
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text2)' }}>No pitch data available</div>
                <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>Run a new validation to generate your AI pitch</div>
              </div>
            )}
          </div>
        )}

        {/* ── CTA Footer ── */}
        <div className="gradient-border animate-fade-up delay-300" style={{ padding: '22px 26px', marginTop: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text1)', marginBottom: 3 }}>Ready to build your execution roadmap?</div>
            <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.6 }}>Save this analysis and generate an AI-powered task roadmap for your team.</div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => navigate('/dashboard')} className="btn btn-outline btn-sm">
              <LayoutDashboard size={12} /> Dashboard
            </button>
            <button onClick={handleSave} className="btn btn-primary">
              <Rocket size={13} /> Save & Build Roadmap
            </button>
          </div>
        </div>

      </main>
    </div>
  );
};

export default AnalysisResult;
