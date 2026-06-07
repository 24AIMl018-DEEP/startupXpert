import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Menu, Sparkles } from 'lucide-react';

const DashboardLayout = ({ children, activeTab, setActiveTab }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed,  setCollapsed]  = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)', color: 'var(--text1)' }}>

      {/* Ambient glows */}
      <div className="glow-purple" style={{ position: 'fixed', top: '10%', left: '15%', width: 400, height: 400, zIndex: 0, pointerEvents: 'none' }} />
      <div className="glow-green"  style={{ position: 'fixed', bottom: '20%', right: '10%', width: 350, height: 350, zIndex: 0, pointerEvents: 'none' }} />

      {/* Desktop sidebar */}
      <div className="hidden lg:flex" style={{ flexShrink: 0, position: 'relative', zIndex: 10 }}>
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab}
          collapsed={collapsed} onToggle={() => setCollapsed(v => !v)} />
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex' }} className="lg:hidden">
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
            onClick={() => setMobileOpen(false)} />
          <div style={{ position: 'relative', zIndex: 51 }} className="animate-slide-in-l">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab}
              collapsed={false} onToggle={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative', zIndex: 1 }}>
        {/* Mobile header */}
        <header className="flex lg:hidden" style={{ alignItems: 'center', gap: 12, padding: '0 16px', height: 52, borderBottom: '1px solid var(--border)', background: 'rgba(14,14,22,0.85)', backdropFilter: 'blur(20px)', flexShrink: 0 }}>
          <button onClick={() => setMobileOpen(true)}
            style={{ padding: 6, borderRadius: 6, background: 'var(--surface2)', border: '1px solid var(--border2)', color: 'var(--text2)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <Menu size={15} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Sparkles size={13} style={{ color: 'var(--brand)' }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text1)' }}>Startup<span style={{ color: 'var(--brand)' }}>Xpert</span></span>
          </div>
        </header>

        <main style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
