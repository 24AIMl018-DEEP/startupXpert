import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStartup } from '../context/StartupContext';
import { useToast } from '../context/ToastContext';
import DashboardLayout from '../layouts/DashboardLayout';
import InputField from '../components/InputField';
import { 
  User, 
  Mail, 
  Briefcase, 
  Upload, 
  Trash2, 
  Save, 
  Sparkles, 
  Award, 
  LineChart, 
  ShieldCheck 
} from 'lucide-react';

const Profile = () => {
  const { user, setUserInfo, getInitials, dashboardStats, startupDetails, setStartupInfo } = useStartup();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Local Form state
  const [formData, setFormData] = useState({
    fullName: user.fullName || '',
    email: user.email || '',
    role: user.role || 'Founder',
  });

  const [startupData, setStartupData] = useState({
    startupName: startupDetails.startupName || '',
    startupDomain: startupDetails.startupDomain || '',
    revenueModel: startupDetails.revenueModel || '',
    startupStage: startupDetails.startupStage || 'Idea Stage',
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleTextChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStartupChange = (e) => {
    const { name, value } = e.target;
    setStartupData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        showToast('File size is too large (max 1MB).', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const updatedUser = { ...user, avatarUrl: reader.result };
        setUserInfo(updatedUser);
        showToast('Profile avatar updated!', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    const updatedUser = { ...user, avatarUrl: '' };
    setUserInfo(updatedUser);
    showToast('Profile avatar removed.', 'info');
  };

  const handleSaveChanges = (e) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.email.trim()) {
      showToast('Name and Email are required.', 'error');
      return;
    }

    setIsSaving(true);

    setTimeout(() => {
      // 1. Save user profile info
      const updatedUser = {
        ...user,
        fullName: formData.fullName,
        email: formData.email,
        role: formData.role
      };
      setUserInfo(updatedUser);

      // 2. Save startup details if a name exists
      if (startupData.startupName.trim()) {
        setStartupInfo(startupData);
      }

      setIsSaving(false);
      showToast('Profile and venture changes archived successfully!', 'success');
    }, 1000);
  };

  return (
    <DashboardLayout>
      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-500/5 pb-6 text-left">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">Founder Account Hub</span>
          <h1 className="font-heading text-3xl font-extrabold text-white mt-1">
            Venture Profile
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage your personal credentials, startup portfolio details, and platform statistics.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Avatar & Account stats */}
        <div className="space-y-6">
          {/* Avatar card */}
          <div className="rounded-2xl border border-indigo-500/10 bg-[#0e0e16]/60 p-6 backdrop-blur-md text-center relative overflow-hidden">
            <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-indigo-500/5 blur-xl"></div>
            
            {/* Avatar container */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                {user.avatarUrl ? (
                  <img 
                    src={user.avatarUrl} 
                    alt={user.fullName} 
                    className="h-24 w-24 rounded-full object-cover border-2 border-indigo-500/30 p-1 shadow-lg shadow-indigo-500/20"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full border-2 border-indigo-500/20 bg-indigo-950/40 text-indigo-400 flex items-center justify-center font-heading text-3xl font-bold shadow-lg shadow-indigo-500/10">
                    {getInitials()}
                  </div>
                )}
                <span className="absolute bottom-0 right-0 h-4.5 w-4.5 rounded-full bg-emerald-500 border-2 border-[#0a0a0f]" title="Active session"></span>
              </div>

              <div>
                <h3 className="font-heading text-base font-bold text-white truncate max-w-[200px]">
                  {user.fullName || 'Founder Innovator'}
                </h3>
                <span className="rounded bg-indigo-950 border border-indigo-500/20 px-2.5 py-0.5 text-3xs font-extrabold tracking-widest uppercase text-indigo-300 inline-block mt-1">
                  {user.role}
                </span>
              </div>

              {/* Avatar Upload buttons */}
              <div className="flex gap-2 w-full pt-2">
                <label className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-indigo-500/20 bg-indigo-500/5 px-3 py-2 text-xs font-semibold text-gray-300 hover:bg-indigo-500/10 hover:text-white transition-all cursor-pointer">
                  <Upload className="h-3.5 w-3.5" />
                  Upload
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleAvatarChange} 
                    className="hidden" 
                  />
                </label>
                {user.avatarUrl && (
                  <button
                    onClick={handleRemoveAvatar}
                    className="flex items-center justify-center gap-1.5 rounded-lg border border-rose-500/20 bg-rose-500/5 px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-all"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Platform stats */}
          <div className="rounded-2xl border border-indigo-500/10 bg-[#0e0e16]/60 p-6 backdrop-blur-md text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2 mb-4 border-b border-indigo-500/5 pb-2">
              <LineChart className="h-4 w-4 text-indigo-400" />
              Activity Indices
            </span>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">Archived Stress-Tests</span>
                <span className="font-bold text-white font-mono">{dashboardStats.totalStartups}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">Milestones Completion</span>
                <span className="font-bold text-indigo-400 font-mono">{dashboardStats.roadmapProgress}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">Active Draft Status</span>
                <span className="font-bold text-emerald-400">{dashboardStats.savedDraftCount > 0 ? 'Draft Saved' : 'No Draft'}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">Security Clearance</span>
                <span className="font-bold text-cyan-400 flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Verified
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Editable Forms (Personal & Startup details) */}
        <div className="lg:col-span-2 space-y-6 text-left">
          <form onSubmit={handleSaveChanges} className="space-y-6">
            
            {/* Personal Details Panel */}
            <div className="rounded-2xl border border-indigo-500/10 bg-[#0e0e16]/60 p-6 backdrop-blur-md space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2 border-b border-indigo-500/5 pb-2">
                <User className="h-4 w-4 text-indigo-400" />
                Personal Information
              </span>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField 
                  label="Full Name"
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleTextChange}
                  placeholder="Elon Musk"
                  required
                />
                
                <InputField 
                  label="Email Address"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleTextChange}
                  placeholder="elon@spacex.com"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Role Title
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleTextChange}
                  className="w-full rounded-xl border border-indigo-500/10 bg-[#0a0a0f] p-3 text-sm text-white placeholder-gray-600 outline-none transition-all duration-300 focus:border-indigo-500/40 focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="Founder">Founder</option>
                  <option value="Student">Student</option>
                  <option value="Business Team">Business Team</option>
                  <option value="Advisor">Advisor</option>
                  <option value="Developer">Developer</option>
                </select>
              </div>
            </div>

            {/* Startup Venture Details Panel */}
            <div className="rounded-2xl border border-indigo-500/10 bg-[#0e0e16]/60 p-6 backdrop-blur-md space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2 border-b border-indigo-500/5 pb-2">
                <Briefcase className="h-4 w-4 text-cyan-400" />
                Current Active Startup
              </span>

              {startupDetails.startupName ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField 
                      label="Startup Venture Name"
                      type="text"
                      name="startupName"
                      value={startupData.startupName}
                      onChange={handleStartupChange}
                      placeholder="My Venture"
                    />

                    <InputField 
                      label="Primary Target Domain"
                      type="text"
                      name="startupDomain"
                      value={startupData.startupDomain}
                      onChange={handleStartupChange}
                      placeholder="SaaS / AI Services"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField 
                      label="Revenue Model"
                      type="text"
                      name="revenueModel"
                      value={startupData.revenueModel}
                      onChange={handleStartupChange}
                      placeholder="Subscription SaaS"
                    />

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Venture Lifecycle Stage
                      </label>
                      <select
                        name="startupStage"
                        value={startupData.startupStage}
                        onChange={handleStartupChange}
                        className="w-full rounded-xl border border-indigo-500/10 bg-[#0a0a0f] p-3 text-sm text-white placeholder-gray-600 outline-none transition-all duration-300 focus:border-indigo-500/40 focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="Idea Stage">Idea Stage</option>
                        <option value="Validation Stage">Validation Stage</option>
                        <option value="MVP Build">MVP Build</option>
                        <option value="Product-Market Fit">Product-Market Fit</option>
                        <option value="Scaling Phase">Scaling Phase</option>
                      </select>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center space-y-4">
                  <p className="text-xs text-gray-500">
                    No validated startup venture registered in your session profile.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate('/onboarding/role')}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-all"
                  >
                    <Sparkles className="h-4 w-4" />
                    Stress-Test Idea Now
                  </button>
                </div>
              )}
            </div>

            {/* Form Save Button */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="group relative flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-[0_0_20px_rgba(99,102,241,0.2)] hover:bg-indigo-500 transition-all duration-300 disabled:opacity-50"
              >
                {isSaving ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Venture Profile
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
