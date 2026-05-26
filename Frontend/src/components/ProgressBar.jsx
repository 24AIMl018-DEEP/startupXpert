import React from 'react';
import { Check } from 'lucide-react';

const ProgressBar = ({ currentStep }) => {
  const steps = [
    { id: 1, name: 'Profile & Role', description: 'Step 1' },
    { id: 2, name: 'Startup Details', description: 'Step 2' },
    { id: 3, name: 'Idea Validation', description: 'Step 3' },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8">
      <div className="relative flex items-center justify-between">
        {/* Background Track Line */}
        <div className="absolute left-0 top-1/2 h-[3px] w-full -translate-y-1/2 bg-indigo-950/40"></div>
        
        {/* Active Fill Track Line */}
        <div 
          className="absolute left-0 top-1/2 h-[3px] -translate-y-1/2 bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        ></div>

        {/* Step Nodes */}
        {steps.map((step) => {
          const isCompleted = currentStep > step.id;
          const isActive = currentStep === step.id;
          
          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center">
              {/* Step Circle */}
              <div 
                className={`flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-500 ${
                  isCompleted 
                    ? 'border-cyan-400 bg-cyan-950/80 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.25)]' 
                    : isActive 
                      ? 'border-indigo-500 bg-indigo-950 text-white font-bold ring-4 ring-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.4)]'
                      : 'border-indigo-950 bg-[#0a0a0f] text-gray-500'
                }`}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5 stroke-[2.5]" />
                ) : (
                  <span className="text-sm font-heading">{step.id}</span>
                )}
              </div>
              
              {/* Step Labels */}
              <span 
                className={`absolute top-12 mt-1 whitespace-nowrap text-xs font-semibold uppercase tracking-wider transition-colors duration-300 ${
                  isActive ? 'text-indigo-400 font-bold' : isCompleted ? 'text-cyan-400' : 'text-gray-600'
                }`}
              >
                {step.description}
              </span>
              <span 
                className={`absolute top-16 mt-0.5 whitespace-nowrap text-xs transition-colors duration-300 ${
                  isActive ? 'text-white font-medium' : isCompleted ? 'text-gray-300' : 'text-gray-500'
                }`}
              >
                {step.name}
              </span>
            </div>
          );
        })}
      </div>
      
      {/* Spacer to prevent overlaps with labels */}
      <div className="h-12"></div>
    </div>
  );
};

export default ProgressBar;
