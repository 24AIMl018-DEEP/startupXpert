import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStartup } from '../context/StartupContext';
import {
  LayoutDashboard,
  Briefcase,
  Clock,
  User,
  Settings,
  LogOut,
  Sparkles,
  ChevronRight,
  Compass,
  ChevronDown,
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const { logoutUser, user, getInitials } = useStartup();
  const navigate = useNavigate();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    setProfileOpen(false);
    logoutUser();
    navigate('/');
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, path: '/dashboard' },
    { id: 'roadmap', label: 'Roadmap', icon: Compass, path: '/roadmap' },
    { id: 'startups', label: 'My Startups', icon: Briefcase, path: '/dashboard' },
    { id: 'history', label: 'Analysis History', icon: Clock, path: '/dashboard' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
  ];

  const getIsSelected = (item) => {
    if (item.path === '/settings' && location.pathname === '/settings') return true;
    if (item.path === '/roadmap' && location.pathname === '/roadmap') return true;
    if (location.pathname === '/dashboard' && activeTab === item.id) return true;
    return false;
  };

  const handleNavClick = (item) => {
    if (item.path === '/settings') {
      navigate('/settings');
    } else if (item.path === '/roadmap') {
      navigate('/roadmap');
    } else {
      if (location.pathname === '/dashboard' && setActiveTab) {
        setActiveTab(item.id);
      } else {
        navigate('/dashboard', { state: { activeTab: item.id } });
      }
    }
  };

  return (
    <aside className="w-72 border-r border-indigo-500/10 bg-[#0a0a0f]/95 flex flex-col justify-between p-5 shrink-0">
      <div className="space-y-6">
        {/* Brand */}
        <div className="flex items-center justify-between px-1 pt-1">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-indigo-500/30 bg-indigo-500/10">
              <Sparkles className="h-4 w-4 text-indigo-400" />
            </div>
            <span className="text-base font-bold text-white tracking-tight">
              Startup<span className="text-indigo-500">Xpert</span>
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isSelected = getIsSelected(item);
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                  isSelected
                    ? 'bg-indigo-600/12 border border-indigo-500/25 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 transition-colors duration-200 ${isSelected ? 'text-indigo-400' : 'text-gray-500 group-hover:text-indigo-300'}`} />
                  <span className="text-[13px]">{item.label}</span>
                </div>
                {isSelected && <ChevronRight className="h-3.5 w-3.5 text-indigo-400" />}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Profile section at bottom */}
      <div className="border-t border-indigo-500/10 pt-4" ref={dropdownRef}>
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-all duration-200 group"
          >
            {/* Avatar */}
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.fullName}
                className="h-8 w-8 rounded-full object-cover border border-indigo-500/30 shrink-0"
              />
            ) : (
              <div className="h-8 w-8 rounded-full border border-indigo-500/25 bg-indigo-600/20 text-indigo-300 flex items-center justify-center text-xs font-bold shrink-0">
                {getInitials()}
              </div>
            )}

            <div className="flex-1 text-left min-w-0">
              <p className="text-[13px] font-semibold text-white truncate leading-tight">
                {user.fullName || 'User'}
              </p>
              <p className="text-[11px] text-gray-500 truncate leading-tight">
                {user.email || ''}
              </p>
            </div>

            <ChevronDown className={`h-4 w-4 text-gray-500 shrink-0 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown */}
          {profileOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-2 rounded-xl border border-indigo-500/15 bg-[#0e0e16] shadow-xl shadow-black/40 overflow-hidden animate-[fadeIn_0.15s_ease-out]">
              {/* User info header */}
              <div className="px-4 py-3 border-b border-indigo-500/10">
                <p className="text-[12px] font-semibold text-white">{user.fullName || 'User'}</p>
                <p className="text-[11px] text-gray-500 truncate">{user.email || ''}</p>
                <span className="inline-block mt-1 rounded bg-indigo-950 border border-indigo-500/20 px-2 py-0.5 text-[10px] font-semibold text-indigo-300">
                  {user.role || 'Founder'}
                </span>
              </div>

              {/* Menu items */}
              <div className="py-1.5">
                <button
                  onClick={() => { setProfileOpen(false); navigate('/profile'); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-150"
                >
                  <User className="h-4 w-4 text-gray-500" />
                  View Profile
                </button>
                <button
                  onClick={() => { setProfileOpen(false); navigate('/settings'); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-150"
                >
                  <Settings className="h-4 w-4 text-gray-500" />
                  Settings
                </button>
              </div>

              <div className="border-t border-indigo-500/10 py-1.5">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-red-400 hover:text-red-300 hover:bg-red-500/8 transition-all duration-150"
                >
                  <LogOut className="h-4 w-4" />
                  Log Out
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
