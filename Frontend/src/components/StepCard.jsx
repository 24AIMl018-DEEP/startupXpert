import React from 'react';

const StepCard = ({ title, description, icon: Icon, badge, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`relative group flex flex-col p-8 rounded-2xl border border-indigo-500/10 bg-[#0e0e16]/60 backdrop-blur-md transition-all duration-500 overflow-hidden ${
        onClick ? 'cursor-pointer hover:-translate-y-1 hover:border-indigo-500/30 hover:bg-[#0e0e16]/80 hover:shadow-[0_0_30px_rgba(99,102,241,0.15)]' : 'hover:border-indigo-500/20'
      }`}
    >
      {/* Decorative Glow Orb */}
      <div className="absolute -right-16 -top-16 h-32 w-32 rounded-full bg-indigo-500/5 blur-2xl group-hover:bg-indigo-500/10 transition-colors duration-500"></div>
      
      {/* Icon Area */}
      {Icon && (
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 group-hover:border-cyan-400/40 group-hover:bg-cyan-500/5 group-hover:text-cyan-300 transition-all duration-500 group-hover:shadow-[0_0_15px_rgba(99,102,241,0.2)]">
          <Icon className="h-6 w-6 transition-transform duration-500 group-hover:scale-110" />
        </div>
      )}

      {/* Header & Optional Badge */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <h3 className="font-heading text-lg font-bold text-white tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-indigo-300 transition-all duration-300">
          {title}
        </h3>
        {badge && (
          <span className="rounded-full bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 text-3xs font-semibold uppercase tracking-wider text-indigo-300">
            {badge}
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-sm leading-relaxed text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
        {description}
      </p>
      
      {/* Glow highlight bottom bar */}
      <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-500 group-hover:w-full"></div>
    </div>
  );
};

export default StepCard;
