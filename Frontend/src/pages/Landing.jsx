import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useStartup } from '../context/StartupContext';
import { useToast } from '../context/ToastContext';
import { 
  ArrowRight, 
  Lightbulb, 
  Compass, 
  FileText, 
  Star, 
  Sparkles, 
  Activity, 
  LineChart, 
  ShieldCheck, 
  Award,
  Zap
} from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { isLoggedIn } = useStartup();

  // Redirect authenticated sessions immediately to Dashboard (Auth Flow Redirect)
  useEffect(() => {
    if (isLoggedIn) {
      navigate('/dashboard', { replace: true });
    }
  }, [isLoggedIn, navigate]);

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
    <div className="relative min-h-screen bg-[#0a0a0f] flex flex-col justify-between overflow-x-hidden text-white font-sans transition-all duration-300">
      
      {/* Premium ambient light filters */}
      <div className="absolute top-0 left-1/4 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute top-1/3 right-1/4 h-[500px] w-[500px] translate-x-1/2 rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none"></div>

      <Navbar />

      {/* SECTION 1 — HERO REDESIGN */}
      <main className="relative z-10 flex-grow flex flex-col items-center justify-center py-16 lg:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Two-Column Premium Hero Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center w-full">
          
          {/* Left Column: Text & Badges */}
          <div className="lg:col-span-7 text-left space-y-8 max-w-2xl mx-auto lg:mx-0">
            
            {/* Small Floating Badges Row */}
            <div className="flex flex-wrap gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/5 px-3.5 py-1 text-2xs font-bold uppercase tracking-wider text-indigo-300">
                <Sparkles className="h-3 w-3 text-indigo-400" />
                AI Validation
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/5 px-3.5 py-1 text-2xs font-bold uppercase tracking-wider text-cyan-300">
                <Activity className="h-3 w-3 text-cyan-400" />
                Risk Analysis
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/5 px-3.5 py-1 text-2xs font-bold uppercase tracking-wider text-emerald-300">
                <Zap className="h-3 w-3 text-emerald-400" />
                Roadmap Generation
              </span>
            </div>

            <div className="space-y-4">
              <h1 className="font-heading text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
                Validate. Plan. <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-indigo-500 to-cyan-300 drop-shadow-[0_0_35px_rgba(99,102,241,0.3)]">
                  Launch.
                </span>
              </h1>
              <p className="text-sm sm:text-base leading-relaxed text-gray-400 max-w-xl">
                AI-powered startup lifecycle platform helping founders validate, analyze and launch ideas faster. Stress-test your concept models against 250+ active market variables.
              </p>
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
              <Link
                to="/register"
                className="group relative w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-8 py-4 text-xs font-bold uppercase tracking-wider text-white shadow-[0_0_30px_rgba(99,102,241,0.3)] hover:bg-indigo-500 hover:scale-[1.02] transition-all duration-300 focus:ring-2 focus:ring-indigo-500"
              >
                Get Started
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              
              <Link
                to="/login"
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-indigo-500/20 bg-[#0e0e16]/80 px-8 py-4 text-xs font-bold uppercase tracking-wider text-gray-300 hover:bg-indigo-500/10 hover:text-white transition-all duration-300 focus:ring-2 focus:ring-indigo-500"
              >
                Login
              </Link>
            </div>

            {/* Premium Startup Metric Chips */}
            <div className="pt-8 border-t border-indigo-500/5 grid grid-cols-3 gap-4">
              <div className="space-y-0.5">
                <span className="text-xs text-gray-500 block font-semibold uppercase tracking-wider">Accuracy</span>
                <span className="font-heading text-lg sm:text-xl font-black text-indigo-400 block">89% Prediction</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-xs text-gray-500 block font-semibold uppercase tracking-wider">Volume</span>
                <span className="font-heading text-lg sm:text-xl font-black text-cyan-400 block">1000+ Validated</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-xs text-gray-500 block font-semibold uppercase tracking-wider">Diversity</span>
                <span className="font-heading text-lg sm:text-xl font-black text-emerald-400 block">50+ Domains</span>
              </div>
            </div>

          </div>

          {/* Right Column: Premium Visual Showcase Card */}
          <div className="lg:col-span-5 flex items-center justify-center">
            
            {/* Glassmorphism Floating Dashboard Card */}
            <div className="relative w-full max-w-sm rounded-2xl border border-indigo-500/15 bg-indigo-950/20 p-6 shadow-2xl backdrop-blur-md animate-float overflow-hidden group hover:border-indigo-500/35 transition-all duration-500">
              
              {/* Background ambient pulse */}
              <div className="absolute -right-24 -top-24 h-48 w-48 rounded-full bg-indigo-500/10 blur-2xl group-hover:bg-indigo-500/15 transition-all duration-500"></div>

              {/* Console Mockup Header */}
              <div className="flex items-center justify-between border-b border-indigo-500/10 pb-4 mb-4">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-500/70"></span>
                  <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/70"></span>
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70"></span>
                </div>
                <span className="text-[9px] font-bold font-mono tracking-widest text-indigo-400/80 uppercase">Venture Analyst v1.0</span>
              </div>

              {/* Console Body Content */}
              <div className="space-y-4 text-left">
                
                {/* Param 1: Market Demand */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400 font-semibold uppercase tracking-wider text-[10px]">Market Demand Index</span>
                    <span className="font-bold text-indigo-400">82% (Excellent)</span>
                  </div>
                  <div className="h-2 w-full bg-[#0a0a0f] border border-indigo-500/10 rounded-full overflow-hidden">
                    <div className="h-full w-[82%] bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                  </div>
                </div>

                {/* Grid for other stats */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  {/* Param 2: Risk */}
                  <div className="p-3.5 rounded-xl border border-indigo-500/10 bg-[#0e0e16]/80 space-y-1 relative">
                    <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block">Risk Threat</span>
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wide block flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping"></span>
                      Medium
                    </span>
                  </div>

                  {/* Param 3: Scalability */}
                  <div className="p-3.5 rounded-xl border border-indigo-500/10 bg-[#0e0e16]/80 space-y-1">
                    <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block">Scalability</span>
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide block">
                      High Growth
                    </span>
                  </div>
                </div>

                {/* Param 4: Revenue Potential */}
                <div className="p-3.5 rounded-xl border border-indigo-500/10 bg-[#0e0e16]/80 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Revenue Forecast</span>
                    <span className="text-[10px] font-black text-cyan-400">High LTV</span>
                  </div>
                  <div className="flex items-end gap-1 h-6 pt-1">
                    <div className="w-full h-[30%] bg-indigo-500/20 rounded-sm"></div>
                    <div className="w-full h-[50%] bg-indigo-500/30 rounded-sm"></div>
                    <div className="w-full h-[45%] bg-indigo-500/40 rounded-sm"></div>
                    <div className="w-full h-[70%] bg-cyan-400/60 rounded-sm"></div>
                    <div className="w-full h-[90%] bg-cyan-400 rounded-sm shadow-[0_0_8px_rgba(34,211,238,0.4)]"></div>
                  </div>
                </div>

              </div>

            </div>

          </div>

        </div>

        {/* SECTION 2 — HANDCRAFTED PREMIUM FEATURE CARDS */}
        <section className="pt-8 w-full max-w-5xl mx-auto">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            
            {/* CARD 1: Idea Validation */}
            <div className="relative group flex flex-col justify-between p-7.5 rounded-2xl border border-indigo-500/10 bg-[#0e0e16]/60 backdrop-blur-md hover:-translate-y-1.5 hover:border-indigo-500/35 hover:bg-[#0e0e16]/90 hover:shadow-[0_0_35px_rgba(99,102,241,0.15)] transition-all duration-500 overflow-hidden text-left">
              <div className="absolute -right-16 -top-16 h-32 w-32 rounded-full bg-indigo-500/5 blur-2xl group-hover:bg-indigo-500/10 transition-colors duration-500"></div>
              
              <div>
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 group-hover:border-cyan-400/40 group-hover:bg-cyan-500/5 group-hover:text-cyan-300 transition-all duration-500 group-hover:shadow-[0_0_15px_rgba(99,102,241,0.25)]">
                  <Lightbulb className="h-5.5 w-5.5 transition-transform duration-500 group-hover:rotate-6" />
                </div>
                
                <h3 className="font-heading text-lg font-bold text-white tracking-tight mb-2">
                  Idea Validation
                </h3>
                
                <p className="text-xs sm:text-sm leading-relaxed text-gray-400">
                  Analyze startup feasibility, problem-solution fit, and real market dynamics.
                </p>
              </div>

              {/* Card 1 Mini metric preview */}
              <div className="mt-5 flex items-center justify-between p-3 rounded-xl border border-indigo-500/15 bg-indigo-950/20 backdrop-blur-sm">
                <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Confidence Index</span>
                <span className="text-[10px] font-black text-indigo-400 font-mono">82% Market Match</span>
              </div>

              <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-500 group-hover:w-full"></div>
            </div>

            {/* CARD 2: Roadmap Generator */}
            <div className="relative group flex flex-col justify-between p-7.5 rounded-2xl border border-indigo-500/10 bg-[#0e0e16]/60 backdrop-blur-md hover:-translate-y-1.5 hover:border-indigo-500/35 hover:bg-[#0e0e16]/90 hover:shadow-[0_0_35px_rgba(99,102,241,0.15)] transition-all duration-500 overflow-hidden text-left">
              <div className="absolute -right-16 -top-16 h-32 w-32 rounded-full bg-cyan-500/5 blur-2xl group-hover:bg-cyan-500/10 transition-colors duration-500"></div>
              
              <div>
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 group-hover:border-cyan-400/40 group-hover:bg-cyan-500/5 group-hover:text-cyan-300 transition-all duration-500 group-hover:shadow-[0_0_15px_rgba(99,102,241,0.25)]">
                  <Compass className="h-5.5 w-5.5 transition-transform duration-500 group-hover:scale-110" />
                </div>
                
                <h3 className="font-heading text-lg font-bold text-white tracking-tight mb-2">
                  Roadmap Generator
                </h3>
                
                <p className="text-xs sm:text-sm leading-relaxed text-gray-400">
                  Generate startup execution roadmaps, milestone maps, and project tasks lists.
                </p>
              </div>

              {/* Card 2 Timeline preview visual */}
              <div className="mt-5 space-y-2 p-3 rounded-xl border border-indigo-500/15 bg-indigo-950/20 text-left">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>
                  <span className="text-[9px] text-gray-400 font-semibold truncate">Phase 1: Validation</span>
                </div>
                <div className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)] ml-0"></div>
              </div>

              <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-500 group-hover:w-full"></div>
            </div>

            {/* CARD 3: Documentation Generator */}
            <div className="relative group flex flex-col justify-between p-7.5 rounded-2xl border border-indigo-500/10 bg-[#0e0e16]/60 backdrop-blur-md hover:-translate-y-1.5 hover:border-indigo-500/35 hover:bg-[#0e0e16]/90 hover:shadow-[0_0_35px_rgba(99,102,241,0.15)] transition-all duration-500 overflow-hidden text-left">
              <div className="absolute -right-16 -top-16 h-32 w-32 rounded-full bg-emerald-500/5 blur-2xl group-hover:bg-emerald-500/10 transition-colors duration-500"></div>
              
              <div>
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 group-hover:border-cyan-400/40 group-hover:bg-cyan-500/5 group-hover:text-cyan-300 transition-all duration-500 group-hover:shadow-[0_0_15px_rgba(99,102,241,0.25)]">
                  <FileText className="h-5.5 w-5.5 transition-transform duration-500 group-hover:scale-110" />
                </div>
                
                <h3 className="font-heading text-lg font-bold text-white tracking-tight mb-2">
                  Documentation Generator
                </h3>
                
                <p className="text-xs sm:text-sm leading-relaxed text-gray-400">
                  Compile professional pitch decks, financial summaries, and compliance filings.
                </p>
              </div>

              {/* Card 3 Document stack preview */}
              <div className="mt-5 flex items-center relative h-8 w-full overflow-hidden pl-2">
                <div className="absolute left-0 bottom-0 h-6.5 w-16 rounded border border-indigo-500/10 bg-indigo-950/40 transform -rotate-6 z-0 shadow-md"></div>
                <div className="absolute left-3 bottom-0 h-7 w-16 rounded border border-indigo-500/20 bg-indigo-900/40 transform -rotate-3 z-10 shadow-md"></div>
                <div className="absolute left-6 bottom-0 h-7.5 w-18 rounded border border-indigo-500/30 bg-[#0e0e16] z-20 flex items-center justify-center shadow-lg">
                  <span className="text-[7px] font-bold text-indigo-400 tracking-widest uppercase">Pitch Deck</span>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-500 group-hover:w-full"></div>
            </div>

          </div>
        </section>

      </main>

      {/* SECTION 3 — PREMIUM FOOTER */}
      <footer className="border-t border-indigo-500/5 py-12 bg-[#08080c]/60 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-8 text-sm">
          
          {/* Left Side: Brand Logo & Description */}
          <div className="text-left space-y-2.5 max-w-xs flex flex-col">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-indigo-500/30 bg-indigo-500/10">
                <Sparkles className="h-4 w-4 text-indigo-400" />
              </div>
              <span className="font-heading text-base font-bold text-white">
                Startup<span className="text-indigo-500">Xpert</span>
              </span>
            </Link>
            <p className="text-2xs leading-relaxed text-gray-500">
              The AI-powered venture engine helping founders validate and launch ideas with data-driven feasibility scorecards.
            </p>
          </div>

          {/* Center Column: Quick Navigation matrix */}
          <nav className="flex flex-wrap justify-center gap-6 text-gray-500 text-xs uppercase tracking-wider font-semibold">
            <Link to="/" className="hover:text-white transition-colors duration-300">
              Home
            </Link>
            <a 
              href="/dashboard" 
              onClick={(e) => handleFooterLink('/dashboard', e)}
              className="hover:text-white transition-colors duration-300"
            >
              Dashboard
            </a>
            <a 
              href="/profile" 
              onClick={(e) => handleFooterLink('/profile', e)}
              className="hover:text-white transition-colors duration-300"
            >
              Profile
            </a>
            <a 
              href="/settings" 
              onClick={(e) => handleFooterLink('/settings', e)}
              className="hover:text-white transition-colors duration-300"
            >
              Settings
            </a>
          </nav>

          {/* Right Column: Custom Inline SVGs & Version Tag */}
          <div className="flex flex-col items-center md:items-end gap-3 text-gray-500 text-xs">
            <div className="flex items-center gap-3">
              <a href="#" className="hover:text-white transition-colors" aria-label="Twitter X link">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="#" className="hover:text-white transition-colors" aria-label="LinkedIn link">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0z"/>
                </svg>
              </a>
              <a href="#" className="hover:text-white transition-colors" aria-label="GitHub link">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                </svg>
              </a>
            </div>
            
            <div className="flex items-center gap-2 text-3xs font-bold text-gray-600 uppercase tracking-widest pt-1">
              <span>&copy; {new Date().getFullYear()} StartupXpert</span>
              <span>•</span>
              <span className="rounded bg-indigo-950/40 border border-indigo-500/10 px-2 py-0.5 text-indigo-400">v1.0.0 Stable</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Landing;
