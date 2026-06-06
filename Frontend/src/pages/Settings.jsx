import React, { useState, useEffect } from 'react';
import { useStartup } from '../context/StartupContext';
import { useToast } from '../context/ToastContext';
import DashboardLayout from '../layouts/DashboardLayout';
import { 
  Settings as SettingsIcon, 
  Bell, 
  Database, 
  Trash2, 
  RefreshCw, 
  Save, 
  ShieldAlert, 
  Moon,
  Sparkles 
} from 'lucide-react';

const Settings = () => {
  const { 
    settings, 
    saveSettings, 
    resetSettingsDefaults, 
    clearDraft, 
    clearHistory, 
    loadingState
  } = useStartup();
  
  const { showToast } = useToast();

  // Local Form state initialized from global settings context
  const [formData, setFormData] = useState({
    themeMode: settings.themeMode || 'Dark',
    theme: settings.theme || 'Dark Futurism', // persistent theme key
    notificationsEnabled: settings.notificationsEnabled !== false,
    autoSaveDrafts: settings.autoSaveDrafts !== false,
    analysisPreference: settings.analysisPreference || 'Comprehensive',
  });

  // Keep local state in sync if settings changes (like during a reset)
  useEffect(() => {
    setFormData({
      themeMode: settings.themeMode || 'Dark',
      theme: settings.theme || 'Dark Futurism',
      notificationsEnabled: settings.notificationsEnabled !== false,
      autoSaveDrafts: settings.autoSaveDrafts !== false,
      analysisPreference: settings.analysisPreference || 'Comprehensive',
    });
  }, [settings]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    saveSettings(formData);
  };

  const handleReset = () => {
    resetSettingsDefaults();
  };

  const handleClearDraft = () => {
    if (window.confirm('Are you sure you want to clear your saved onboarding drafts? This action is irreversible.')) {
      clearDraft();
      showToast('Onboarding progress drafts purged.', 'info');
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('WARNING: Are you sure you want to delete all archived stress-test scorecards from your history?')) {
      clearHistory();
    }
  };

  return (
    <DashboardLayout>
      {/* Settings Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-500/5 pb-6 text-left">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">Workspace Customizations</span>
          <h1 className="font-heading text-3xl font-extrabold text-white mt-1">
            System Settings
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Configure system configurations, preferences toggles, and localized storage purges.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Config Form */}
        <div className="lg:col-span-2 space-y-6 text-left">
          <form onSubmit={handleSave} className="space-y-6">
            
            {/* Preferences Section */}
            <div className="rounded-2xl border border-indigo-500/10 bg-[#0e0e16]/60 p-6 backdrop-blur-md space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2 border-b border-indigo-500/5 pb-2">
                  <Moon className="h-4 w-4 text-indigo-400" />
                  Theme &amp; Style Preferences
                </span>
                <p className="text-[10px] text-gray-500 mt-1">Select your desired workspace interface theme layout. All components adapt instantly.</p>
              </div>

              {/* Theme Preview Cards (3 Grid) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    name: 'Dark Futurism',
                    desc: 'Deep indigo & cyan neon grids',
                    colors: ['bg-indigo-500', 'bg-cyan-400'],
                    borderClass: 'border-indigo-500/10 hover:border-indigo-500/30',
                    activeBorder: 'border-indigo-500 bg-indigo-950/20 shadow-[0_0_20px_rgba(99,102,241,0.15)]'
                  },
                  {
                    name: 'Midnight Blue',
                    desc: 'Cobalt base with sky blue layers',
                    colors: ['bg-blue-600', 'bg-sky-400'],
                    borderClass: 'border-blue-500/10 hover:border-blue-500/30',
                    activeBorder: 'border-blue-500 bg-blue-950/20 shadow-[0_0_20px_rgba(59,130,246,0.15)]'
                  },
                  {
                    name: 'Neo Emerald',
                    desc: 'Forest base with seafoam emeralds',
                    colors: ['bg-emerald-500', 'bg-teal-400'],
                    borderClass: 'border-emerald-500/10 hover:border-emerald-500/30',
                    activeBorder: 'border-emerald-500 bg-emerald-950/20 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                  }
                ].map((t) => {
                  const isActive = formData.theme === t.name;
                  return (
                    <div
                      key={t.name}
                      onClick={() => {
                        const updated = { ...formData, theme: t.name };
                        setFormData(updated);
                        saveSettings(updated);
                      }}
                      className={`relative flex flex-col justify-between p-4.5 rounded-xl border transition-all duration-300 cursor-pointer ${
                        isActive ? t.activeBorder : `${t.borderClass} bg-[#0a0a0f]`
                      }`}
                    >
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">{t.name}</h4>
                        <p className="text-[9px] text-gray-500 leading-normal">{t.desc}</p>
                      </div>

                      <div className="flex items-center justify-between pt-4 mt-2">
                        {/* Theme pills */}
                        <div className="flex gap-1.5">
                          {t.colors.map((c, i) => (
                            <span key={i} className={`h-3.5 w-3.5 rounded-full ${c} border border-[#0a0a0f]`}></span>
                          ))}
                        </div>

                        {/* Active Badge */}
                        {isActive && (
                          <span className="rounded bg-indigo-950 border border-indigo-500 px-1.5 py-0.5 text-[8px] font-extrabold uppercase tracking-widest text-indigo-400">
                            Active
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* AI Resolution Depth Select */}
              <div className="space-y-1.5 pt-2 border-t border-indigo-500/5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
                  AI Stress-Test Resolution
                </label>
                <select
                  name="analysisPreference"
                  value={formData.analysisPreference}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-indigo-500/10 bg-[#0a0a0f] p-3 text-sm text-white outline-none focus:border-indigo-500/40 focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="Comprehensive">Comprehensive Multi-Layer (Recommended)</option>
                  <option value="Standard">Standard Core Metrics</option>
                  <option value="Fast">Fast Proof-of-Concept</option>
                </select>
              </div>
            </div>

            {/* Notification and AutoSave toggles */}
            <div className="rounded-2xl border border-indigo-500/10 bg-[#0e0e16]/60 p-6 backdrop-blur-md space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2 border-b border-indigo-500/5 pb-2">
                <Bell className="h-4 w-4 text-cyan-400" />
                Real-Time Sync Toggles
              </span>

              <div className="space-y-4">
                {/* Toggles 1: Notifications */}
                <div className="flex items-center justify-between p-3 rounded-xl border border-indigo-500/5 bg-indigo-950/5">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white">Enable System Notifications</h4>
                    <p className="text-[10px] text-gray-500">Provide real-time toast alerts for critical platform actions.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      name="notificationsEnabled" 
                      checked={formData.notificationsEnabled} 
                      onChange={handleChange}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-[#0a0a0f] border border-indigo-500/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-400 peer-checked:after:bg-indigo-400 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600/30 peer-checked:border-indigo-500/40"></div>
                  </label>
                </div>

                {/* Toggles 2: Auto-save Drafts */}
                <div className="flex items-center justify-between p-3 rounded-xl border border-indigo-500/5 bg-indigo-950/5">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white">Auto-Save Onboarding Drafts</h4>
                    <p className="text-[10px] text-gray-500">Silently save progress draft records in browser localStorage.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      name="autoSaveDrafts" 
                      checked={formData.autoSaveDrafts} 
                      onChange={handleChange}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-[#0a0a0f] border border-indigo-500/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-400 peer-checked:after:bg-indigo-400 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600/30 peer-checked:border-indigo-500/40"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Save Buttons */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-indigo-500/20 bg-[#0a0a0f] px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white transition-all duration-300"
              >
                <RefreshCw className="h-4 w-4" />
                Reset Defaults
              </button>
              
              <button
                type="submit"
                disabled={loadingState}
                className="group relative flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-[0_0_20px_rgba(99,102,241,0.2)] hover:bg-indigo-500 transition-all duration-300 disabled:opacity-50"
              >
                {loadingState ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Settings
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

        {/* Right Column: Destructive Clear utilities */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-rose-500/15 bg-rose-950/5 p-6 backdrop-blur-md text-left space-y-5">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2 border-b border-rose-500/10 pb-2">
              <ShieldAlert className="h-4 w-4 text-rose-400" />
              Security &amp; Data Purge
            </span>

            <p className="text-[11px] leading-relaxed text-gray-500">
              Manage local cache resources. Once you trigger hard delete commands on drafts or stress-test reports, they cannot be recovered.
            </p>

            <div className="space-y-3 pt-2">
              {/* Reset onboarding Drafts */}
              <button
                onClick={handleClearDraft}
                className="w-full flex items-center justify-between p-3.5 rounded-xl border border-rose-500/15 bg-[#0a0a0f] hover:bg-rose-500/5 text-left transition-all duration-300 group"
              >
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white group-hover:text-rose-400 transition-colors">Clear Saved Draft</h4>
                  <p className="text-[9px] text-gray-500">Delete active onboarding form caches</p>
                </div>
                <Trash2 className="h-4.5 w-4.5 text-gray-500 group-hover:text-rose-400 transition-colors" />
              </button>

              {/* Reset History */}
              <button
                onClick={handleClearHistory}
                className="w-full flex items-center justify-between p-3.5 rounded-xl border border-rose-500/15 bg-[#0a0a0f] hover:bg-rose-500/5 text-left transition-all duration-300 group"
              >
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white group-hover:text-rose-400 transition-colors">Purge Feasibility Logs</h4>
                  <p className="text-[9px] text-gray-500">Delete all archived stress-test scorecards</p>
                </div>
                <Trash2 className="h-4.5 w-4.5 text-gray-500 group-hover:text-rose-400 transition-colors" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default Settings;
