import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStartup } from '../context/StartupContext';
import {
  LayoutDashboard, Briefcase, Clock, Settings, LogOut,
  Sparkles, Compass, User, Plus, ChevronDown,
  PanelLeftClose, PanelLeftOpen, CheckSquare, Building2,
  BarChart2, Zap, Users
} from 'lucide-react';

const NAV_FOUNDER = [
  { id: 'overview', label: 'Overview',    icon: LayoutDashboard, path: '/dashboard' },
  { id: 'roadmap',  label: 'Roadmap',     icon: Compass,         path: '/roadmap'   },
  { id: 'team',     label: 'Team',        icon: Users,           path: '/team'      },
  { id: 'startups', label: 'My Startups', icon: Briefcase,       path: '/dashboard' },
  { id: 'history',  label: 'History',     icon: Clock,           path: '/dashboard' },
];

const NAV_MEMBER = [
  { id: 'member', label: 'My Tasks', icon: CheckSquare, path: '/member' },
  { id: 'team',   label: 'Team',     icon: Users,       path: '/team'   },
];

const Sidebar = ({ activeTab, setActiveTab, collapsed, onToggle }) => {
  const { logoutUser, user, getInitials } = useStartup();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const dropRef = useRef(null);

  const isMember = user?.userType === 'org' && user?.role === 'Member';
  const NAV = isMember ? NAV_MEMBER : NAV_FOUNDER;

  useEffect(() => {
    const h = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setProfileOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const isActive = (item) => {
    if (item.path !== '/dashboard') return location.pathname === item.path;
    return location.pathname === '/dashboard' && activeTab === item.id;
  };

  const handleNav = (item) => {
    if (item.path !== '/dashboard') { navigate(item.path); return; }
    if (location.pathname === '/dashboard') setActiveTab?.(item.id);
    else navigate('/dashboard', { state: { activeTab: item.id } });
  };

  const Avatar = () => user.avatarUrl
    ? <img src={user.avatarUrl} style={{ width: 28, height: 28, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} alt="" />
    : (
      <div style={{
        width: 28, height: 28, borderRadius: 8,
        background: 'linear-gradient(135deg, var(--brand) 0%, var(--cyan) 100%)',
        color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 11, fontWeight: 800, flexShrink: 0, letterSpacing: '0.05em',
      }}>
        {getInitials()}
      </div>
    );

  const sidebarWidth = collapsed ? 58 : 228;

  return (
    <aside style={{
      width: sidebarWidth, flexShrink: 0, display: 'flex', flexDirection: 'column',
      height: '100vh', position: 'sticky', top: 0,
      transition: 'width 0.22s cubic-bezier(0.4,0,0.2,1)', overflow: 'hidden',
      background: 'linear-gradient(180deg, rgba(12,12,20,0.98) 0%, rgba(10,10,16,0.99) 100%)',
      borderRight: '1px solid var(--border)',
      backdropFilter: 'blur(20px)',
    }}>

      {/* ── Logo ── */}
      <div style={{ display: 'flex', alignItems: 'center', height: 56, padding: '0 12px', borderBottom: '1px solid var(--border)', flexShrink: 0, gap: 8 }}>
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, flex: 1, minWidth: 0 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, var(--brand) 0%, rgba(124,93,249,0.6) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 8px rgba(124,93,249,0.3)' }}>
              <Sparkles size={13} style={{ color: '#fff' }} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text1)', letterSpacing: '-0.02em', lineHeight: 1 }}>
                Startup<span style={{ color: 'var(--brand-light)' }}>Xpert</span>
              </div>
              {isMember && (
                <div style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 600, marginTop: 1, display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Building2 size={9} /> Team Member
                </div>
              )}
            </div>
          </div>
        )}
        {collapsed && (
          <div style={{ margin: '0 auto', width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, var(--brand) 0%, rgba(124,93,249,0.6) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(124,93,249,0.3)' }}>
            <Sparkles size={13} style={{ color: '#fff' }} />
          </div>
        )}
        <button onClick={onToggle} title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{ padding: 5, borderRadius: 7, background: 'transparent', border: 'none', color: 'var(--text3)', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', transition: 'color 0.15s, background 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--text1)'; e.currentTarget.style.background = 'var(--surface2)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text3)'; e.currentTarget.style.background = 'transparent'; }}>
          {collapsed ? <PanelLeftOpen size={14} /> : <PanelLeftClose size={14} />}
        </button>
      </div>

      {/* ── CTA — only for non-members ── */}
      {!isMember && (
        <div style={{ padding: '10px 10px 6px', flexShrink: 0 }}>
          <button onClick={() => navigate('/onboarding/role')} title={collapsed ? 'Validate New Idea' : undefined}
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: collapsed ? '8px' : '8px 14px', fontSize: 12, gap: 6 }}>
            <Plus size={13} />
            {!collapsed && 'New Validation'}
          </button>
        </div>
      )}

      {/* ── Section label ── */}
      {!collapsed && (
        <div style={{ padding: '10px 18px 6px', fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text3)' }}>
          {isMember ? 'Workspace' : 'Navigation'}
        </div>
      )}

      {/* ── Nav items ── */}
      <nav style={{ flex: 1, padding: '4px 8px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1 }}>
        {NAV.map(item => {
          const Icon = item.icon;
          const active = isActive(item);
          return (
            <button key={item.id} onClick={() => handleNav(item)} title={collapsed ? item.label : undefined}
              style={{
                display: 'flex', alignItems: 'center', gap: collapsed ? 0 : 9,
                justifyContent: collapsed ? 'center' : 'flex-start',
                padding: collapsed ? '9px 0' : '8px 10px',
                borderRadius: 9, cursor: 'pointer', border: 'none',
                borderLeft: active ? '2px solid var(--brand)' : '2px solid transparent',
                background: active ? 'linear-gradient(90deg, rgba(124,93,249,0.12) 0%, transparent 100%)' : 'transparent',
                color: active ? 'var(--brand-light)' : 'var(--text2)',
                fontSize: 13, fontWeight: active ? 600 : 500,
                transition: 'all 0.15s', width: '100%', textAlign: 'left',
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = 'var(--text1)'; } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text2)'; } }}>
              <Icon size={15} style={{ flexShrink: 0 }} />
              {!collapsed && item.label}
            </button>
          );
        })}

        <div style={{ height: 1, background: 'var(--border)', margin: '6px 2px' }} />

        {/* Analysis shortcut — only founders */}
        {!isMember && (
          <button onClick={() => navigate('/analysis/result')} title={collapsed ? 'Analysis' : undefined}
            style={{
              display: 'flex', alignItems: 'center', gap: collapsed ? 0 : 9,
              justifyContent: collapsed ? 'center' : 'flex-start',
              padding: collapsed ? '9px 0' : '8px 10px',
              borderRadius: 9, cursor: 'pointer', border: 'none',
              borderLeft: location.pathname === '/analysis/result' ? '2px solid var(--green)' : '2px solid transparent',
              background: location.pathname === '/analysis/result' ? 'rgba(34,197,94,0.08)' : 'transparent',
              color: location.pathname === '/analysis/result' ? 'var(--green)' : 'var(--text2)',
              fontSize: 13, fontWeight: 500, transition: 'all 0.15s', width: '100%',
            }}
            onMouseEnter={e => { if (location.pathname !== '/analysis/result') { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = 'var(--text1)'; } }}
            onMouseLeave={e => { if (location.pathname !== '/analysis/result') { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text2)'; } }}>
            <BarChart2 size={15} style={{ flexShrink: 0 }} />
            {!collapsed && 'Analysis'}
          </button>
        )}

        {/* Settings */}
        <button onClick={() => navigate('/settings')} title={collapsed ? 'Settings' : undefined}
          style={{
            display: 'flex', alignItems: 'center', gap: collapsed ? 0 : 9,
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? '9px 0' : '8px 10px',
            borderRadius: 9, cursor: 'pointer', border: 'none',
            borderLeft: location.pathname === '/settings' ? '2px solid var(--brand)' : '2px solid transparent',
            background: location.pathname === '/settings' ? 'linear-gradient(90deg, rgba(124,93,249,0.12) 0%, transparent 100%)' : 'transparent',
            color: location.pathname === '/settings' ? 'var(--brand-light)' : 'var(--text2)',
            fontSize: 13, fontWeight: 500, transition: 'all 0.15s', width: '100%',
          }}
          onMouseEnter={e => { if (location.pathname !== '/settings') { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = 'var(--text1)'; } }}
          onMouseLeave={e => { if (location.pathname !== '/settings') { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text2)'; } }}>
          <Settings size={15} style={{ flexShrink: 0 }} />
          {!collapsed && 'Settings'}
        </button>
      </nav>

      {/* ── Profile footer ── */}
      <div style={{ flexShrink: 0, padding: '8px 8px 10px', borderTop: '1px solid var(--border)' }} ref={dropRef}>
        <div style={{ position: 'relative' }}>
          <button onClick={() => setProfileOpen(v => !v)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 9px', borderRadius: 9, cursor: 'pointer', width: '100%', border: 'none', background: 'transparent', transition: 'background 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <Avatar />
            {!collapsed && (
              <>
                <div style={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: '-0.01em' }}>
                    {user.fullName || 'User'}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 1 }}>
                    {user.email || ''}
                  </div>
                </div>
                <ChevronDown size={12} style={{ color: 'var(--text3)', flexShrink: 0, transform: profileOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
              </>
            )}
          </button>

          {profileOpen && (
            <div className="animate-fade-up" style={{ position: 'absolute', bottom: 'calc(100% + 6px)', left: 0, right: 0, background: 'linear-gradient(145deg, var(--surface2) 0%, rgba(14,14,22,0.98) 100%)', border: '1px solid var(--border2)', borderRadius: 12, boxShadow: '0 -8px 32px rgba(0,0,0,0.5)', overflow: 'hidden', zIndex: 100 }}>
              <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text1)' }}>{user.fullName}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{user.email}</div>
                {user.role && (
                  <div style={{ marginTop: 6 }}>
                    <span className="badge badge-brand">{user.role}</span>
                  </div>
                )}
              </div>
              <div style={{ padding: '4px 6px' }}>
                {[
                  { label: 'Profile',  icon: User,     action: () => navigate('/profile')  },
                  { label: 'Settings', icon: Settings,  action: () => navigate('/settings') },
                ].map(i => (
                  <button key={i.label} onClick={() => { setProfileOpen(false); i.action(); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 9, width: '100%', padding: '8px 10px', background: 'transparent', border: 'none', color: 'var(--text2)', fontSize: 12, fontWeight: 500, cursor: 'pointer', borderRadius: 7, transition: 'all 0.1s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface3)'; e.currentTarget.style.color = 'var(--text1)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text2)'; }}>
                    <i.icon size={13} /> {i.label}
                  </button>
                ))}
              </div>
              <div style={{ padding: '4px 6px', borderTop: '1px solid var(--border)' }}>
                <button onClick={() => { setProfileOpen(false); logoutUser(); navigate('/'); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 9, width: '100%', padding: '8px 10px', background: 'transparent', border: 'none', color: 'var(--red)', fontSize: 12, fontWeight: 600, cursor: 'pointer', borderRadius: 7, transition: 'background 0.1s' }}
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
