import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStartup } from '../context/StartupContext';
import { useToast } from '../context/ToastContext';
import Navbar from '../components/Navbar';
import {
  Sparkles, TrendingUp, Target, Users, Gauge, AlertCircle,
  Zap, Layers, Search, Download, RefreshCw, Save,
  LayoutDashboard, CheckCircle2, XCircle, ShieldAlert,
  Lightbulb, Swords, ChevronDown, ChevronUp, Sun, Moon,
  Rocket, Star, Globe, DollarSign, Clock, BarChart2,
  TrendingDown, ArrowRight, Award, Cpu
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers & sub-components
// ─────────────────────────────────────────────────────────────────────────────

/** SVG circular progress arc */
const ScoreArc = ({ score = 0, size = 72, strokeWidth = 6, color = '#2563eb', trackColor = '#e2e8f0' }) => {
  const s = Math.max(0, Math.min(100, score));
  const r = (size - strokeWidth * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - s / 100);
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)', display: 'block' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={trackColor} strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.3s cubic-bezier(.4,0,.2,1)' }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>
        <span style={{ fontSize: size * 0.22, fontWeight: 900, color, fontFamily: 'inherit' }}>{Math.round(s)}</span>
      </div>
    </div>
  );
};

/** Grade label from a score */
const gradeOf = (score) => {
  if (score >= 80) return { letter: 'A', label: 'Excellent', desc: 'Highly viable. Strong fundamentals across all dimensions.' };
  if (score >= 65) return { letter: 'B', label: 'Good',      desc: 'Solid potential. A few areas to strengthen before launch.' };
  if (score >= 50) return { letter: 'C', label: 'Moderate',  desc: 'Mixed signals. Significant improvements needed before scaling.' };
  return              { letter: 'D', label: 'Needs Work',desc: 'High-risk indicators found. Recommend rethinking core assumptions.' };
};

/** Color for a 0-100 score */
const scoreColor = (s, light) => {
  if (s >= 80) return light ? '#059669' : '#10b981';
  if (s >= 65) return light ? '#2563eb' : '#3b82f6';
  if (s >= 50) return light ? '#d97706' : '#f59e0b';
  return             light ? '#dc2626' : '#f43f5e';
};

/** Status badge meta from a verdict string */
const verdictMeta = (verdict = '', light) => {
  const v = verdict.toLowerCase();
  if (v.includes('high') || v.includes('strong') || v.includes('pass') || v.includes('excellent') || v.includes('low risk')) {
    return { color: light ? '#059669' : '#10b981', bg: light ? '#f0fdf4' : 'rgba(16,185,129,0.1)', border: light ? '#bbf7d0' : 'rgba(16,185,129,0.2)' };
  }
  if (v.includes('medium') || v.includes('moderate')) {
    return { color: light ? '#d97706' : '#f59e0b', bg: light ? '#fffbeb' : 'rgba(245,158,11,0.1)', border: light ? '#fde68a' : 'rgba(245,158,11,0.2)' };
  }
  return { color: light ? '#dc2626' : '#f43f5e', bg: light ? '#fef2f2' : 'rgba(244,63,94,0.1)', border: light ? '#fecaca' : 'rgba(244,63,94,0.2)' };
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
const AnalysisResult = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { analysisScores, fullAnalysisData, startupDetails, saveAnalysis } = useStartup();
  const [expandedAgent, setExpandedAgent] = useState(null);
  const [isLight, setIsLight] = useState(true);
  const containerRef = useRef(null);

  // Sync light mode class for scrollbar override
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (isLight) el.classList.add('ar-light-mode');
    else el.classList.remove('ar-light-mode');
  }, [isLight]);

  const handleExport    = () => showToast('PDF export coming in V2.0!', 'info');
  const handleSave      = () => { saveAnalysis(analysisScores); setTimeout(() => navigate('/dashboard'), 1200); };
  const handleReanalyze = () => { showToast('Re-compiling venture inputs…', 'info'); navigate('/analysis/loader'); };

  // ── Theme token map ───────────────────────────────────────────────────────
  const T = {
    bg:         isLight ? '#f8fafc'                    : '#060609',
    surface:    isLight ? '#ffffff'                    : '#0e0e18',
    surface2:   isLight ? '#f1f5f9'                    : '#12121e',
    surface3:   isLight ? '#e8edf5'                    : '#181828',
    border:     isLight ? '#e2e8f0'                    : 'rgba(59,130,246,0.1)',
    border2:    isLight ? '#cbd5e1'                    : 'rgba(59,130,246,0.18)',
    text1:      isLight ? '#0f172a'                    : '#f1f5f9',
    text2:      isLight ? '#475569'                    : '#94a3b8',
    text3:      isLight ? '#94a3b8'                    : '#4b5563',
    brand:      '#2563eb',
    brandLight: isLight ? '#2563eb'                    : '#3b82f6',
    brandBg:    isLight ? '#eff6ff'                    : 'rgba(37,99,235,0.08)',
    brandBdr:   isLight ? '#bfdbfe'                    : 'rgba(37,99,235,0.2)',
    success:    isLight ? '#059669'                    : '#10b981',
    successBg:  isLight ? '#f0fdf4'                    : 'rgba(16,185,129,0.08)',
    successBdr: isLight ? '#bbf7d0'                    : 'rgba(16,185,129,0.2)',
    warning:    isLight ? '#d97706'                    : '#f59e0b',
    warningBg:  isLight ? '#fffbeb'                    : 'rgba(245,158,11,0.08)',
    warningBdr: isLight ? '#fde68a'                    : 'rgba(245,158,11,0.2)',
    danger:     isLight ? '#dc2626'                    : '#f43f5e',
    dangerBg:   isLight ? '#fef2f2'                    : 'rgba(244,63,94,0.08)',
    dangerBdr:  isLight ? '#fecaca'                    : 'rgba(244,63,94,0.2)',
    purple:     '#7c3aed',
    purpleBg:   isLight ? '#f5f3ff'                    : 'rgba(124,58,237,0.08)',
    purpleBdr:  isLight ? '#ede9fe'                    : 'rgba(124,58,237,0.2)',
    track:      isLight ? '#e2e8f0'                    : '#1e1e2e',
    shadow:     isLight ? '0 1px 3px rgba(0,0,0,0.06),0 4px 12px rgba(0,0,0,0.04)'
                        : '0 1px 3px rgba(0,0,0,0.4),0 4px 12px rgba(0,0,0,0.3)',
    shadowMd:   isLight ? '0 4px 24px rgba(0,0,0,0.07),0 16px 48px rgba(0,0,0,0.04)'
                        : '0 4px 24px rgba(0,0,0,0.5),0 16px 48px rgba(0,0,0,0.4)',
    shadowBrand:isLight ? '0 2px 16px rgba(37,99,235,0.25)'
                        : '0 2px 16px rgba(59,130,246,0.25)',
  };

  // ── Missing data guard ───────────────────────────────────────────────────
  if (!analysisScores) {
    return (
      <div style={{ background: T.bg, minHeight: '100vh', fontFamily: "'Plus Jakarta Sans','Inter',sans-serif" }}>
        <Navbar />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: T.dangerBg, border: `1px solid ${T.dangerBdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertCircle size={24} style={{ color: T.danger }} />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: T.text1, margin: 0 }}>Analysis Data Missing</h2>
          <p style={{ fontSize: 13, color: T.text2, margin: 0 }}>No analysis results found. Please run a validation first.</p>
          <button
            onClick={() => navigate('/startup/validate')}
            style={{ marginTop: 8, padding: '10px 24px', borderRadius: 8, border: 'none', background: T.brand, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
          >
            Go to Validation
          </button>
        </div>
      </div>
    );
  }

  // ── Safe score getter (fixes TypeError: Object.entries on null) ──────────
  const getScore = (id) => analysisScores?.[id] ?? { score: 0, status: 'N/A', details: 'Data unavailable.' };

  // ── Overall composite score ──────────────────────────────────────────────
  const scoreValues = Object.values(analysisScores || {}).filter(s => s != null && typeof s.score === 'number');
  const overallScore = scoreValues.length > 0
    ? Math.round(scoreValues.reduce((acc, s) => acc + s.score, 0) / scoreValues.length)
    : 0;
  const grade = gradeOf(overallScore);
  const overallColor = scoreColor(overallScore, isLight);

  // ── Structured data ──────────────────────────────────────────────────────
  const ap = fullAnalysisData?.analysis_phase_state || {};

  const metricMeta = [
    { id: 'marketDemand',       label: 'Market Demand',        icon: TrendingUp,  desc: 'Addressable demand size and growth trajectory in the target market.' },
    { id: 'targetAudienceFit',  label: 'Audience Fit',         icon: Target,      desc: 'How precisely the solution maps to real-world user problems and pain points.' },
    { id: 'problemSolutionFit', label: 'Problem–Solution Fit', icon: Sparkles,    desc: 'Alignment strength between the problem hypothesis and the proposed solution.' },
    { id: 'competitorPresence', label: 'Competitor Landscape', icon: Users,       desc: 'Density and sophistication of existing players in the market space.' },
    { id: 'revenuePotential',   label: 'Revenue Potential',    icon: DollarSign,  desc: 'Monetization capacity, pricing power, and revenue model sustainability.' },
    { id: 'riskLevel',          label: 'Risk Exposure',        icon: ShieldAlert, desc: 'Aggregate of execution, market, regulatory, and technical risk factors.' },
    { id: 'innovationLevel',    label: 'Innovation Score',     icon: Zap,         desc: 'Differentiation level and novelty compared to existing solutions.' },
    { id: 'scalability',        label: 'Scalability Index',    icon: Layers,      desc: 'Ability to grow efficiently across geographies, user segments, and channels.' },
    { id: 'feasibility',        label: 'Feasibility',          icon: Cpu,         desc: 'Technical and operational viability given current constraints and resources.' },
  ];

  const agents = [
    { key: 'feasibility',        label: 'Feasibility Analysis',   icon: Search,      data: ap.feasibility,        color: T.brandLight, bgColor: T.brandBg, bdrColor: T.brandBdr },
    { key: 'market_opportunity', label: 'Market Opportunity',      icon: TrendingUp,  data: ap.market_opportunity, color: T.success,    bgColor: T.successBg, bdrColor: T.successBdr },
    { key: 'competition',        label: 'Competition Analysis',    icon: Swords,      data: ap.competition,        color: T.warning,    bgColor: T.warningBg, bdrColor: T.warningBdr },
    { key: 'risk',               label: 'Risk Assessment',         icon: ShieldAlert, data: ap.risk,               color: T.danger,     bgColor: T.dangerBg,  bdrColor: T.dangerBdr },
    { key: 'innovation_usp',     label: 'Innovation & USP',        icon: Lightbulb,   data: ap.innovation_usp,     color: T.purple,     bgColor: T.purpleBg,  bdrColor: T.purpleBdr },
  ];

  // ── Bullet list renderer ─────────────────────────────────────────────────
  const renderBullets = (items, dotColor) => {
    if (!items?.length) return <p style={{ fontSize: 12, color: T.text3, fontStyle: 'italic', margin: 0 }}>No data available.</p>;
    return (
      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 7 }}>
        {items.map((item, i) => (
          <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, fontSize: 13, color: T.text2, lineHeight: 1.65 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: dotColor, marginTop: 7, flexShrink: 0 }} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    );
  };

  // ── Insight pill card ────────────────────────────────────────────────────
  const InsightCard = ({ title, value, color, bg, bdr }) => (
    <div style={{ padding: '14px 16px', background: bg, border: `1px solid ${bdr}`, borderRadius: 10, minWidth: 0 }}>
      <p style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.09em', color, margin: '0 0 6px' }}>{title}</p>
      <p style={{ fontSize: 12.5, color: T.text2, margin: 0, lineHeight: 1.65 }}>{value}</p>
    </div>
  );

  // ── Section header ───────────────────────────────────────────────────────
  const SectionHeader = ({ label, sub }) => (
    <div style={{ marginBottom: 18 }}>
      <h2 style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: T.brandLight, margin: '0 0 4px' }}>{label}</h2>
      {sub && <p style={{ fontSize: 13, color: T.text2, margin: 0, lineHeight: 1.6 }}>{sub}</p>}
    </div>
  );

  // ── List section block inside agent card ─────────────────────────────────
  const ListBlock = ({ title, items, color }) => {
    if (!items?.length) return null;
    return (
      <div>
        <p style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.09em', color, margin: '0 0 10px' }}>✦ {title}</p>
        {renderBullets(items, color)}
      </div>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div
      ref={containerRef}
      style={{
        background: T.bg, minHeight: '100vh',
        fontFamily: "'Plus Jakarta Sans','Inter',sans-serif",
        color: T.text1, transition: 'background 0.3s,color 0.3s',
      }}
    >
      <Navbar />

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '36px 24px 100px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

          {/* ── PAGE HEADER ──────────────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Title row */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
              <div style={{ flex: 1, minWidth: 240 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase',
                    color: T.brandLight, background: T.brandBg, border: `1px solid ${T.brandBdr}`,
                    borderRadius: 20, padding: '4px 12px',
                  }}>
                    Analysis Complete
                  </span>
                  <span style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase',
                    color: overallColor,
                    background: overallScore >= 65 ? T.successBg : overallScore >= 50 ? T.warningBg : T.dangerBg,
                    border: `1px solid ${overallScore >= 65 ? T.successBdr : overallScore >= 50 ? T.warningBdr : T.dangerBdr}`,
                    borderRadius: 20, padding: '4px 12px',
                  }}>
                    <Award size={10} />
                    Grade {grade.letter} — {grade.label}
                  </span>
                </div>
                <h1 style={{ fontSize: 30, fontWeight: 800, color: T.text1, margin: 0, lineHeight: 1.2, letterSpacing: '-0.02em' }}>
                  {startupDetails.startupName || 'Venture Proposal'}
                </h1>
                <p style={{ fontSize: 14, color: T.text2, marginTop: 8, lineHeight: 1.7, maxWidth: 560, margin: '8px 0 0' }}>
                  Evaluated across 9 critical dimensions — market demand, competitive landscape, innovation potential,
                  revenue viability, and execution feasibility — using 5 specialized AI agents.
                </p>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', flexShrink: 0 }}>
                <button onClick={() => setIsLight(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: `1px solid ${T.border}`, background: T.surface, color: T.text2, fontSize: 12, fontWeight: 600, cursor: 'pointer', boxShadow: T.shadow, transition: 'all 0.2s', lineHeight: 1 }}>
                  {isLight ? <Moon size={13} /> : <Sun size={13} />}
                  {isLight ? 'Dark Mode' : 'Light Mode'}
                </button>
                <button onClick={handleReanalyze} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: `1px solid ${T.border}`, background: T.surface, color: T.text2, fontSize: 12, fontWeight: 600, cursor: 'pointer', boxShadow: T.shadow, transition: 'all 0.2s', lineHeight: 1 }}>
                  <RefreshCw size={13} />Reanalyze
                </button>
                <button onClick={handleExport} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: `1px solid ${T.border}`, background: T.surface, color: T.text2, fontSize: 12, fontWeight: 600, cursor: 'pointer', boxShadow: T.shadow, transition: 'all 0.2s', lineHeight: 1 }}>
                  <Download size={13} />Export PDF
                </button>
                <button onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 20px', borderRadius: 8, border: 'none', background: T.brand, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', boxShadow: T.shadowBrand, transition: 'all 0.2s', lineHeight: 1 }}>
                  <Save size={13} />Save & Finish
                </button>
              </div>
            </div>

            {/* Quick info pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {[
                { label: 'Domain',    val: startupDetails.startupDomain,     icon: Globe },
                { label: 'Revenue',   val: startupDetails.revenueModel,      icon: DollarSign },
                { label: 'Funding',   val: startupDetails.availableFunding,   icon: BarChart2 },
                { label: 'Timeline',  val: startupDetails.mvpTimeline,       icon: Clock },
              ].map(({ label, val, icon: Ic }) => !val ? null : (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, border: `1px solid ${T.border}`, background: T.surface, boxShadow: T.shadow }}>
                  <Ic size={12} style={{ color: T.brandLight }} />
                  <span style={{ fontSize: 10, fontWeight: 700, color: T.text3, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: T.text1 }}>{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── OVERALL SCORE HERO ───────────────────────────────────────── */}
          <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 18, padding: '32px 36px', boxShadow: T.shadowMd, display: 'flex', alignItems: 'center', gap: 36, flexWrap: 'wrap' }}>
            {/* Large arc */}
            <div style={{ flexShrink: 0 }}>
              <ScoreArc score={overallScore} size={148} strokeWidth={11} color={overallColor} trackColor={T.track} />
            </div>

            {/* Grade + text */}
            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 56, fontWeight: 900, color: overallColor, lineHeight: 1, letterSpacing: '-0.03em' }}>{grade.letter}</span>
                <div>
                  <p style={{ fontSize: 20, fontWeight: 800, color: T.text1, margin: 0, letterSpacing: '-0.01em' }}>{grade.label} Viability</p>
                  <p style={{ fontSize: 12, color: T.text2, margin: '3px 0 0' }}>Composite score across all analysis dimensions</p>
                </div>
              </div>
              <p style={{ fontSize: 14, color: T.text2, lineHeight: 1.75, margin: 0, maxWidth: 500 }}>
                {ap.feasibility?.summary || ap.market_opportunity?.summary ||
                  `${grade.desc} Your startup "${startupDetails.startupName || 'venture'}" scored ${overallScore}/100 across market, competition, innovation, risk, and feasibility dimensions.`}
              </p>
            </div>

            {/* Stat tiles */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0, minWidth: 160 }}>
              {[
                { label: 'Metrics Analyzed', val: '9',   color: T.brandLight },
                { label: 'AI Agents',         val: '5',   color: T.purple     },
                { label: 'Dimensions',        val: '50+', color: T.success    },
              ].map(({ label, val, color }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, padding: '10px 14px', borderRadius: 10, background: T.surface2, border: `1px solid ${T.border}` }}>
                  <span style={{ fontSize: 11, color: T.text2, fontWeight: 500 }}>{label}</span>
                  <span style={{ fontSize: 18, fontWeight: 900, color }}>{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── SCORE METRIC GRID ────────────────────────────────────────── */}
          <section>
            <SectionHeader
              label="Score Overview"
              sub="Detailed breakdown of your startup across 9 key performance indicators, each scored independently by AI agents."
            />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px,1fr))', gap: 12 }}>
              {metricMeta.map((m) => {
                const Icon = m.icon;
                const sd = getScore(m.id);
                const sColor = scoreColor(sd.score, isLight);
                const badge  = verdictMeta(sd.status, isLight);
                return (
                  <div key={m.id} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, padding: '18px 20px', boxShadow: T.shadow, display: 'flex', gap: 14, alignItems: 'flex-start', transition: 'box-shadow 0.2s,border-color 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = sColor + '50'; e.currentTarget.style.boxShadow = `0 4px 20px ${sColor}20`; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = T.border;     e.currentTarget.style.boxShadow = T.shadow; }}
                  >
                    <ScoreArc score={sd.score} size={64} strokeWidth={5} color={sColor} trackColor={T.track} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                        <Icon size={12} style={{ color: T.brandLight, flexShrink: 0 }} />
                        <span style={{ fontSize: 12, fontWeight: 700, color: T.text1, lineHeight: 1.3 }}>{m.label}</span>
                      </div>
                      <span style={{ fontSize: 9.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em', color: badge.color, background: badge.bg, border: `1px solid ${badge.border}`, borderRadius: 20, padding: '2px 8px', display: 'inline-block', marginBottom: 6 }}>
                        {sd.status}
                      </span>
                      <p style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.55, margin: 0 }}>
                        {sd.details || m.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ── DEEP AGENT ANALYSIS ──────────────────────────────────────── */}
          {agents.some(a => a.data) && (
            <section>
              <SectionHeader
                label="AI Deep Analysis"
                sub="Expanded insights from each specialized AI agent — covering strengths, weaknesses, risks, and strategic recommendations."
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {agents.map(({ key, label, icon: Icon, data, color, bgColor, bdrColor }) => {
                  if (!data) return null;
                  const isOpen  = expandedAgent === key;
                  const agentBadge = verdictMeta(data.verdict, isLight);
                  const agentScore = Math.round(data.score || 0);
                  const agentColor = scoreColor(agentScore, isLight);

                  return (
                    <div key={key} style={{ background: T.surface, border: `1px solid ${isOpen ? color + '40' : T.border}`, borderRadius: 14, overflow: 'hidden', boxShadow: isOpen ? T.shadowMd : T.shadow, transition: 'all 0.2s ease' }}>

                      {/* Accordion header */}
                      <button
                        onClick={() => setExpandedAgent(isOpen ? null : key)}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', background: 'transparent', border: 'none', cursor: 'pointer', gap: 16, textAlign: 'left' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                          <div style={{ width: 42, height: 42, borderRadius: 11, background: bgColor, border: `1px solid ${bdrColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Icon size={18} style={{ color }} />
                          </div>
                          <div>
                            <p style={{ fontSize: 14, fontWeight: 700, color: T.text1, margin: 0, letterSpacing: '-0.01em' }}>{label}</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: agentBadge.color, background: agentBadge.bg, border: `1px solid ${agentBadge.border}`, borderRadius: 20, padding: '2px 8px' }}>
                                {data.verdict || 'N/A'}
                              </span>
                              <span style={{ fontSize: 11, color: T.text3 }}>
                                Score: <strong style={{ color: agentColor, fontWeight: 800 }}>{agentScore} / 100</strong>
                              </span>
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                          <ScoreArc score={agentScore} size={40} strokeWidth={4} color={agentColor} trackColor={T.track} />
                          {isOpen
                            ? <ChevronUp   size={16} style={{ color: T.text3 }} />
                            : <ChevronDown size={16} style={{ color: T.text3 }} />
                          }
                        </div>
                      </button>

                      {/* Accordion body */}
                      {isOpen && (
                        <div style={{ borderTop: `1px solid ${T.border}`, padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeInUp 0.25s ease-out' }}>

                          {/* Summary paragraph */}
                          {data.summary && (
                            <div style={{ padding: '18px 22px', background: T.surface2, borderRadius: 12, borderLeft: `3px solid ${color}` }}>
                              <p style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color, margin: '0 0 10px' }}>Summary</p>
                              <p style={{ fontSize: 13.5, color: T.text1, lineHeight: 1.8, margin: 0, fontWeight: 500 }}>{data.summary}</p>
                            </div>
                          )}

                          {/* Two-column list grid */}
                          {(() => {
                            const sections = [
                              { title: 'Strengths',          items: data.strengths,           color: T.success  },
                              { title: 'Weaknesses',         items: data.weaknesses,          color: T.danger   },
                              { title: 'Recommendations',    items: data.recommendations,     color: T.brandLight },
                              { title: 'Key Competitors',    items: data.key_competitors,     color: T.warning  },
                              { title: 'Competitive Gaps',   items: data.competitive_gaps,    color: T.purple   },
                              { title: 'Demand Signals',     items: data.demand_signals,      color: T.success  },
                              { title: 'Key Risks',          items: data.risks,               color: T.warning  },
                              { title: 'Innovation Factors', items: data.innovation_factors,  color: T.purple   },
                            ].filter(s => s.items?.length);

                            if (!sections.length) return null;
                            return (
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 20 }}>
                                {sections.map(({ title, items, color: c }) => (
                                  <div key={title} style={{ padding: '16px 18px', background: T.surface2, borderRadius: 12, border: `1px solid ${T.border}` }}>
                                    <p style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.09em', color: c, margin: '0 0 10px' }}>✦ {title}</p>
                                    {renderBullets(items, c)}
                                  </div>
                                ))}
                              </div>
                            );
                          })()}

                          {/* Insight pill cards */}
                          {(() => {
                            const insights = [
                              data.tam_signal            && { title: 'TAM Signal',        value: data.tam_signal,            color: T.brandLight, bg: T.brandBg,  bdr: T.brandBdr  },
                              data.timing_assessment     && { title: 'Market Timing',      value: data.timing_assessment,     color: T.brandLight, bg: T.brandBg,  bdr: T.brandBdr  },
                              data.usp_statement         && { title: 'USP Statement',      value: data.usp_statement,         color: T.purple,     bg: T.purpleBg, bdr: T.purpleBdr },
                              data.defensibility         && { title: 'Defensibility',      value: data.defensibility,         color: T.success,    bg: T.successBg,bdr: T.successBdr},
                              data.differentiation_strength && { title: 'Differentiation', value: data.differentiation_strength, color: T.warning, bg: T.warningBg,bdr: T.warningBdr },
                              data.overall_risk_level    && { title: 'Overall Risk',       value: data.overall_risk_level,    color: T.danger,     bg: T.dangerBg, bdr: T.dangerBdr },
                            ].filter(Boolean);

                            if (!insights.length) return null;
                            return (
                              <div>
                                <p style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: T.text3, marginBottom: 12 }}>Key Insights</p>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(190px,1fr))', gap: 10 }}>
                                  {insights.map(({ title, value, color: c, bg, bdr }) => (
                                    <InsightCard key={title} title={title} value={value} color={c} bg={bg} bdr={bdr} />
                                  ))}
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* ── CTA FOOTER CARD ──────────────────────────────────────────── */}
          <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: '24px 28px', boxShadow: T.shadow, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <p style={{ fontSize: 15, fontWeight: 700, color: T.text1, margin: '0 0 4px', letterSpacing: '-0.01em' }}>Ready to build your execution roadmap?</p>
              <p style={{ fontSize: 12.5, color: T.text2, margin: 0, lineHeight: 1.6 }}>
                Save this analysis and generate an AI-powered roadmap — assign tasks to your team by role and skill.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
              <button onClick={() => navigate('/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 8, border: `1px solid ${T.border}`, background: T.surface2, color: T.text2, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', lineHeight: 1 }}>
                <LayoutDashboard size={13} />Dashboard
              </button>
              <button onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 22px', borderRadius: 8, border: 'none', background: T.brand, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', boxShadow: T.shadowBrand, transition: 'all 0.2s', lineHeight: 1 }}>
                <Rocket size={13} />Save & Build Roadmap
              </button>
            </div>
          </div>

        </div>
      </main>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer style={{ borderTop: `1px solid ${T.border}`, padding: '24px', textAlign: 'center', fontSize: 12, color: T.text3, background: T.surface }}>
        <span>© {new Date().getFullYear()} StartupXpert &nbsp;·&nbsp; AI Feasibility Engine &nbsp;·&nbsp; </span>
        <span style={{ color: T.brandLight, fontWeight: 600 }}>Powered by AI</span>
      </footer>
    </div>
  );
};

export default AnalysisResult;
