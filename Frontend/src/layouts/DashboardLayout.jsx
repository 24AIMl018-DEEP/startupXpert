import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Menu, X, Sparkles } from 'lucide-react';

export const DashboardLayout = ({ children, activeTab, setActiveTab }) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-[#0a0a0f] flex text-white overflow-hidden">
      
      {/* Desktop Sidebar (hidden on mobile, visible on lg screens) */}
      <div className="hidden lg:flex shrink-0">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {/* Mobile Sidebar Overlay Drawer (absolute positioning, z-50) */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Backdrop */}
          <div 
            onClick={() => setIsMobileSidebarOpen(false)}
            className="fixed inset-0 bg-[#0a0a0f]/60 backdrop-blur-sm transition-opacity duration-300 animate-[fadeIn_0.2s_ease-out]"
          ></div>
          
          {/* Sliding Sidebar Container */}
          <div className="relative flex w-80 max-w-xs flex-col bg-[#0a0a0f] border-r border-indigo-500/10 animate-[slideInLeft_0.25s_ease-out]">
            {/* Close button inside Sidebar Drawer */}
            <div className="absolute right-4 top-4 z-10">
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="h-8 w-8 flex items-center justify-center rounded-lg border border-indigo-500/10 bg-indigo-500/5 text-gray-400 hover:text-white"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
            
            {/* Sidebar content */}
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>
        </div>
      )}

      {/* Content wrapper */}
      <div className="flex-grow flex flex-col min-h-screen overflow-hidden">
        
        {/* Mobile Header Top Bar (visible on mobile, hidden on lg screens) */}
        <header className="flex lg:hidden items-center justify-between px-6 py-4 border-b border-indigo-500/5 bg-[#0a0a0f]/80 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="p-2 rounded-lg border border-indigo-500/10 bg-indigo-500/5 text-indigo-400 hover:text-white hover:bg-indigo-500/10 transition-all focus:outline-none"
              aria-label="Open navigation sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            
            {/* Brand Logo in mobile header */}
            <div className="flex items-center gap-1.5 ml-2">
              <Sparkles className="h-4.5 w-4.5 text-indigo-400" />
              <span className="font-heading text-base font-bold text-white">
                Startup<span className="text-indigo-500">Xpert</span>
              </span>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-grow p-4 md:p-8 overflow-y-auto max-h-screen relative z-10">
          <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
export default DashboardLayout;
