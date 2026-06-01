import React from 'react';
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
  ChevronRight
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const { logoutUser, user } = useStartup();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, path: '/dashboard' },
    { id: 'startups', label: 'My Startups', icon: Briefcase, path: '/dashboard' },
    { id: 'history', label: 'Analysis History', icon: Clock, path: '/dashboard' },
    { id: 'profile', label: 'Profile', icon: User, path: '/profile' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
  ];

  // Determine which item is selected based on route path or active tab
  const getIsSelected = (item) => {
    if (item.path === '/profile' && location.pathname === '/profile') {
      return true;
    }
    if (item.path === '/settings' && location.pathname === '/settings') {
      return true;
    }
    if (location.pathname === '/dashboard' && activeTab === item.id) {
      return true;
    }
    return false;
  };

  const handleNavClick = (item) => {
    if (item.path === '/profile') {
      navigate('/profile');
    } else if (item.path === '/settings') {
      navigate('/settings');
    } else {
      // It's a dashboard tab: overview, startups, history
      if (location.pathname === '/dashboard' && setActiveTab) {
        setActiveTab(item.id);
      } else {
        navigate('/dashboard', { state: { activeTab: item.id } });
      }
    }
  };

  return (
    <aside className="w-80 border-r border-indigo-500/10 bg-[#0a0a0f]/90 flex flex-col justify-between p-6 shrink-0">
      <div className="space-y-8">
        {/* Brand */}
        <div className="flex items-center gap-2 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-indigo-500/30 bg-indigo-500/10">
            <Sparkles className="h-4.5 w-4.5 text-indigo-400" />
          </div>
          <span className="font-heading text-lg font-bold text-white">
            Startup<span className="text-indigo-500">Xpert</span>
          </span>
        </div>

        {/* User Card */}
        <div className="relative rounded-xl border border-indigo-500/10 bg-indigo-950/20 p-4 overflow-hidden">
          <div className="absolute -right-6 -bottom-6 h-16 w-16 rounded-full bg-indigo-500/10 blur-xl"></div>
          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Logged In As</p>
          <h4 className="mt-1 font-heading text-sm font-bold text-white truncate">{user.fullName || 'Innovator'}</h4>
          <p className="text-xs text-indigo-400 truncate mt-0.5">{user.email || 'founder@startup.com'}</p>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isSelected = getIsSelected(item);
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-lg text-sm font-medium transition-all duration-300 group ${
                  isSelected 
                    ? 'bg-indigo-600/15 border border-indigo-500/30 text-white shadow-[0_0_15px_rgba(99,102,241,0.1)]' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4.5 w-4.5 transition-colors duration-300 ${isSelected ? 'text-indigo-400' : 'text-gray-400 group-hover:text-indigo-300'}`} />
                  {item.label}
                </div>
                {isSelected && <ChevronRight className="h-4 w-4 text-indigo-400" />}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Logout Action */}
      <div className="border-t border-indigo-500/10 pt-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-300"
        >
          <LogOut className="h-4.5 w-4.5" />
          Log Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
