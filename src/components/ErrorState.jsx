import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

const ErrorState = ({ title = 'Transaction Error', message = 'Something went wrong while processing your request.', onRetry }) => {
  return (
    <div 
      className="flex flex-col items-center justify-center p-8 rounded-2xl border border-rose-500/10 bg-rose-950/5 max-w-md mx-auto text-center space-y-6 shadow-lg shadow-rose-950/5"
      role="alert"
      aria-label={`Error occurred: ${title}. ${message}`}
    >
      {/* Broken Circuit visual icon */}
      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-rose-500/25 bg-rose-950/20 text-rose-400">
        <AlertCircle className="h-7 w-7" aria-hidden="true" />
      </div>

      <div className="space-y-2">
        <h3 className="font-heading text-base font-bold text-white tracking-wide">
          {title}
        </h3>
        <p className="text-xs leading-relaxed text-gray-400">
          {message}
        </p>
      </div>

      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-rose-600/10 hover:bg-rose-500 hover:scale-[1.02] transition-all duration-300 focus:ring-2 focus:ring-rose-500 focus:outline-none"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Retry Action
        </button>
      )}
    </div>
  );
};

export default ErrorState;
