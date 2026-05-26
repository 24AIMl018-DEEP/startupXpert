import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useStartup } from '../context/StartupContext';
import { Sparkles, Menu, X, LogOut, ArrowRight, LayoutDashboard } from 'lucide-react';

const Navbar = () => {
  const { isLoggedIn, logoutUser, user } = useStartup();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-indigo-500/10 bg-[#0a0a0f]/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-indigo-500/30 bg-indigo-500/10 transition-all duration-300 group-hover:border-cyan-400/50 group-hover:shadow-[0_0_15px_rgba(99,102,241,0.4)]">
                <Sparkles className="h-5 w-5 text-indigo-400 transition-colors group-hover:text-cyan-300" />
                <div className="absolute -inset-0.5 rounded-lg bg-indigo-500/20 blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <span className="font-heading text-xl font-bold tracking-tight text-white transition-all duration-300 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-400 group-hover:to-cyan-300">
                Startup<span className="text-indigo-500">Xpert</span>
              </span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:block">
            <div className="flex items-center gap-8">
              <Link 
                to="/" 
                className={`text-sm font-medium tracking-wide transition-colors duration-300 ${isActive('/') ? 'text-indigo-400' : 'text-gray-400 hover:text-white'}`}
              >
                Validate
              </Link>
              <a 
                href="#features" 
                onClick={(e) => {
                  if (location.pathname !== '/') {
                    e.preventDefault();
                    navigate('/');
                    setTimeout(() => {
                      document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }
                }}
                className="text-sm font-medium tracking-wide text-gray-400 hover:text-white transition-colors duration-300"
              >
                Features
              </a>
              <a 
                href="#methodology"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Our AI methodology analyses 250+ industry criteria to deliver realistic market insight cards.');
                }}
                className="text-sm font-medium tracking-wide text-gray-400 hover:text-white transition-colors duration-300"
              >
                Methodology
              </a>
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:block">
            <div className="flex items-center gap-4">
              {isLoggedIn ? (
                <>
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-2 rounded-lg border border-indigo-500/20 bg-indigo-500/10 px-4 py-2 text-sm font-medium text-indigo-300 hover:bg-indigo-500/20 hover:text-white transition-all duration-300 hover:shadow-[0_0_15px_rgba(99,102,241,0.25)]"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 rounded-lg border border-red-500/10 bg-red-500/5 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all duration-300"
                  >
                    <LogOut className="h-4 w-4" />
                    Log Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-sm font-medium text-gray-300 hover:text-white transition-colors duration-300"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="group relative flex items-center gap-1.5 overflow-hidden rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition-all duration-300 hover:bg-indigo-500 hover:shadow-[0_0_20px_rgba(99,102,241,0.5)] focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  >
                    Get Started
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-800 text-gray-400 hover:bg-gray-900 hover:text-white transition-all duration-300"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="border-t border-gray-900 bg-[#0a0a0f] px-4 py-6 md:hidden space-y-4">
          <div className="flex flex-col gap-4">
            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              className="text-base font-medium text-gray-300 hover:text-white"
            >
              Validate
            </Link>
            <Link
              to="/"
              onClick={() => {
                setIsOpen(false);
                setTimeout(() => {
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="text-base font-medium text-gray-300 hover:text-white"
            >
              Features
            </Link>
            <button
              onClick={() => {
                setIsOpen(false);
                alert('Our AI methodology analyses 250+ industry criteria to deliver realistic market insight cards.');
              }}
              className="text-left text-base font-medium text-gray-300 hover:text-white"
            >
              Methodology
            </button>
          </div>
          <div className="border-t border-gray-900 pt-4 flex flex-col gap-3">
            {isLoggedIn ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-indigo-500"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center justify-center gap-2 rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-2.5 text-center text-sm font-medium text-red-400 hover:bg-red-500/10"
                >
                  <LogOut className="h-4 w-4" />
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg border border-gray-800 py-2.5 text-center text-sm font-medium text-gray-300 hover:bg-gray-900 hover:text-white"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg bg-indigo-600 py-2.5 text-center text-sm font-medium text-white hover:bg-indigo-500"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
