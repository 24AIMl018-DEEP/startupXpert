import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useStartup } from '../context/StartupContext';
import { useToast } from '../context/ToastContext';
import {
  ArrowRight,
  Lightbulb,
  Compass,
  FileText,
  Sparkles,
  Activity,
  Zap,
  CheckCircle2,
  Star,
  Quote,
} from 'lucide-react';

/* ── Animated counter hook ── */
const useCounter = (target, duration = 1800, start = false) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
};

const Landing = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { isLoggedIn } = useStartup();
  const statsRef = useRef(null);
  const [statsVisible, setStatsVisible] = useState(false);

  const agents  = useCounter(50,  1600, statsVisible);
  const vars    = useCounter(250, 1800, statsVisible);
  const dims    = useCounter(5,   1200, statsVisible);

  useEffect(() => {
    if (isLoggedIn) navigate('/dashboard', { replace: true });
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  const handleFooterLink = (path, e) => {
    e.preventDefault();
    if (isLoggedIn) {
      navigate(path);
    } else {
      showToast('Please sign in to access your secure workspace.', 'warning');
      navigate('/login');
    }
  };

  return (
    <div
      style={{ background: 'var(--bg)', color: 'var(--text1)', minHeight: '100vh' }}
      className="relative flex flex-col overflow-x-hidden"
    >
      {/* Ambient glows */}
      <div className="glow-brand animate-pulse-soft" style={{ width: 600, height: 600, top: -100, left: '10%' }} />
      <div className="glow-cyan-orb" style={{ width: 500, height: 500, top: '30%', right: '5%' }} />
      <div className="glow-green-orb" style={{ width: 400, height: 400, bottom: '10%', left: '5%' }} />

      <Navbar />

      <main className="relative z-10 flex-grow flex flex-col items-center py-16 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 gap-24">

        {/* ── HERO ── */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center w-full animate-fade-up">

          {/* Left: Text */}
          <div className="lg:col-span-7 text-left space-y-8 max-w-2xl mx-auto lg:mx-0">

            {/* Badges */}
            <div className="flex flex-wrap gap-2.5">
              <span className="badge badge-brand">
                <Sparkles className="h-3 w-3" /> AI Validation
              </span>
              <span className="badge badge-cyan">
                <Activity className="h-3 w-3" /> Risk Analysis
              </span>
              <span className="badge badge-ghost">
                <Zap className="h-3 w-3" /> Roadmap Generation
              </span>
            </div>

            <div className="space-y-4">
              <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', fontWeight: 900, lineHeight: 1.08, letterSpacing: '-0.03em', color: 'var(--text1)' }}>
                Validate. Plan.<br className="hidden sm:inline" />
                <span className="gradient-text"> Launch.</span>
              </h1>
              <p style={{ fontSize: '0.9375rem', lineHeight: 1.75, color: 'var(--text2)', maxWidth: 520 }}>
                AI-powered startup lifecycle platform helping founders validate, analyze and launch ideas faster.
                Stress-test your concept against 250+ active market variables.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
              <Link to="/register" className="btn btn-primary btn-lg w-full sm:w-auto">
                Get Started <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/login" className="btn btn-outline btn-lg w-full sm:w-auto">
                Sign In
              </Link>
            </div>

            {/* Metric chips */}
            <div style={{ paddingTop: 24, borderTop: '1px solid var(--border)', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {[
                { label: 'Accuracy',  val: '89%',         sub: 'Prediction',  color: 'var(--brand-light)' },
                { label: 'Volume',    val: '1000+',       sub: 'Validated',   color: 'var(--cyan)' },
                { label: 'Diversity', val: '50+',         sub: 'Domains',     color: 'var(--green)' },
              ].map(({ label, val, sub, color }) => (
                <div key={label} className="space-y-0.5">
                  <span style={{ fontSize: 10, color: 'var(--text3)', display: 'block', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 900, color, display: 'block', fontFamily: "'JetBrains Mono', monospace" }}>
                    {val} <span style={{ fontSize: '0.75rem', color: 'var(--text2)', fontFamily: 'inherit' }}>{sub}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Preview card */}
          <div className="lg:col-span-5 flex items-center justify-center">
            <div className="glass-card animate-float" style={{ width: '100%', maxWidth: 360, padding: 24, position: 'relative', overflow: 'hidden' }}>
              <div className="glow-brand" style={{ width: 200, height: 200, top: -60, right: -60, opacity: 0.6 }} />

              {/* Window chrome */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 14, marginBottom: 18 }}>
                <div style={{ display: 'flex', gap: 5 }}>
                  {['var(--red)', 'var(--amber)', 'var(--green)'].map((c, i) => (
                    <span key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c, opacity: 0.7 }} />
                  ))}
                </div>
                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--brand-light)', fontFamily: 'monospace' }}>
                  Venture Analyst v1.0
                </span>
              </div>

              {/* Market Demand */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>
                  <span>Market Demand Index</span>
                  <span style={{ color: 'var(--brand-light)' }}>82%</span>
                </div>
                <div className="progress-track" style={{ height: 6 }}>
                  <div className="progress-fill" style={{ width: '82%', height: '100%' }} />
                </div>
              </div>

              {/* Mini stats grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                <div style={{ padding: '10px 12px', borderRadius: 'var(--r)', border: '1px solid var(--border)', background: 'var(--surface2)' }}>
                  <span style={{ fontSize: 9, color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 4 }}>Risk Threat</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--amber)', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--amber)', display: 'inline-block' }} className="animate-pulse-soft" />
                    Medium
                  </span>
                </div>
                <div style={{ padding: '10px 12px', borderRadius: 'var(--r)', border: '1px solid var(--border)', background: 'var(--surface2)' }}>
                  <span style={{ fontSize: 9, color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 4 }}>Scalability</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--green)' }}>High Growth</span>
                </div>
              </div>

              {/* Revenue bars */}
              <div style={{ padding: '10px 12px', borderRadius: 'var(--r)', border: '1px solid var(--border)', background: 'var(--surface2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                  <span>Revenue Forecast</span>
                  <span style={{ color: 'var(--cyan)' }}>High LTV</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 28 }}>
                  {[30, 50, 45, 70, 90].map((h, i) => (
                    <div key={i} style={{ flex: 1, height: `${h}%`, borderRadius: 3, background: i >= 3 ? 'var(--cyan)' : 'var(--brand-bg)', border: i >= 3 ? 'none' : '1px solid var(--brand-border)' }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── ANIMATED COUNTER STATS ── */}
        <section ref={statsRef} className="w-full animate-fade-up delay-150">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            {[
              { value: agents,  suffix: '+', label: 'AI Agents',          sub: 'Specialized analysis models',  color: 'var(--brand-light)' },
              { value: vars,    suffix: '+', label: 'Market Variables',    sub: 'Real-time data points tracked', color: 'var(--cyan)' },
              { value: dims,    suffix: '',  label: 'Analysis Dimensions', sub: 'Deep validation layers',        color: 'var(--green)' },
            ].map(({ value, suffix, label, sub, color }) => (
              <div key={label} className="stat-card text-center">
                <div style={{ fontSize: '2.5rem', fontWeight: 900, color, lineHeight: 1, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '-0.04em', marginBottom: 6 }}>
                  {value}{suffix}
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text1)', marginBottom: 3 }}>{label}</div>
                <div style={{ fontSize: 12, color: 'var(--text3)' }}>{sub}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── FEATURE CARDS ── */}
        <section className="w-full max-w-5xl mx-auto animate-fade-up delay-225">
          <div className="section-header text-center" style={{ marginBottom: 36 }}>
            <div className="section-label" style={{ textAlign: 'center' }}>Platform Features</div>
            <h2 className="section-title" style={{ fontSize: 28, textAlign: 'center' }}>Everything you need to launch</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {[
              {
                icon: Lightbulb,
                title: 'Idea Validation',
                desc: 'Analyze startup feasibility, problem-solution fit, and real market dynamics with 9 AI-scored dimensions.',
                preview: { label: 'Confidence Index', value: '82% Market Match', color: 'var(--brand-light)' },
                glow: 'glow-brand',
              },
              {
                icon: Compass,
                title: 'Roadmap Generator',
                desc: 'Generate startup execution roadmaps, milestone maps, and project task lists assigned to your team.',
                preview: { label: 'Phase 1', value: 'Validation → Launch', color: 'var(--cyan)' },
                glow: 'glow-cyan-orb',
              },
              {
                icon: FileText,
                title: 'Documentation Suite',
                desc: 'Compile professional pitch decks, financial summaries, and compliance filings automatically.',
                preview: { label: 'Output Formats', value: 'PDF · Deck · Report', color: 'var(--text2)' },
                glow: 'glow-green-orb',
              },
            ].map(({ icon: Icon, title, desc, preview, glow }) => (
              <div key={title} className="glass-card" style={{ padding: 28, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className={glow} style={{ width: 160, height: 160, top: -40, right: -40 }} />

                <div style={{ width: 44, height: 44, borderRadius: 'var(--r-md)', background: 'var(--brand-bg)', border: '1px solid var(--brand-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={20} style={{ color: 'var(--brand-light)' }} />
                </div>

                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text1)', marginBottom: 6 }}>{title}</h3>
                  <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7 }}>{desc}</p>
                </div>

                <div style={{ marginTop: 'auto', padding: '10px 12px', borderRadius: 'var(--r)', border: '1px solid var(--border)', background: 'var(--surface2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 9, color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{preview.label}</span>
                  <span style={{ fontSize: 11, fontWeight: 800, color: preview.color, fontFamily: 'monospace' }}>{preview.value}</span>
                </div>

                {/* Bottom accent line */}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, var(--brand), var(--cyan))', opacity: 0, transition: 'opacity 0.3s' }}
                  onMouseEnter={e => { (e.currentTarget).style.opacity = '1'; }}
                  onMouseLeave={e => { (e.currentTarget).style.opacity = '0'; }} />
              </div>
            ))}
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="w-full max-w-4xl mx-auto animate-fade-up delay-300">
          <div className="section-header text-center" style={{ marginBottom: 48 }}>
            <div className="section-label" style={{ textAlign: 'center' }}>Process</div>
            <h2 className="section-title" style={{ fontSize: 28, textAlign: 'center' }}>How it works</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0, position: 'relative' }}>
            {/* Connecting line */}
            <div style={{ position: 'absolute', top: 28, left: '16.5%', right: '16.5%', height: 1, background: 'linear-gradient(90deg, var(--brand), var(--cyan))', opacity: 0.4, zIndex: 0 }} />

            {[
              { step: 1, title: 'Describe',  desc: 'Tell us about your startup idea — the problem, solution, audience, and market.' },
              { step: 2, title: 'Validate',  desc: '5 specialized AI agents analyze 250+ data points across 9 key dimensions.' },
              { step: 3, title: 'Launch',    desc: 'Get your score, roadmap, and actionable plan to take your idea to market.' },
            ].map(({ step, title, desc }, idx) => (
              <div key={step} style={{ textAlign: 'center', padding: '0 20px', position: 'relative', zIndex: 1 }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--brand-bg)', border: '2px solid var(--brand-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 18, fontWeight: 900, color: 'var(--brand-light)', fontFamily: 'monospace', boxShadow: 'var(--shadow-brand)' }}>
                  {step}
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text1)', marginBottom: 8 }}>{title}</h3>
                <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7 }}>{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <section className="w-full max-w-5xl mx-auto animate-fade-up delay-400">
          <div className="section-header text-center" style={{ marginBottom: 36 }}>
            <div className="section-label" style={{ textAlign: 'center' }}>Social Proof</div>
            <h2 className="section-title" style={{ fontSize: 28, textAlign: 'center' }}>Trusted by founders</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            {[
              { name: 'Arjun Mehta',    role: 'Founder, TechBridge',       stars: 5, text: "StartupXpert gave me a reality check and a roadmap in one session. The AI analysis caught blindspots I'd missed for months." },
              { name: 'Sara Collins',   role: 'CEO, NovaMed Health',        stars: 5, text: 'The depth of the market analysis blew me away. We used the validation report to close our seed round.' },
              { name: 'Luis Fernandez', role: 'Co-founder, GreenLogistics', stars: 5, text: 'Exactly what early-stage founders need. Honest scores, clear risks, and an actionable execution plan.' },
            ].map(({ name, role, stars, text }) => (
              <div key={name} className="glass-card" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', gap: 3 }}>
                  {Array.from({ length: stars }).map((_, i) => (
                    <Star key={i} size={13} style={{ color: 'var(--amber)', fill: 'var(--amber)' }} />
                  ))}
                </div>
                <Quote size={18} style={{ color: 'var(--brand-border)', flexShrink: 0 }} />
                <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.75, flex: 1, margin: 0 }}>{text}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--brand-bg)', border: '1px solid var(--brand-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'var(--brand-light)' }}>
                    {name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text1)' }}>{name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)' }}>{role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── HERO CTA BANNER ── */}
        <section className="w-full">
          <div className="glass-card" style={{ padding: '48px 32px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <div className="glow-brand animate-pulse-soft" style={{ width: 500, height: 300, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h2 style={{ fontSize: 28, fontWeight: 900, color: 'var(--text1)', marginBottom: 12, letterSpacing: '-0.02em' }}>
                Ready to validate your idea?
              </h2>
              <p style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 28, lineHeight: 1.7 }}>
                Join thousands of founders using AI to make smarter decisions before they build.
              </p>
              <Link to="/register" className="btn btn-primary btn-xl">
                Start for Free <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '40px 0', background: 'var(--bg-sub)' }} className="relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-8">

          {/* Brand */}
          <div style={{ maxWidth: 280 }} className="space-y-2.5">
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--brand-bg)', border: '1px solid var(--brand-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={13} style={{ color: 'var(--brand)' }} />
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text1)' }}>
                Startup<span style={{ color: 'var(--brand)' }}>Xpert</span>
              </span>
            </Link>
            <p style={{ fontSize: 11, color: 'var(--text3)', lineHeight: 1.6 }}>
              AI-powered venture engine helping founders validate and launch ideas with data-driven feasibility scorecards.
            </p>
          </div>

          {/* Nav */}
          <nav style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 24 }}>
            {[
              { label: 'Home', path: '/' },
              { label: 'Dashboard', path: '/dashboard', protected: true },
              { label: 'Profile', path: '/profile', protected: true },
              { label: 'Settings', path: '/settings', protected: true },
            ].map(({ label, path, protected: prot }) => (
              prot ? (
                <a key={label} href={path} onClick={(e) => handleFooterLink(path, e)}
                  style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--text1)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}>
                  {label}
                </a>
              ) : (
                <Link key={label} to={path}
                  style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--text1)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}>
                  {label}
                </Link>
              )
            ))}
          </nav>

          {/* Copyright */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
            <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
              {[CheckCircle2, CheckCircle2, CheckCircle2].map((Icon, i) => (
                <Icon key={i} size={13} style={{ color: 'var(--text3)' }} />
              ))}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text3)' }}>
              © {new Date().getFullYear()} StartupXpert
              <span className="badge badge-brand" style={{ marginLeft: 8, fontSize: 9 }}>v1.0.0</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
