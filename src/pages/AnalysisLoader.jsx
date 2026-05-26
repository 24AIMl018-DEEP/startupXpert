import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStartup } from '../context/StartupContext';
import Navbar from '../components/Navbar';
import { Compass, CheckCircle2, ShieldAlert } from 'lucide-react';

const AnalysisLoader = () => {
  const navigate = useNavigate();
  const { setAnalysisScores, startupDetails } = useStartup();
  
  const [progress, setProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    'Reading startup profile',
    'Market demand analysis',
    'Competitor analysis',
    'Revenue estimation',
    'Risk scoring',
    'Innovation check',
    'Feasibility evaluation',
    'Scalability assessment'
  ];

  // Mock score results to load when complete
  const mockResult = {
    marketDemand: { score: 84, status: 'High', details: 'Significant demand driven by rapid digital transformation.' },
    targetAudienceFit: { score: 79, status: 'High', details: 'Niche demographics show high initial willingness to pay.' },
    problemSolutionFit: { score: 88, status: 'High', details: 'Directly addresses friction points identified in user B2B segments.' },
    competitorPresence: { score: 45, status: 'Medium', details: 'Moderately crowded space; unique visual workflows recommended.' },
    revenuePotential: { score: 74, status: 'High', details: 'Subscription-based models support robust recurring revenues.' },
    riskLevel: { score: 38, status: 'Low', details: 'Low regulatory hurdles and low initial capital expenditure.' },
    innovationLevel: { score: 81, status: 'High', details: 'Proprietary automated workflow separates it from incumbents.' },
    scalability: { score: 92, status: 'High', details: 'Zero-marginal-cost distribution models permit rapid growth.' },
    feasibility: { score: 72, status: 'Medium', details: 'Requires specialized tech execution but within standard roadmap.' }
  };

  useEffect(() => {
    // Generate scores into context immediately on analysis loader mount
    setAnalysisScores(mockResult);

    const stepInterval = 4000 / steps.length;
    const progressInterval = 30; // Milliseconds for fluid loading tracking

    // Step Incrementer
    const stepTimer = setInterval(() => {
      setActiveStep((prev) => {
        if (prev < steps.length - 1) return prev + 1;
        clearInterval(stepTimer);
        return prev;
      });
    }, stepInterval);

    // Smooth progress tracker
    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev < 100) {
          return prev + 1;
        } else {
          clearInterval(progressTimer);
          return 100;
        }
      });
    }, progressInterval);

    return () => {
      clearInterval(stepTimer);
      clearInterval(progressTimer);
    };
  }, []);

  // Redirect on hit 100
  useEffect(() => {
    if (progress === 100) {
      const delay = setTimeout(() => {
        navigate('/analysis/result');
      }, 500);
      return () => clearTimeout(delay);
    }
  }, [progress, navigate]);

  return (
    <div className="relative min-h-screen bg-[#0a0a0f] flex flex-col justify-between overflow-x-hidden text-white">
      <Navbar />

      <main className="flex-grow flex flex-col items-center justify-center p-6 relative z-10 max-w-lg mx-auto w-full">
        
        {/* Core Analysis Spinner Area */}
        <div className="w-full text-center space-y-8 rounded-2xl border border-indigo-500/10 bg-[#0e0e16]/80 p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-md relative overflow-hidden">
          
          <div className="absolute -right-16 -top-16 h-32 w-32 rounded-full bg-indigo-500/5 blur-2xl"></div>
          
          {/* Glowing Spinner */}
          <div className="relative mx-auto flex h-24 w-24 items-center justify-center">
            <Compass className="h-16 w-16 text-indigo-400 animate-spin-slow" />
            <div className="absolute inset-0 rounded-full border border-indigo-500/20 border-t-indigo-400 animate-spin"></div>
          </div>

          <div className="space-y-1">
            <h2 className="font-heading text-lg font-bold text-white tracking-wide">
              Analyzing "{startupDetails.startupName || 'Venture Proposal'}"
            </h2>
            <p className="text-2xs text-indigo-400 font-bold uppercase tracking-widest font-mono select-none animate-pulse">
              Stress-Testing Feasibility Matrix...
            </p>
          </div>

          {/* Sequential Checklist UI */}
          <div className="space-y-2 border-y border-indigo-500/5 py-6 text-left max-w-xs mx-auto">
            {steps.map((step, idx) => {
              const isDone = idx < activeStep;
              const isActive = idx === activeStep;

              return (
                <div 
                  key={idx} 
                  className={`flex items-center gap-3 text-xs transition-all duration-300 ${
                    isDone 
                      ? 'text-emerald-400 font-semibold' 
                      : isActive 
                        ? 'text-white font-bold scale-[1.02]' 
                        : 'text-gray-600'
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
                  ) : isActive ? (
                    <div className="h-4.5 w-4.5 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin shrink-0"></div>
                  ) : (
                    <div className="h-4.5 w-4.5 rounded-full border border-gray-800 shrink-0"></div>
                  )}
                  <span>{step}</span>
                </div>
              );
            })}
          </div>

          {/* Progress Indicator Slider */}
          <div className="space-y-2 text-left">
            <div className="flex items-center justify-between text-xs text-gray-500 font-mono font-bold select-none">
              <span>PROGRESS</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 w-full rounded bg-indigo-950/40 border border-indigo-500/5 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-cyan-400 transition-all duration-100 ease-out shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

        </div>
      </main>

      <footer className="border-t border-indigo-500/5 py-6 text-center text-xs text-gray-600 bg-[#08080c]/60">
        &copy; {new Date().getFullYear()} StartupXpert. AI Feasibility Engine.
      </footer>
    </div>
  );
};

export default AnalysisLoader;
