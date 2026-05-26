import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

export const DashboardLayout = ({ children, activeTab, setActiveTab }) => {
  return (
    <div className="relative min-h-screen bg-[#0a0a0f] flex text-white overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Content wrapper */}
      <div className="flex-grow flex flex-col min-h-screen overflow-hidden">
        {/* Main Content Area */}
        <main className="flex-grow p-8 overflow-y-auto max-h-screen relative z-10">
          <div className="max-w-6xl mx-auto space-y-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
export default DashboardLayout;
