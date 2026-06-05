import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStartup } from '../context/StartupContext';
import Navbar from '../components/Navbar';
import { Compass, CheckCircle2, XCircle } from 'lucide-react';

const STEPS = [
  'Reading startup profile',
  'Market demand analysis',
  'Competitor analysis',
  'Revenue estimation',
  'Risk scoring',
  'Innovation check',
  'Feasibility evaluation',
  'Scalability assessment',
];

const AnalysisLoader = () => {
  const navigate  = useNavigate();
  const { startupDetails, onboardingRole, runAnalysis } = useStartup();

  const [progress,   setProgress]   = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [error,      setError]      = useState(null);
  const calledRef = useRef(false);

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;

    // Smooth progress + step animation (runs independently of API)
    const stepTimer = setInterval(() => {
      setActiveStep(p => (p < STEPS.length - 1 ? p + 1 : p));
    }, 3500 / STEPS.length);

    const progressTimer = setInterval(() => {
      setProgress(p => (p < 90 ? p + 1 : p)); // cap at 90 until API returns
    }, 40);

    // Real API call
    runAnalysis(startupDetails, onboardingRole)
      .then(() => {
        clearInterval(progressTimer);
        setProgress(100);
      })
      .catch((err) => {
        clearInterval(stepTimer);
        clearInterval(progressTimer);
        setError(err.message || 'Analysis failed. Please try again.');
      });

    return () => {
      clearInterval(stepTimer);
      clearInterval(progressTimer);
    };
  }, []);

  // Navigate on complete
  useEffect(() => {
    if (progress === 100) {
      const t = setTimeout(() => navigate('/analysis/result'), 600);
      return () => clearTimeout(t);
    }
  }, [progress, navigate]);

  return (
    <div className="relative min-h-screen bg-[#0a0a0f] flex flex-col justify-between overflow-x-hidden text-white">
      <Navbar />

      <main className="flex-grow flex flex-col items-center justify-center p-6 relative z-10 max-w-lg mx-auto w-full">
        <div className="w-full text-center space-y-8 rounded-2xl border border-indigo-500/10 bg-[#0e0e16]/80 p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-md relative overflow-hidden">
          <div className="absolute -right-16 -top-16 h-32 w-32 rounded-full bg-indigo-500/5 blur-2xl" />

          {error ? (
            <div className="flex flex-col items-center gap-4 py-6">
              <XCircle className="h-14 w-14 text-rose-400" />
              <p className="text-sm text-rose-300 font-semibold">{error}</p>
              <button
                onClick={() => navigate('/onboarding/details')}
                className="mt-2 rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-indigo-500"
              >
                Go Back & Retry
              </button>
            </div>
          ) : (
            <>
              <div className="relative mx-auto flex h-24 w-24 items-center justify-center">
                <Compass className="h-16 w-16 text-indigo-400 animate-spin-slow" />
                <div className="absolute inset-0 rounded-full border border-indigo-500/20 border-t-indigo-400 animate-spin" />
              </div>

              <div className="space-y-1">
                <h2 className="font-heading text-lg font-bold text-white tracking-wide">
                  Analyzing "{startupDetails.startupName || 'Your Startup'}"
                </h2>
                <p className="text-2xs text-indigo-400 font-bold uppercase tracking-widest font-mono select-none animate-pulse">
                  Stress-Testing Feasibility Matrix...
                </p>
              </div>

              <div className="space-y-2 border-y border-indigo-500/5 py-6 text-left max-w-xs mx-auto">
                {STEPS.map((step, idx) => {
                  const isDone   = idx < activeStep;
                  const isActive = idx === activeStep;
                  return (
                    <div
                      key={idx}
                      className={`flex items-center gap-3 text-xs transition-all duration-300 ${
                        isDone ? 'text-emerald-400 font-semibold' : isActive ? 'text-white font-bold scale-[1.02]' : 'text-gray-600'
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      ) : isActive ? (
                        <div className="h-4 w-4 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin shrink-0" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border border-gray-800 shrink-0" />
                      )}
                      <span>{step}</span>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-2 text-left">
                <div className="flex items-center justify-between text-xs text-gray-500 font-mono font-bold select-none">
                  <span>PROGRESS</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 w-full rounded bg-indigo-950/40 border border-indigo-500/5 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-cyan-400 transition-all duration-100 ease-out shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <footer className="border-t border-indigo-500/5 py-6 text-center text-xs text-gray-600 bg-[#08080c]/60">
        &copy; {new Date().getFullYear()} StartupXpert. AI Feasibility Engine.
      </footer>
    </div>
  );
};

export default AnalysisLoader;
