import React from 'react';
import { HelpCircle } from 'lucide-react';

const EmptyState = ({ title = 'No items found', message = 'There are no active records in this section.', icon: Icon = HelpCircle }) => {
  return (
    <div 
      className="flex flex-col items-center justify-center p-12 rounded-2xl border border-indigo-500/10 bg-[#0e0e16]/60 backdrop-blur-md text-center space-y-4 max-w-sm mx-auto"
      role="status"
      aria-label={`${title}. ${message}`}
    >
      {/* Icon frame */}
      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/5 text-indigo-400">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </div>

      <div className="space-y-1">
        <h4 className="text-sm font-bold text-white tracking-wide">
          {title}
        </h4>
        <p className="text-xs leading-relaxed text-gray-500">
          {message}
        </p>
      </div>
    </div>
  );
};

export default EmptyState;
