import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStartup } from '../context/StartupContext';
import {
  LayoutDashboard, Briefcase, Clock, Settings, LogOut,
  Sparkles, Compass, User, Plus, ChevronDown,
  PanelLeftClose, PanelLeftOpen
} from 'lucide-react';

const NAV = [
  { id: 'overview', label: 'Overview',    icon: LayoutDashboard, path: '/dashboard' },
  { id: 'roadmap',  label: 'Roadmap',     icon: Compass,         path: '/roadmap'   },
  { id: 'startups', label: 'My Startups', icon: Briefcase,       path: '/dashboard' },
  { id: 'history',  label: 'History',     icon: Clock,           path: '/dashboard' },
];

const Sidebar = ({ activeTab, setActiveTab, collapsed, onToggle }) => {
  const { logoutUser, user, getInitials } = useStartup();
  const navigate = useNavigate();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    const h = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setProfileOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const isActive = (item) => {
    if (item.path === '/roadmap')   return location.pathname === '/roadmap';
    if (item.path === '/settings')  return location.pathname === '/settings';
    return location.pathname === '/dashboard' && activeTab === item.id;
  };

  const handleNav = (item) => {
    if (item.path !== '/dashboard') { navigate(item.path); return; }
    if (location.pathname === '/dashboard') setActiveTab?.(item.id);
    else navigate('/dashboard', { state: { activeTab: item.id } });
  };

  const Avatar = () => user.avatarUrl
    ? <img src={user.avatarUrl} style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border2)', flexShrink: 0 }} alt="" />
    : <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--brand-bg)', border: '1px solid var(--brand-border)', color: 'var(--brand-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{getInitials()}</div>;

  const sidebarWidth = collapsed ? 56 : 224;

  return (
    <aside className="sidebar" style={{ width: sidebarWidth, flexShrink: 0, display: 'flex', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0, transition: 'width 0.2s ease', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', height: 52, padding: '0 12px', borderBottom: '1px solid var(--border)', flexShrink: 0, gap: 8 }}>
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, flex: 1, minWidth: 0 }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: 'var(--brand-bg)', border: '1px solid var(--brand-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Sparkles size={12} style={{ color: 'var(--brand)' }} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text1)', whiteSpace: 'nowrap' }}>
              Startup<span style={{ color: 'var(--brand)' }}>Xpert</span>
            </span>
          </div>
        )}
        <button onClick={onToggle} title={collapsed ? 'Expand' : 'Collapse'}
          style={{ padding: 6, borderRadius: 6, background: 'transparent', border: 'none', color: 'var(--text3)', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', transition: 'color 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text1)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}>
          {collapsed ? <PanelLeftOpen size={14} /> : <PanelLeftClose size={14} />}
        </button>
      </div>

      {/* New Validation CTA */}
      <div style={{ padding: '10px 8px', display: 'flex', justifyContent: collapsed ? 'center' : 'stretch' }}>
        <button onClick={() => navigate('/onboarding/role')} title={collapsed ? 'Validate New Idea' : undefined}
          className="btn btn-primary btn-sm"
          style={{ width: collapsed ? 34 : '100%', justifyContent: 'center', padding: collapsed ? '7px' : undefined }}>
          <Plus size={13} />
          {!collapsed && 'New Validation'}
        </button>
      </div>

      {/* Workspace label */}
      {!collapsed && (
        <div style={{ padding: '4px 18px', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text3)' }}>
          Workspace
        </div>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, padding: '8px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV.map(item => {
          const Icon = item.icon;
          const active = isActive(item);
          return (
            <button key={item.id} onClick={() => handleNav(item)} title={collapsed ? item.label : undefined}
              style={{
                display: 'flex', alignItems: 'center', gap: collapsed ? 0 : 10,
                justifyContent: collapsed ? 'center' : 'flex-start',
                padding: collapsed ? '8px 0' : '7px 10px',
                borderRadius: 7, cursor: 'pointer',
                border: active ? 'none' : 'none',
                borderLeft: active ? '2px solid var(--brand)' : '2px solid transparent',
                background: active ? 'var(--brand-bg)' : 'transparent',
                color: active ? 'var(--brand-light)' : 'var(--text2)',
                fontSize: 13, fontWeight: active ? 600 : 500, transition: 'all 0.15s', width: '100%',
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'var(--surface2)'; e.currentTarget.style.color = 'var(--text1)'; } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text2)'; } }}>
              <Icon size={15} style={{ flexShrink: 0 }} />
              {!collapsed && item.label}
            </button>
          );
        })}

        <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />

        {/* Settings */}
        <button onClick={() => navigate('/settings')} title={collapsed ? 'Settings' : undefined}
          style={{
            display: 'flex', alignItems: 'center', gap: collapsed ? 0 : 10,
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? '8px 0' : '7px 10px',
            borderRadius: 7, cursor: 'pointer',
            borderLeft: location.pathname === '/settings' ? '2px solid var(--brand)' : '2px solid transparent',
            background: location.pathname === '/settings' ? 'var(--brand-bg)' : 'transparent',
            color: location.pathname === '/settings' ? 'var(--brand-light)' : 'var(--text2)',
            fontSize: 13, fontWeight: 500, transition: 'all 0.15s', width: '100%', border: 'none',
          }}
          onMouseEnter={e => { if (location.pathname !== '/settings') { e.currentTarget.style.background = 'var(--surface2)'; e.currentTarget.style.color = 'var(--text1)'; } }}
          onMouseLeave={e => { if (location.pathname !== '/settings') { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text2)'; } }}>
          <Settings size={15} style={{ flexShrink: 0 }} />
          {!collapsed && 'Settings'}
        </button>
      </nav>

      {/* Profile footer */}
      <div style={{ flexShrink: 0, padding: '8px', borderTop: '1px solid var(--border)' }} ref={dropRef}>
        <div style={{ position: 'relative' }}>
          <button onClick={() => setProfileOpen(v => !v)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 8px', borderRadius: 7, cursor: 'pointer', width: '100%', border: 'none', background: 'transparent', transition: 'background 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <Avatar />
            {!collapsed && (
              <>
                <div style={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.fullName || 'User'}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email || ''}</div>
                </div>
                <ChevronDown size={12} style={{ color: 'var(--text3)', flexShrink: 0, transform: profileOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
              </>
            )}
          </button>

          {profileOpen && (
            <div className="animate-fade-up" style={{ position: 'absolute', bottom: 'calc(100% + 4px)', left: 8, right: 8, background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: 'var(--r-md)', boxShadow: 'var(--shadow-lg)', overflow: 'hidden', zIndex: 100 }}>
              <div style={{ padding: '10px 12px 8px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text1)' }}>{user.fullName}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 1 }}>{user.email}</div>
              </div>
              <div style={{ padding: '4px 0' }}>
                {[
                  { label: 'Profile',  icon: User,     action: () => navigate('/profile')  },
                  { label: 'Settings', icon: Settings,  action: () => navigate('/settings') },
                ].map(i => (
                  <button key={i.label} onClick={() => { setProfileOpen(false); i.action(); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', background: 'transparent', border: 'none', color: 'var(--text2)', fontSize: 12, cursor: 'pointer', transition: 'all 0.1s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface3)'; e.currentTarget.style.color = 'var(--text1)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text2)'; }}>
                    <i.icon size={13} /> {i.label}
                  </button>
                ))}
              </div>
              <div style={{ padding: '4px 0', borderTop: '1px solid var(--border)' }}>
                <button onClick={() => { setProfileOpen(false); logoutUser(); navigate('/'); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', background: 'transparent', border: 'none', color: 'var(--red)', fontSize: 12, cursor: 'pointer', transition: 'background 0.1s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--red-bg)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <LogOut size={13} /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
