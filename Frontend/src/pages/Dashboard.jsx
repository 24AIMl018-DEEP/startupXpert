import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStartup } from '../context/StartupContext';
import { useToast } from '../context/ToastContext';
import { fetchUserSessions } from '../services/startupApi';
import DashboardLayout from '../layouts/DashboardLayout';
import {
  Sparkles, Layers, FileText, Compass, ArrowUpRight, Clock,
  Plus, Trash2, Play, Briefcase, BarChart2, ChevronRight,
  AlertTriangle, Gauge, Zap, Activity, TrendingUp, Quote,
  ShieldCheck, Target, Globe, Map, Cpu, LineChart
} from 'lucide-react';

// ── Quotes ───────────────────────────────────────────────────────────────────
const QUOTES = [
  { text: "The best time to start a startup is now. The second best time was yesterday.", author: "Reid Hoffman" },
  { text: "Ideas are easy. Implementation is hard.", author: "Guy Kawasaki" },
  { text: "Make something people want.", author: "Paul Graham, YC" },
  { text: "Move fast and learn things. Break assumptions, not systems.", author: "StartupXpert" },
  { text: "Your startup is a hypothesis. Validate it before you build it.", author: "Eric Ries" },
  { text: "The only metric that matters is whether customers love what you build.", author: "Sam Altman" },
  { text: "Start before you're ready. You will never be fully ready.", author: "StartupXpert" },
  { text: "Fall in love with the problem, not your solution.", author: "Uri Levine, Waze" },
  { text: "Execution separates the dreamers from the builders.", author: "StartupXpert" },
  { text: "Your first version will be wrong. Ship it anyway.", author: "Paul Buchheit" },
];

// ── Live clock ────────────────────────────────────────────────────────────────
const useLiveClock = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return time;
};

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 5)  return 'Up late';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  if (h < 21) return 'Good evening';
  return 'Good night';
};

const riskBadge = (risk = '') => {
  const r = risk.toLowerCase();
  if (r.includes('low'))    return 'badge badge-green';
  if (r.includes('medium')) return 'badge badge-amber';
  return 'badge badge-red';
};

// ── Quote Banner ──────────────────────────────────────────────────────────────
const QuoteBanner = () => {
  const [idx, setIdx] = useState(() => Math.floor(Math.random() * QUOTES.length));
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const t = setInterval(() => {
      setVisible(false);
      setTimeout(() => { setIdx(p => (p + 1) % QUOTES.length); setVisible(true); }, 400);
    }, 8000);
    return () => clearInterval(t);
  }, []);
  const q = QUOTES[idx];
  return (
    <div style={{
      padding: '14px 18px', borderRadius: 'var(--r-lg)',
      background: 'linear-gradient(135deg, rgba(124,93,249,0.06) 0%, rgba(14,14,22,0.8) 100%)',
      border: '1px solid var(--brand-border)',
      display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 24,
      transition: 'opacity 0.3s, transform 0.3s',
      opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(4px)',
    }}>
      <div style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--brand-bg)', border: '1px solid var(--brand-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
        <Quote size={12} style={{ color: 'var(--brand-light)' }} />
      </div>
      <div>
        <p style={{ fontSize: 13, color: 'var(--text1)', lineHeight: 1.65, margin: 0, fontStyle: 'italic', fontWeight: 400 }}>"{q.text}"</p>
        <p style={{ fontSize: 11, color: 'var(--brand-light)', margin: '5px 0 0', fontWeight: 700, letterSpacing: '0.03em' }}>— {q.author}</p>
      </div>
    </div>
  );
};

// ── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon: Icon, color, sub, delay = 0 }) => {
  const [displayed, setDisplayed] = useState(0);
  const num = typeof value === 'number' ? value : parseInt(value) || 0;
  useEffect(() => {
    if (!num) return;
    let start = 0;
    const step = Math.ceil(num / 20);
    const t = setTimeout(() => {
      const id = setInterval(() => {
        start += step;
        if (start >= num) { setDisplayed(num); clearInterval(id); }
        else setDisplayed(start);
      }, 40);
    }, delay);
    return () => clearTimeout(t);
  }, [num, delay]);

  return (
    <div className="stat-card animate-fade-up" style={{ animationDelay: `${delay}ms`, cursor: 'default', background: 'linear-gradient(145deg, var(--surface) 0%, var(--surface2) 100%)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.09em' }}>{label}</span>
        <div style={{ width: 34, height: 34, borderRadius: 9, background: color + '14', border: `1px solid ${color}28`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={15} style={{ color }} />
        </div>
      </div>
      <div style={{ fontSize: 34, fontWeight: 900, color: 'var(--text1)', lineHeight: 1, letterSpacing: '-0.04em', fontFamily: 'var(--font-mono)', marginBottom: 5 }}>
        {typeof value === 'string' && isNaN(parseInt(value)) ? value : displayed}
      </div>
      {sub && <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 500 }}>{sub}</div>}
    </div>
  );
};

// ── Ticker strip — icons only ─────────────────────────────────────────────────
const TICKER_ITEMS = [
  { icon: BarChart2,    label: 'Market Demand Analysis'  },
  { icon: Target,       label: 'Competitor Research'      },
  { icon: Cpu,          label: 'Innovation Scoring'       },
  { icon: ShieldCheck,  label: 'Risk Assessment'          },
  { icon: Gauge,        label: 'Feasibility Check'        },
  { icon: LineChart,    label: 'Revenue Modeling'         },
  { icon: Globe,        label: 'Market Sizing'            },
  { icon: Layers,       label: 'Risk Matrix'              },
  { icon: Map,          label: 'Roadmap Generation'       },
];

const TickerStrip = () => {
  const doubled = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div style={{ overflow: 'hidden', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '7px 0', marginBottom: 24 }}>
      <div className="animate-marquee" style={{ display: 'flex', gap: 36, width: 'max-content' }}>
        {doubled.map((item, i) => {
          const Icon = item.icon;
          return (
            <span key={i} style={{ fontSize: 11, fontWeight: 600, color: 'var(--text2)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 5 }}>
              <Icon size={11} style={{ color: 'var(--brand)', flexShrink: 0 }} />
              {item.label}
              <span style={{ width: 2, height: 2, borderRadius: '50%', background: 'var(--brand-light)', display: 'inline-block', marginLeft: 8 }} />
            </span>
          );
        })}
      </div>
    </div>
  );
};

// ── History Item ──────────────────────────────────────────────────────────────
const HistoryItem = ({ item, onView, onDelete, delay = 0 }) => (
  <div onClick={() => onView(item)} className="animate-fade-up"
    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--border)', cursor: 'pointer', transition: 'all 0.15s', gap: 12, animationDelay: `${delay}ms` }}
    onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface2)'; e.currentTarget.style.borderColor = 'var(--brand-border)'; }}
    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--border)'; }}>
    <div style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--brand-bg)', border: '1px solid var(--brand-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Briefcase size={15} style={{ color: 'var(--brand-light)' }} />
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.startupName}</span>
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
        <span className="badge badge-brand">{item.startupDetails?.startupDomain || 'Startup'}</span>
        <span className={riskBadge(item.risk)}>{item.risk || 'Validated'}</span>
        <span style={{ fontSize: 10, color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: 3 }}>
          <Clock size={9} /> {item.date}
        </span>
      </div>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
      <button onClick={e => { e.stopPropagation(); onDelete(item.id); }}
        style={{ width: 28, height: 28, borderRadius: 7, background: 'transparent', border: '1px solid transparent', color: 'var(--text3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--red-bg)'; e.currentTarget.style.color = 'var(--red)'; e.currentTarget.style.borderColor = 'var(--red-border)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text3)'; e.currentTarget.style.borderColor = 'transparent'; }}>
        <Trash2 size={12} />
      </button>
      <ChevronRight size={14} style={{ color: 'var(--text3)' }} />
    </div>
  </div>
);

const SkeletonRow = () => (
  <div style={{ display: 'flex', gap: 12, padding: '12px 14px', borderRadius: 10, border: '1px solid var(--border)', alignItems: 'center' }}>
    <div className="skeleton" style={{ width: 36, height: 36, borderRadius: 9, flexShrink: 0 }} />
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
      <div className="skeleton" style={{ width: '45%', height: 12, borderRadius: 4 }} />
      <div className="skeleton" style={{ width: '25%', height: 10, borderRadius: 99 }} />
    </div>
  </div>
);

const QuickAction = ({ label, desc, icon: Icon, color, onClick }) => (
  <button onClick={onClick}
    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', transition: 'all 0.15s', width: '100%', textAlign: 'left' }}
    onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface2)'; e.currentTarget.style.borderColor = 'var(--border2)'; }}
    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--border)'; }}>
    <div style={{ width: 34, height: 34, borderRadius: 9, background: color + '14', border: `1px solid ${color}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={15} style={{ color }} />
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text1)' }}>{label}</div>
      <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 1 }}>{desc}</div>
    </div>
    <ArrowUpRight size={13} style={{ color: 'var(--text3)', flexShrink: 0 }} />
  </button>
);

const card = {
  background: 'linear-gradient(145deg, var(--surface) 0%, rgba(14,14,22,0.95) 100%)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--r-lg)',
  padding: 20,
};

const SectionHeader = ({ icon: Icon, label }) => (
  <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'var(--text3)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 7 }}>
    <div style={{ width: 20, height: 20, borderRadius: 5, background: 'var(--surface3)', border: '1px solid var(--border2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Icon size={10} style={{ color: 'var(--brand-light)' }} />
    </div>
    {label}
  </div>
);

// ── Main ──────────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { showToast } = useToast();
  const {
    user, startupDetails, analysisScores, dashboardStats, analysisHistory,
    setAnalysisHistory, resumeState, restoreDraft, setAnalysisScores,
    setStartupInfo, deleteHistoryItem, setNewUserStatus, fullAnalysisData,
  } = useStartup();

  const time = useLiveClock();
  const [activeTab,      setActiveTab]      = useState(() => location.state?.activeTab || 'overview');
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (location.state?.activeTab) setActiveTab(location.state.activeTab);
  }, [location.state]);

  useEffect(() => {
    if (!user?.userId) return;
    setLoadingHistory(true);
    fetchUserSessions(user.userId).then(sessions => {
      if (sessions?.length > 0) {
        setAnalysisHistory(sessions.map(s => ({
          id: s.id,
          startupName: s.startup_name || 'Unnamed',
          date: new Date(s.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
          summary: `${s.startup_domain || ''} — Validated`.trim(),
          status: 'High', risk: 'Medium', scores: null,
          startupDetails: { startupName: s.startup_name, startupDomain: s.startup_domain },
          sessionId: s.id, isValidated: s.is_validated ?? true,
        })));
      }
    }).catch(() => {}).finally(() => setLoadingHistory(false));
  }, [user?.userId]); // eslint-disable-line

  const handleViewAnalysis = async (item) => {
    if (item.scores) {
      setAnalysisScores(item.scores);
      if (item.startupDetails) setStartupInfo(item.startupDetails);
      navigate('/analysis/result');
      return;
    }
    if (item.sessionId) {
      showToast('Loading analysis...', 'info');
      try {
        const { supabase } = await import('../services/supabase');
        const [{ data: _po }, { data: ap }, { data: si }] = await Promise.all([
          supabase.from('pipeline_output').select('aggregate_validation_score,status').eq('session_id', item.sessionId).single(),
          supabase.from('analysis_phase').select('id,aggregate_score').eq('session_id', item.sessionId).single(),
          supabase.from('startup_input').select('*').eq('id', item.sessionId).single(),
        ]);
        let agentResults = [];
        if (ap?.id) {
          const { data: ar } = await supabase.from('analysis_agent_results').select('*').eq('analysis_phase_id', ap.id);
          agentResults = ar || [];
        }
        const agentMap = {};
        agentResults.forEach(r => { agentMap[r.agent] = r; });
        const mapA = (a) => {
          if (!a) return { score: 0, status: 'Low', details: 'N/A' };
          const score = Math.round(a.score || 0);
          return { score, status: score >= 70 ? 'High' : score >= 45 ? 'Medium' : 'Low', details: a.summary || a.verdict || '' };
        };
        const scores = {
          feasibility: mapA(agentMap['feasibility_analysis']),
          marketDemand: mapA(agentMap['market_opportunity']),
          competitorPresence: mapA(agentMap['competition_analysis']),
          riskLevel: mapA(agentMap['risk_analysis']),
          innovationLevel: mapA(agentMap['innovation_usp']),
          targetAudienceFit: mapA(agentMap['feasibility_analysis']),
          problemSolutionFit: mapA(agentMap['feasibility_analysis']),
          revenuePotential: mapA(agentMap['market_opportunity']),
          scalability: mapA(agentMap['feasibility_analysis']),
        };
        setAnalysisScores(scores);
        if (si) setStartupInfo({ startupName: si.startup_name || '', startupDomain: si.startup_domain || '', revenueModel: si.revenue_model || '', availableFunding: si.available_funding || '', mvpTimeline: si.mvp_timeline || '' });
        navigate('/analysis/result');
      } catch { showToast('Failed to load analysis.', 'error'); }
    }
  };

  const hasAnalysis  = !!analysisScores || !!fullAnalysisData;
  const overallScore = analysisScores
    ? Math.round(Object.values(analysisScores).filter(s => typeof s?.score === 'number').reduce((a, s) => a + s.score, 0) / Math.max(1, Object.values(analysisScores).filter(s => typeof s?.score === 'number').length))
    : null;

  const firstName = user.fullName?.split(' ')[0] || 'Founder';
  const greeting  = getGreeting();
  const timeStr   = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  const dateStr   = time.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 24 }} className="animate-fade-up">
        <div>
          <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-mono)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Clock size={11} style={{ color: 'var(--brand-light)' }} />
            {dateStr}
            <span style={{ color: 'var(--border2)' }}>|</span>
            <span style={{ color: 'var(--brand-light)', fontWeight: 700 }}>{timeStr}</span>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: 'var(--text1)', letterSpacing: '-0.03em', margin: 0, marginBottom: 4 }}>
            {greeting},{' '}
            <span style={{ background: 'linear-gradient(90deg, var(--brand-light), var(--cyan))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {firstName}
            </span>
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text2)', margin: 0, lineHeight: 1.5 }}>
            {user.isNewUser ? 'Your workspace is ready. Validate your first idea.' : "Here's your startup portfolio overview."}
          </p>
        </div>
        <button onClick={() => { setNewUserStatus(false); navigate('/onboarding/role'); }} className="btn btn-primary btn-sm">
          <Plus size={13} /> Validate Idea
        </button>
      </div>

      {/* ── Ticker ── */}
      <TickerStrip />

      {/* ── Quote ── */}
      <QuoteBanner />

      {/* ── Active Analysis Banner ── */}
      {hasAnalysis && overallScore !== null && (
        <div style={{ ...card, marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, borderColor: 'var(--brand-border)', background: 'linear-gradient(135deg, rgba(124,93,249,0.08) 0%, rgba(14,14,22,0.95) 100%)' }} className="animate-fade-up">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: 13, background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 16px rgba(124,93,249,0.3)' }}>
              <TrendingUp size={22} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: 10, color: 'var(--brand-light)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>Active Analysis</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text1)', letterSpacing: '-0.02em' }}>{startupDetails.startupName || 'Startup'}</div>
              <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>{startupDetails.startupDomain || ''}</span>
                <span style={{ color: 'var(--brand-light)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{overallScore}/100</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => navigate('/analysis/result')} className="btn btn-primary btn-sm">
              <BarChart2 size={13} /> View Report
            </button>
            <button onClick={() => navigate('/roadmap')} className="btn btn-outline btn-sm">
              <Compass size={13} /> Roadmap
            </button>
          </div>
        </div>
      )}

      {/* ── Draft Resume Banner ── */}
      {resumeState && (
        <div style={{ ...card, marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, borderColor: 'rgba(245,158,11,0.3)', background: 'rgba(245,158,11,0.05)' }} className="animate-fade-up">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={15} style={{ color: 'var(--amber)' }} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text1)' }}>Unfinished draft saved</div>
              <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 1 }}>Resume where you left off</div>
            </div>
          </div>
          <button onClick={() => { const r = restoreDraft(); if (r) navigate('/onboarding/details'); }}
            style={{ background: 'var(--amber)', color: '#000', border: 'none', padding: '7px 16px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Play size={12} style={{ fill: '#000' }} /> Resume Draft
          </button>
        </div>
      )}

      {/* ── Stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 28 }}>
        <StatCard label="Validations"     value={dashboardStats.totalStartups}    icon={Briefcase}  color="var(--brand)"  sub="Ideas analyzed"    delay={0}   />
        <StatCard label="Reports Done"    value={dashboardStats.completedAnalysis} icon={Layers}     color="var(--green)"  sub="Full analyses"     delay={60}  />
        <StatCard label="Saved Drafts"    value={dashboardStats.savedDraftCount}  icon={FileText}   color="var(--cyan)"   sub="In progress"       delay={120} />
        <StatCard label="Roadmap"         value={dashboardStats.roadmapProgress}  icon={Compass}    color="var(--amber)"  sub="Milestones"        delay={180} />
      </div>

      {/* ── Tab Nav ── */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 20, background: 'var(--surface)', padding: 4, borderRadius: 11, width: 'fit-content', border: '1px solid var(--border)' }}>
        {[
          { id: 'overview',  label: 'Overview',    icon: Activity   },
          { id: 'startups',  label: 'My Startups', icon: Briefcase  },
          { id: 'history',   label: 'History',     icon: Clock      },
        ].map(t => {
          const Icon = t.icon;
          const active = activeTab === t.id;
          return (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              style={{ padding: '6px 14px', borderRadius: 8, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 5, background: active ? 'var(--brand)' : 'transparent', color: active ? '#fff' : 'var(--text2)' }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.color = 'var(--text1)'; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.color = 'var(--text2)'; }}>
              <Icon size={12} /> {t.label}
            </button>
          );
        })}
      </div>

      {/* ── Overview Tab ── */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }} className="animate-fade-up">
          <div style={card}>
            <SectionHeader icon={Clock} label="Recent Activity" />
            {loadingHistory
              ? [1,2,3].map(i => <div key={i} style={{ marginBottom: 8 }}><SkeletonRow /></div>)
              : analysisHistory.length > 0
              ? <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {analysisHistory.slice(0, 6).map((item, i) =>
                    <HistoryItem key={item.id} item={item} onView={handleViewAnalysis} onDelete={deleteHistoryItem} delay={i * 50} />
                  )}
                </div>
              : <div style={{ padding: '40px 0', textAlign: 'center' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--surface3)', border: '1px solid var(--border2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                    <Clock size={20} style={{ color: 'var(--text3)' }} />
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)' }}>No validations yet</div>
                  <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>Validate your first idea to see it here</div>
                </div>
            }
          </div>

          <div style={card}>
            <SectionHeader icon={Zap} label="Quick Actions" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              <QuickAction label="Validate New Idea" desc="Run AI stress-test"    icon={Sparkles}  color="var(--brand)"  onClick={() => navigate('/onboarding/role')} />
              <QuickAction label="Generate Roadmap"  desc="Build execution plan"  icon={Compass}   color="var(--cyan)"   onClick={() => navigate('/roadmap')} />
              <QuickAction label="View Analysis"     desc="See latest report"     icon={BarChart2} color="var(--green)"  onClick={() => hasAnalysis ? navigate('/analysis/result') : showToast('Validate first.', 'info')} />
              <QuickAction label="Your Profile"      desc="Manage account"        icon={Activity}  color="var(--amber)"  onClick={() => navigate('/profile')} />
            </div>
          </div>
        </div>
      )}

      {/* ── My Startups Tab ── */}
      {activeTab === 'startups' && (
        <div style={card} className="animate-fade-up">
          <SectionHeader icon={Briefcase} label="Portfolio" />
          {analysisHistory.length > 0
            ? <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {analysisHistory.map((item, i) => (
                  <div key={item.id} onClick={() => handleViewAnalysis(item)} className="animate-fade-up"
                    style={{ padding: '14px 16px', borderRadius: 10, border: '1px solid var(--border)', cursor: 'pointer', transition: 'all 0.15s', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, animationDelay: `${i * 40}ms` }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface2)'; e.currentTarget.style.borderColor = 'var(--brand-border)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--border)'; }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--brand-bg)', border: '1px solid var(--brand-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Briefcase size={15} style={{ color: 'var(--brand-light)' }} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text1)', marginBottom: 4 }}>{item.startupName}</div>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          <span className="badge badge-brand">{item.startupDetails?.startupDomain || 'Startup'}</span>
                          <span className={riskBadge(item.risk)}>{item.risk || 'Validated'}</span>
                          <span style={{ fontSize: 10, color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: 3 }}><Clock size={9} />{item.date}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                      <button onClick={e => { e.stopPropagation(); deleteHistoryItem(item.id); }}
                        style={{ width: 28, height: 28, borderRadius: 7, background: 'transparent', border: '1px solid transparent', color: 'var(--text3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--red-bg)'; e.currentTarget.style.color = 'var(--red)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text3)'; }}>
                        <Trash2 size={12} />
                      </button>
                      <ChevronRight size={14} style={{ color: 'var(--text3)' }} />
                    </div>
                  </div>
                ))}
              </div>
            : <div style={{ padding: '48px 0', textAlign: 'center' }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--surface3)', border: '1px solid var(--border2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                  <Briefcase size={22} style={{ color: 'var(--text3)' }} />
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text2)', marginBottom: 5 }}>No startups yet</div>
                <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 18 }}>Validate your first idea</div>
                <button onClick={() => navigate('/onboarding/role')} className="btn btn-primary btn-sm">
                  <Sparkles size={12} /> Validate Now
                </button>
              </div>
          }
        </div>
      )}

      {/* ── History Tab ── */}
      {activeTab === 'history' && (
        <div style={card} className="animate-fade-up">
          <SectionHeader icon={Clock} label="Validation History" />
          {loadingHistory
            ? [1,2,3,4].map(i => <div key={i} style={{ marginBottom: 8 }}><SkeletonRow /></div>)
            : analysisHistory.length > 0
            ? <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {analysisHistory.map((item, i) =>
                  <HistoryItem key={item.id} item={item} onView={handleViewAnalysis} onDelete={deleteHistoryItem} delay={i * 40} />
                )}
              </div>
            : <div style={{ padding: '48px 0', textAlign: 'center' }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--surface3)', border: '1px solid var(--border2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                  <Clock size={22} style={{ color: 'var(--text3)' }} />
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text2)', marginBottom: 5 }}>No history yet</div>
                <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 18 }}>Your past validations will appear here</div>
                <button onClick={() => navigate('/onboarding/role')} className="btn btn-primary btn-sm">
                  <Sparkles size={12} /> Start Validating
                </button>
              </div>
          }
        </div>
      )}

    </DashboardLayout>
  );
};

export default Dashboard;
