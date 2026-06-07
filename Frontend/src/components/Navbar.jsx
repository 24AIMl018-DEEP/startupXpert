import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useStartup } from '../context/StartupContext';
import { Sparkles, Menu, X, ArrowRight, LayoutDashboard, User, LogOut, ChevronDown } from 'lucide-react';

const Navbar = () => {
  const { isLoggedIn, logoutUser, user, getInitials } = useStartup();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    setProfileOpen(false);
    logoutUser();
    navigate('/');
  };

  const scrollToSection = (id) => {
    setIsOpen(false);
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 150);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar sticky top-0 z-50 w-full">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--brand-bg)', border: '1px solid var(--brand-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={13} style={{ color: 'var(--brand)' }} />
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text1)' }}>
              Startup<span style={{ color: 'var(--brand)' }}>Xpert</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            <button onClick={() => scrollToSection('features')}
              style={{ fontSize: 13, fontWeight: 500, color: isActive('/') ? 'var(--text1)' : 'var(--text2)', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text1)'}
              onMouseLeave={e => e.currentTarget.style.color = isActive('/') ? 'var(--text1)' : 'var(--text2)'}>
              Features
            </button>
            <button onClick={() => scrollToSection('methodology')}
              style={{ fontSize: 13, fontWeight: 500, color: 'var(--text2)', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text1)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text2)'}>
              Methodology
            </button>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <div style={{ position: 'relative' }}>
                <button onClick={() => setProfileOpen(!profileOpen)}
                  style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '5px 10px', borderRadius: 8, border: '1px solid var(--border2)', background: 'var(--brand-bg)', color: 'var(--text1)', cursor: 'pointer', transition: 'all 0.15s', fontSize: 13 }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface2)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--brand-bg)'; }}>
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="" style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border2)' }} />
                  ) : (
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--brand-bg)', border: '1px solid var(--brand-border)', color: 'var(--brand-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>
                      {getInitials()}
                    </div>
                  )}
                  <span style={{ fontWeight: 500 }}>{user.fullName?.split(' ')[0] || 'Account'}</span>
                  <ChevronDown size={13} style={{ color: 'var(--text3)', transition: 'transform 0.2s', transform: profileOpen ? 'rotate(180deg)' : 'rotate(0)' }} />
                </button>

                {profileOpen && (
                  <div className="animate-fade-down" style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: 200, borderRadius: 'var(--r-lg)', background: 'var(--surface)', border: '1px solid var(--border2)', boxShadow: 'var(--shadow-lg)', overflow: 'hidden', zIndex: 60 }}>
                    <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)' }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text1)', margin: 0 }}>{user.fullName}</p>
                      <p style={{ fontSize: 11, color: 'var(--text3)', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</p>
                    </div>
                    <div style={{ padding: '4px 0' }}>
                      {[
                        { label: 'Dashboard', icon: LayoutDashboard, action: '/dashboard' },
                        { label: 'Profile',   icon: User,            action: '/profile'   },
                      ].map(({ label, icon: Icon, action }) => (
                        <button key={label} onClick={() => { setProfileOpen(false); navigate(action); }}
                          style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 14px', background: 'transparent', border: 'none', color: 'var(--text2)', fontSize: 13, cursor: 'pointer', transition: 'all 0.1s' }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface2)'; e.currentTarget.style.color = 'var(--text1)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text2)'; }}>
                          <Icon size={14} style={{ color: 'var(--text3)' }} /> {label}
                        </button>
                      ))}
                    </div>
                    <div style={{ borderTop: '1px solid var(--border)', padding: '4px 0' }}>
                      <button onClick={handleLogout}
                        style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 14px', background: 'transparent', border: 'none', color: 'var(--red)', fontSize: 13, cursor: 'pointer', transition: 'background 0.1s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--red-bg)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <LogOut size={14} /> Log Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login"
                  style={{ fontSize: 13, fontWeight: 500, color: 'var(--text2)', transition: 'color 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--text1)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text2)'}>
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm">
                  Get Started <ArrowRight size={13} />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="btn btn-ghost btn-icon">
              {isOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div style={{ borderTop: '1px solid var(--border)', background: 'var(--bg)', padding: '16px', display: 'flex', flexDirection: 'column', gap: 8 }} className="md:hidden animate-fade-down">
          <button onClick={() => scrollToSection('features')} style={{ padding: '10px 0', fontSize: 13, fontWeight: 500, color: 'var(--text2)', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'color 0.15s' }}>Features</button>
          <button onClick={() => scrollToSection('methodology')} style={{ padding: '10px 0', fontSize: 13, fontWeight: 500, color: 'var(--text2)', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'color 0.15s' }}>Methodology</button>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {isLoggedIn ? (
              <>
                <Link to="/dashboard" onClick={() => setIsOpen(false)} className="btn btn-primary" style={{ justifyContent: 'center' }}>
                  <LayoutDashboard size={15} /> Dashboard
                </Link>
                <button onClick={() => { setIsOpen(false); handleLogout(); }} className="btn btn-danger" style={{ justifyContent: 'center' }}>
                  <LogOut size={15} /> Log Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setIsOpen(false)} className="btn btn-outline" style={{ justifyContent: 'center' }}>Sign In</Link>
                <Link to="/register" onClick={() => setIsOpen(false)} className="btn btn-primary" style={{ justifyContent: 'center' }}>Get Started</Link>
              </>
            )}
          </div>
        </div>
      )}

      {/* Close profile on outside click */}
      {profileOpen && <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setProfileOpen(false)} />}
    </nav>
  );
};

export default Navbar;
