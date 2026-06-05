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
    <nav className="sticky top-0 z-50 w-full border-b border-indigo-500/10 bg-[#0a0a0f]/90 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-indigo-500/30 bg-indigo-500/10 transition-all duration-200 group-hover:border-indigo-500/50">
              <Sparkles className="h-4 w-4 text-indigo-400" />
            </div>
            <span className="text-[15px] font-bold tracking-tight text-white">
              Startup<span className="text-indigo-500">Xpert</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={() => scrollToSection('features')}
              className={`text-sm font-medium transition-colors duration-200 ${isActive('/') ? 'text-white' : 'text-gray-400 hover:text-white'}`}
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('methodology')}
              className="text-sm font-medium text-gray-400 hover:text-white transition-colors duration-200"
            >
              Methodology
            </button>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 rounded-lg border border-indigo-500/20 bg-indigo-500/8 px-3 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-indigo-500/15 transition-all duration-200"
                >
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="" className="h-6 w-6 rounded-full object-cover border border-indigo-500/30" />
                  ) : (
                    <div className="h-6 w-6 rounded-full bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 flex items-center justify-center text-[10px] font-bold">
                      {getInitials()}
                    </div>
                  )}
                  <span className="text-[13px] font-medium">{user.fullName?.split(' ')[0] || 'Account'}</span>
                  <ChevronDown className={`h-3.5 w-3.5 text-gray-500 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-indigo-500/15 bg-[#0e0e16] shadow-xl shadow-black/40 overflow-hidden animate-[fadeIn_0.15s_ease-out]">
                    <div className="px-4 py-3 border-b border-indigo-500/10">
                      <p className="text-[13px] font-semibold text-white">{user.fullName}</p>
                      <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
                    </div>
                    <div className="py-1.5">
                      <button
                        onClick={() => { setProfileOpen(false); navigate('/dashboard'); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <LayoutDashboard className="h-4 w-4 text-gray-500" />
                        Dashboard
                      </button>
                      <button
                        onClick={() => { setProfileOpen(false); navigate('/profile'); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <User className="h-4 w-4 text-gray-500" />
                        Profile
                      </button>
                    </div>
                    <div className="border-t border-indigo-500/10 py-1.5">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-red-400 hover:text-red-300 hover:bg-red-500/8 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Log Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-400 hover:text-white transition-colors duration-200"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="group flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-all duration-200 hover:shadow-[0_0_20px_rgba(99,102,241,0.35)]"
                >
                  Get Started
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-800 text-gray-400 hover:text-white transition-all"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="border-t border-indigo-500/10 bg-[#0a0a0f] px-4 py-5 md:hidden space-y-3">
          <button onClick={() => scrollToSection('features')} className="block w-full text-left text-sm font-medium text-gray-300 hover:text-white py-2">Features</button>
          <button onClick={() => scrollToSection('methodology')} className="block w-full text-left text-sm font-medium text-gray-300 hover:text-white py-2">Methodology</button>
          <div className="border-t border-indigo-500/10 pt-3 space-y-2">
            {isLoggedIn ? (
              <>
                <Link to="/dashboard" onClick={() => setIsOpen(false)} className="flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white">
                  <LayoutDashboard className="h-4 w-4" /> Dashboard
                </Link>
                <button onClick={() => { setIsOpen(false); handleLogout(); }} className="w-full flex items-center justify-center gap-2 rounded-lg border border-red-500/20 px-4 py-2.5 text-sm font-medium text-red-400">
                  <LogOut className="h-4 w-4" /> Log Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setIsOpen(false)} className="block rounded-lg border border-indigo-500/15 py-2.5 text-center text-sm font-medium text-gray-300">Sign In</Link>
                <Link to="/register" onClick={() => setIsOpen(false)} className="block rounded-lg bg-indigo-600 py-2.5 text-center text-sm font-medium text-white">Get Started</Link>
              </>
            )}
          </div>
        </div>
      )}

      {/* Close profile dropdown on outside click */}
      {profileOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
      )}
    </nav>
  );
};

export default Navbar;
