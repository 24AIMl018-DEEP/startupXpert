import React, { useEffect } from 'react';
import { 
  CheckCircle2, 
  AlertOctagon, 
  AlertTriangle, 
  Info, 
  X 
} from 'lucide-react';

const Toast = ({ id, message, type = 'info', onClose }) => {
  useEffect(() => {
    // Add accessibility aria alert trigger on mount
  }, []);

  const getToastMeta = () => {
    switch (type) {
      case 'success':
        return {
          icon: CheckCircle2,
          iconColor: 'text-emerald-400',
          borderColor: 'border-l-emerald-500',
          bgColor: 'bg-emerald-950/20',
          label: 'Success'
        };
      case 'error':
        return {
          icon: AlertOctagon,
          iconColor: 'text-rose-400',
          borderColor: 'border-l-rose-500',
          bgColor: 'bg-rose-950/20',
          label: 'Error'
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          iconColor: 'text-amber-400',
          borderColor: 'border-l-amber-500',
          bgColor: 'bg-amber-950/20',
          label: 'Warning'
        };
      case 'info':
      default:
        return {
          icon: Info,
          iconColor: 'text-indigo-400',
          borderColor: 'border-l-indigo-500',
          bgColor: 'bg-indigo-950/20',
          label: 'Info'
        };
    }
  };

  const { icon: Icon, iconColor, borderColor, bgColor, label } = getToastMeta();

  return (
    <div 
      className={`pointer-events-auto flex items-center justify-between w-full p-4 rounded-xl border border-indigo-500/10 ${bgColor} ${borderColor} border-l-4 bg-[#0a0a0f]/95 backdrop-blur-md shadow-2xl animate-[slideIn_0.3s_ease-out] hover:shadow-[0_0_20px_rgba(99,102,241,0.15)] transition-all duration-300`}
      role="alert"
      aria-label={`${label}: ${message}`}
    >
      <div className="flex items-center gap-3">
        <Icon className={`h-5 w-5 ${iconColor} shrink-0`} aria-hidden="true" />
        <span className="text-sm font-semibold text-white text-left leading-snug">
          {message}
        </span>
      </div>
      
      <button
        onClick={() => onClose(id)}
        className="ml-4 flex h-6 w-6 items-center justify-center rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        aria-label="Close Notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export default Toast;
