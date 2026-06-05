import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const AnalysisCard = ({ label, score, status, details, icon: Icon }) => {
  
  const getStatusMeta = (stat) => {
    switch (stat) {
      case 'High':
      case 'Low Risk':
        return {
          textColor: 'text-emerald-400',
          borderColor: 'border-emerald-500/20',
          bgColor: 'bg-emerald-950/40',
          trendIcon: TrendingUp,
          trendColor: 'text-emerald-400'
        };
      case 'Medium':
      case 'Medium Risk':
        return {
          textColor: 'text-amber-400',
          borderColor: 'border-amber-500/20',
          bgColor: 'bg-amber-950/40',
          trendIcon: Minus,
          trendColor: 'text-amber-400'
        };
      case 'Low':
      case 'High Risk':
      default:
        return {
          textColor: 'text-rose-400',
          borderColor: 'border-rose-500/20',
          bgColor: 'bg-rose-950/40',
          trendIcon: TrendingDown,
          trendColor: 'text-rose-400'
        };
    }
  };

  const { textColor, borderColor, bgColor, trendIcon: TrendIcon, trendColor } = getStatusMeta(status);

  return (
    <div 
      className="relative flex flex-col justify-between p-6 rounded-2xl border border-indigo-500/10 bg-[#0e0e16]/60 backdrop-blur-md transition-all duration-500 hover:border-indigo-500/30 hover:shadow-[0_0_25px_rgba(99,102,241,0.15)] scale-[1.01]"
      role="region"
      aria-label={`${label} card: Score is ${score}/100, Status: ${status}`}
    >
      {/* Glow orb */}
      <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-indigo-500/5 blur-xl"></div>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-indigo-500/10 bg-indigo-500/5 text-indigo-400">
            {Icon && <Icon className="h-5 w-5" />}
          </div>
          <h4 className="font-heading text-sm font-bold text-white tracking-wide">{label}</h4>
        </div>
        
        {/* Glowing Badge */}
        <span className={`px-2.5 py-0.5 rounded-full text-3xs font-extrabold uppercase tracking-widest ${bgColor} ${borderColor} ${textColor}`}>
          {status}
        </span>
      </div>

      {/* Score gauge & trend index */}
      <div className="flex items-baseline justify-between mb-3 text-left">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-heading font-extrabold text-white">
            {score}
          </span>
          <span className="text-xs text-gray-500">/ 100</span>
        </div>
        
        {/* Trend Indicator */}
        <div className={`flex items-center gap-1 text-[11px] font-bold ${trendColor}`} aria-hidden="true">
          <TrendIcon className="h-4.5 w-4.5" />
          <span>TREND</span>
        </div>
      </div>

      {/* Summary descriptions */}
      <div className="border-t border-indigo-500/5 pt-3 text-left">
        <p className="text-xs leading-relaxed text-gray-400">
          {details}
        </p>
      </div>

      {/* Glow Highlight bottom element */}
      <div className="absolute bottom-0 left-0 h-[1.5px] w-0 bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-500 hover:w-full"></div>
    </div>
  );
};

export default AnalysisCard;
