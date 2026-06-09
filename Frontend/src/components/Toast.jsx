import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertOctagon, AlertTriangle, Info, X } from 'lucide-react';

const TOAST_META = {
  success: {
    icon: CheckCircle2,
    color: 'var(--green)',
    bg: 'var(--green-bg)',
    border: 'var(--green-border)',
    glow: 'rgba(16,185,129,0.15)',
    label: 'Success',
    bar: '#10b981',
  },
  error: {
    icon: AlertOctagon,
    color: 'var(--red)',
    bg: 'var(--red-bg)',
    border: 'var(--red-border)',
    glow: 'rgba(239,68,68,0.15)',
    label: 'Error',
    bar: '#ef4444',
  },
  warning: {
    icon: AlertTriangle,
    color: 'var(--amber)',
    bg: 'var(--amber-bg)',
    border: 'var(--amber-border)',
    glow: 'rgba(245,158,11,0.15)',
    label: 'Warning',
    bar: '#f59e0b',
  },
  info: {
    icon: Info,
    color: 'var(--brand-light)',
    bg: 'var(--brand-bg)',
    border: 'var(--brand-border)',
    glow: 'rgba(124,58,237,0.15)',
    label: 'Info',
    bar: '#7c3aed',
  },
};

const Toast = ({ id, message, type = 'info', onClose, duration = 3000 }) => {
  const meta = TOAST_META[type] || TOAST_META.info;
  const Icon = meta.icon;
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    // Trigger enter animation
    const t = requestAnimationFrame(() => setVisible(true));
    // Progress bar countdown
    const interval = 30;
    const steps = duration / interval;
    let current = 100;
    const timer = setInterval(() => {
      current -= 100 / steps;
      setProgress(Math.max(0, current));
    }, interval);
    // Auto-close
    const closeTimer = setTimeout(() => {
      setLeaving(true);
      setTimeout(() => onClose(id), 300);
    }, duration - 300);
    return () => { cancelAnimationFrame(t); clearInterval(timer); clearTimeout(closeTimer); };
  }, []);

  const handleClose = () => {
    setLeaving(true);
    setTimeout(() => onClose(id), 300);
  };

  return (
    <div
      role="alert"
      aria-label={`${meta.label}: ${message}`}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 14px',
        borderRadius: 14,
        background: 'var(--surface)',
        border: `1px solid ${meta.border}`,
        boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px ${meta.border}, inset 0 1px 0 rgba(255,255,255,0.04)`,
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        overflow: 'hidden',
        minWidth: 300,
        maxWidth: 420,
        pointerEvents: 'auto',
        transform: visible && !leaving ? 'translateX(0) scale(1)' : leaving ? 'translateX(120%) scale(0.95)' : 'translateX(120%) scale(0.95)',
        opacity: visible && !leaving ? 1 : 0,
        transition: 'transform 0.32s cubic-bezier(0.16,1,0.3,1), opacity 0.28s ease',
      }}>

      {/* Left accent bar */}
      <div style={{
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 3,
        background: meta.bar,
        borderRadius: '14px 0 0 14px',
      }} />

      {/* Ambient glow */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: meta.bg,
        opacity: 0.4,
        pointerEvents: 'none',
      }} />

      {/* Icon */}
      <div style={{
        width: 32,
        height: 32,
        borderRadius: 8,
        background: meta.bg,
        border: `1px solid ${meta.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        marginLeft: 6,
        position: 'relative',
        zIndex: 1,
      }}>
        <Icon size={15} style={{ color: meta.color }} />
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0, position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: meta.color, marginBottom: 2 }}>
          {meta.label}
        </div>
        <div style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--text1)', lineHeight: 1.4 }}>
          {message}
        </div>
      </div>

      {/* Close */}
      <button
        onClick={handleClose}
        aria-label="Close"
        style={{
          width: 24,
          height: 24,
          borderRadius: 6,
          background: 'var(--surface2)',
          border: '1px solid var(--border)',
          color: 'var(--text3)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          transition: 'all 0.15s',
          position: 'relative',
          zIndex: 1,
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface3)'; e.currentTarget.style.color = 'var(--text1)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface2)'; e.currentTarget.style.color = 'var(--text3)'; }}>
        <X size={12} />
      </button>
      {/* Timer progress bar */}
      <div style={{
        position: 'absolute',
        bottom: 0, left: 0,
        height: 2,
        width: `${progress}%`,
        background: `linear-gradient(90deg, ${meta.bar}, ${meta.bar}cc)`,
        borderRadius: '0 0 14px 14px',
        transition: 'width 0.03s linear',
        pointerEvents: 'none',
      }} />
    </div>
  );
};

export default Toast;
