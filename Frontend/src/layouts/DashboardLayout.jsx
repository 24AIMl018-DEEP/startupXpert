import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Menu, Sparkles } from 'lucide-react';

const DashboardLayout = ({ children, activeTab, setActiveTab }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed,  setCollapsed]  = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)', color: 'var(--text1)' }}>

      {/* Ambient background glows */}
      <div style={{ position: 'fixed', top: '5%', left: '20%', width: 600, height: 600, background: 'radial-gradient(circle, rgba(124,93,249,0.06) 0%, transparent 65%)', filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '10%', right: '5%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(34,197,94,0.04) 0%, transparent 65%)', filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', top: '50%', right: '30%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(34,211,238,0.03) 0%, transparent 65%)', filter: 'blur(50px)', pointerEvents: 'none', zIndex: 0 }} />

      {/* Desktop sidebar */}
      <div className="hidden lg:flex" style={{ flexShrink: 0, position: 'relative', zIndex: 20 }}>
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab}
          collapsed={collapsed} onToggle={() => setCollapsed(v => !v)} />
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex' }} className="lg:hidden">
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
            onClick={() => setMobileOpen(false)} />
          <div style={{ position: 'relative', zIndex: 51 }} className="animate-slide-in-l">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab}
              collapsed={false} onToggle={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Main content area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative', zIndex: 1 }}>

        {/* Mobile top bar */}
        <header className="flex lg:hidden" style={{ alignItems: 'center', gap: 12, padding: '0 16px', height: 54, borderBottom: '1px solid var(--border)', background: 'rgba(10,10,16,0.9)', backdropFilter: 'blur(24px)', flexShrink: 0, position: 'sticky', top: 0, zIndex: 30 }}>
          <button onClick={() => setMobileOpen(true)}
            style={{ padding: 7, borderRadius: 8, background: 'var(--surface2)', border: '1px solid var(--border2)', color: 'var(--text2)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <Menu size={15} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: 'linear-gradient(135deg, var(--brand) 0%, rgba(124,93,249,0.6) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={12} style={{ color: '#fff' }} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text1)', letterSpacing: '-0.02em' }}>
              Startup<span style={{ color: 'var(--brand-light)' }}>Xpert</span>
            </span>
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
