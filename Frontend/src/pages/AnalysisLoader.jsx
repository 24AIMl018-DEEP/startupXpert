import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStartup } from '../context/StartupContext';
import { useStartupStorage } from '../hooks/useStartupStorage';
import Navbar from '../components/Navbar';
import { XCircle, CheckCircle2, Sparkles } from 'lucide-react';

// Platform icons being "searched" — fun visual
const PLATFORMS = [
  { name: 'Reddit',       color: '#ff4500', bg: 'rgba(255,69,0,0.12)',    letter: 'R' },
  { name: 'LinkedIn',     color: '#0077b5', bg: 'rgba(0,119,181,0.12)',   letter: 'in' },
  { name: 'Quora',        color: '#b92b27', bg: 'rgba(185,43,39,0.12)',   letter: 'Q' },
  { name: 'HackerNews',   color: '#ff6600', bg: 'rgba(255,102,0,0.12)',   letter: 'Y' },
  { name: 'ProductHunt',  color: '#da552f', bg: 'rgba(218,85,47,0.12)',   letter: '▲' },
  { name: 'GitHub',       color: '#6e7681', bg: 'rgba(110,118,129,0.12)', letter: 'GH' },
  { name: 'Twitter/X',    color: '#1da1f2', bg: 'rgba(29,161,242,0.12)',  letter: 'X' },
  { name: 'Crunchbase',   color: '#0288d1', bg: 'rgba(2,136,209,0.12)',   letter: 'CB' },
  { name: 'G2',           color: '#ff492c', bg: 'rgba(255,73,44,0.12)',   letter: 'G2' },
  { name: 'SimilarWeb',   color: '#2a6ebb', bg: 'rgba(42,110,187,0.12)',  letter: 'SW' },
];

const AGENT_STEPS = [
  { agent: 'Market Agent',       task: 'Scanning market demand signals',         platform: 0 },
  { agent: 'Competitor Agent',   task: 'Analyzing competitive landscape',         platform: 1 },
  { agent: 'Trend Agent',        task: 'Tracking emerging trends',                platform: 2 },
  { agent: 'Customer Agent',     task: 'Profiling target audience segments',      platform: 3 },
  { agent: 'Problem Agent',      task: 'Validating problem-solution alignment',   platform: 4 },
  { agent: 'Technology Agent',   task: 'Assessing tech stack feasibility',        platform: 5 },
  { agent: 'Founder Agent',      task: 'Benchmarking founder-market fit',         platform: 6 },
  { agent: 'Feasibility AI',     task: 'Computing feasibility score',             platform: 7 },
  { agent: 'Risk Analysis AI',   task: 'Scoring risk exposure matrix',            platform: 8 },
  { agent: 'Innovation AI',      task: 'Measuring innovation & USP strength',     platform: 9 },
];

const INTERESTING_LINES = [
  'Querying 250+ real-time data points…',
  'Cross-referencing competitor strategies…',
  'Running feasibility simulation…',
  'Stress-testing your revenue model…',
  'Analyzing market timing signals…',
  'Computing innovation index…',
  'Building your AI scorecard…',
];

const AnalysisLoader = () => {
  const navigate = useNavigate();
  const { startupDetails, onboardingRole, runAnalysis, saveDraft } = useStartup();
  const { saveDraft: saveLocalDraft } = useStartupStorage();

  const [progress,      setProgress]      = useState(0);
  const [activeStep,    setActiveStep]    = useState(0);
  const [activePlatform,setActivePlatform]= useState(0);
  const [textLine,      setTextLine]      = useState(0);
  const [error,         setError]         = useState(null);
  const calledRef = useRef(false);

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;

    saveDraft(onboardingRole, startupDetails, 3);
    saveLocalDraft(onboardingRole, startupDetails, 3);

    const stepTimer = setInterval(() => {
      setActiveStep(p => p < AGENT_STEPS.length - 1 ? p + 1 : p);
    }, 4200 / AGENT_STEPS.length);

    const platformTimer = setInterval(() => {
      setActivePlatform(p => (p + 1) % PLATFORMS.length);
    }, 1200);

    const textTimer = setInterval(() => {
      setTextLine(p => (p + 1) % INTERESTING_LINES.length);
    }, 2200);

    const progressTimer = setInterval(() => {
      setProgress(p => p < 90 ? p + 1 : p);
    }, 45);

    runAnalysis(startupDetails, onboardingRole)
      .then(() => { clearInterval(progressTimer); setProgress(100); })
      .catch(err => {
        clearInterval(stepTimer); clearInterval(progressTimer);
        clearInterval(platformTimer); clearInterval(textTimer);
        setError(err.message || 'Analysis failed. Please try again.');
      });

    return () => {
      clearInterval(stepTimer); clearInterval(progressTimer);
      clearInterval(platformTimer); clearInterval(textTimer);
    };
  }, []);

  useEffect(() => {
    if (progress === 100) {
      const t = setTimeout(() => navigate('/analysis/result'), 700);
      return () => clearTimeout(t);
    }
  }, [progress, navigate]);

  const platform = PLATFORMS[activePlatform];
  const step     = AGENT_STEPS[Math.min(activeStep, AGENT_STEPS.length - 1)];

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      {/* Background dots */}
      <div className="dots-bg" style={{ position: 'absolute', inset: 0, opacity: 0.4 }} />
      <div className="glow-brand animate-pulse-soft" style={{ width: 600, height: 600, top: -100, left: '20%' }} />

      <Navbar />

      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative', zIndex: 1 }}>
        <div style={{ width: '100%', maxWidth: 520 }}>

          {error ? (
            /* ── Error State ── */
            <div className="glass-card animate-scale-in" style={{ padding: 36, textAlign: 'center' }}>
              <XCircle size={48} style={{ color: 'var(--red)', margin: '0 auto 16px' }} />
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text1)', marginBottom: 8 }}>Analysis Failed</h2>
              <p style={{ fontSize: 13, color: 'var(--red)', marginBottom: 8, lineHeight: 1.6 }}>{error}</p>
              <p style={{ fontSize: 12, color: 'var(--green)', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <CheckCircle2 size={13} /> Your data is saved — pre-filled on retry
              </p>
              <button onClick={() => navigate('/onboarding/details')} className="btn btn-primary">
                Go Back & Retry
              </button>
            </div>
          ) : (
            /* ── Loading State ── */
            <div className="animate-fade-up">

              {/* Top label */}
              <div style={{ textAlign: 'center', marginBottom: 32 }}>
                <div className="badge badge-brand" style={{ marginBottom: 12 }}>
                  <Sparkles size={10} /> AI Analysis Running
                </div>
                <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text1)', marginBottom: 6, letterSpacing: '-0.02em' }}>
                  Analyzing "{startupDetails.startupName || 'Your Startup'}"
                </h1>
                <p style={{ fontSize: 12, color: 'var(--text2)', height: 18, transition: 'opacity 0.3s', fontFamily: 'var(--font-mono)' }}>
                  {INTERESTING_LINES[textLine]}
                </p>
              </div>

              {/* Main card */}
              <div className="glass-card" style={{ padding: 28, marginBottom: 16 }}>

                {/* Active platform being searched */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, padding: '12px 16px', borderRadius: 'var(--r-md)', background: 'var(--surface2)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                    Querying data from
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} key={activePlatform} className="animate-fade-in">
                    <div style={{ width: 24, height: 24, borderRadius: 6, background: platform.bg, border: `1px solid ${platform.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, color: platform.color, fontFamily: 'var(--font-mono)' }}>
                      {platform.letter}
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text1)' }}>{platform.name}</span>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)' }} className="animate-pulse-soft" />
                  </div>
                </div>

                {/* Platform icons strip */}
                <div style={{ display: 'flex', gap: 6, marginBottom: 24, flexWrap: 'wrap' }}>
                  {PLATFORMS.map((p, i) => (
                    <div key={i} style={{
                      width: 28, height: 28, borderRadius: 7,
                      background: i === activePlatform ? p.bg : 'var(--surface3)',
                      border: `1px solid ${i === activePlatform ? p.color + '50' : 'var(--border)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 8, fontWeight: 800, color: i === activePlatform ? p.color : 'var(--text3)',
                      transition: 'all 0.3s', fontFamily: 'var(--font-mono)',
                      transform: i === activePlatform ? 'scale(1.15)' : 'scale(1)',
                    }}>
                      {p.letter}
                    </div>
                  ))}
                </div>

                {/* Active agent */}
                <div style={{ marginBottom: 20 }} key={activeStep} className="animate-fade-in">
                  <div style={{ fontSize: 10, color: 'var(--brand-light)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                    {step.agent}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text1)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', border: '2px solid var(--brand-light)', borderTopColor: 'transparent', animation: 'spinSlow 0.8s linear infinite', flexShrink: 0 }} />
                    {step.task}
                  </div>
                </div>

                {/* Steps checklist */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 20 }}>
                  {AGENT_STEPS.slice(0, 6).map((s, i) => {
                    const done   = i < activeStep;
                    const active = i === activeStep;
                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, transition: 'all 0.3s',
                        color: done ? 'var(--green)' : active ? 'var(--text1)' : 'var(--text3)',
                        fontWeight: active ? 600 : 400,
                      }}>
                        {done
                          ? <CheckCircle2 size={13} style={{ color: 'var(--green)', flexShrink: 0 }} />
                          : active
                          ? <div style={{ width: 13, height: 13, borderRadius: '50%', border: '1.5px solid var(--brand)', borderTopColor: 'transparent', animation: 'spinSlow 0.7s linear infinite', flexShrink: 0 }} />
                          : <div style={{ width: 13, height: 13, borderRadius: '50%', border: '1.5px solid var(--border2)', flexShrink: 0 }} />
                        }
                        {s.agent}
                      </div>
                    );
                  })}
                </div>

                {/* Progress bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontWeight: 700, color: 'var(--text3)', marginBottom: 6, fontFamily: 'var(--font-mono)' }}>
                    <span>PROGRESS</span>
                    <span style={{ color: 'var(--brand-light)' }}>{progress}%</span>
                  </div>
                  <div className="progress-track" style={{ height: 6 }}>
                    <div className="progress-fill" style={{ width: `${progress}%`, height: '100%' }} />
                  </div>
                </div>
              </div>

              {/* Fun fact below */}
              <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--text3)', lineHeight: 1.6 }}>
                ⚡ Your startup is being benchmarked against <span style={{ color: 'var(--brand-light)', fontWeight: 700 }}>250+ market variables</span> in real-time
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AnalysisLoader;
