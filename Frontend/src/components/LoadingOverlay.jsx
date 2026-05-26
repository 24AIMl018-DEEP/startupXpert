import React from 'react';
import { useStartup } from '../context/StartupContext';
import { Compass } from 'lucide-react';

const LoadingOverlay = () => {
  const { loadingState } = useStartup();

  if (!loadingState) return null;

  return (
    <div 
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#0a0a0f]/80 backdrop-blur-md shadow-2xl animate-[fadeIn_0.2s_ease-out]"
      role="dialog"
      aria-modal="true"
      aria-label="Loading workspace and compiling models"
    >
      <div className="text-center space-y-6">
        {/* Futuristic Spinner */}
        <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
          <Compass className="h-12 w-12 text-indigo-400 animate-spin-slow" />
          <div className="absolute inset-0 rounded-full border-2 border-indigo-500/10 border-t-indigo-400 animate-spin"></div>
        </div>

        <div className="space-y-1 max-w-xs mx-auto">
          <h3 className="font-heading text-base font-bold text-white tracking-wide">
            StartupXpert Engine
          </h3>
          <p className="text-3xs text-indigo-400 font-bold uppercase tracking-widest font-mono animate-pulse">
            Processing model parameter layers...
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
