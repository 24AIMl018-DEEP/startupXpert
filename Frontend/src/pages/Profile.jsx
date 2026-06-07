import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStartup } from '../context/StartupContext';
import { useToast } from '../context/ToastContext';
import DashboardLayout from '../layouts/DashboardLayout';
import InputField from '../components/InputField';
import { User, Mail, Briefcase, Upload, Trash2, Save, Sparkles, BarChart2, ShieldCheck, Star, Award } from 'lucide-react';

const Profile = () => {
  const { user, setUserInfo, getInitials, dashboardStats, startupDetails, setStartupInfo } = useStartup();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ fullName: user.fullName || '', email: user.email || '', role: user.role || 'Founder' });
  const [startupData, setStartupData] = useState({ startupName: startupDetails.startupName || '', startupDomain: startupDetails.startupDomain || '', revenueModel: startupDetails.revenueModel || '', startupStage: startupDetails.startupStage || 'Idea' });
  const [isSaving, setIsSaving] = useState(false);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 1024 * 1024) { showToast('Max 1MB file size.', 'error'); return; }
    const reader = new FileReader();
    reader.onloadend = () => { setUserInfo({ ...user, avatarUrl: reader.result }); showToast('Avatar updated!', 'success'); };
    reader.readAsDataURL(file);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.fullName.trim()) { showToast('Name is required.', 'error'); return; }
    setIsSaving(true);
    setTimeout(() => {
      setUserInfo({ ...user, fullName: formData.fullName, email: formData.email, role: formData.role });
      if (startupData.startupName.trim()) setStartupInfo(startupData);
      setIsSaving(false);
      showToast('Profile saved!', 'success');
    }, 900);
  };

  const roleColor = { Founder: 'var(--brand-light)', Student: 'var(--cyan)', Developer: 'var(--green)', Advisor: 'var(--amber)' }[user.role] || 'var(--text2)';

  return (
    <DashboardLayout>

      {/* ── Header ── */}
      <div style={{ marginBottom: 32 }} className="animate-fade-up">
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--brand-light)', marginBottom: 6 }}>
          Account
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text1)', letterSpacing: '-0.02em', margin: 0 }}>
          Your Profile
        </h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 24, alignItems: 'start' }} className="animate-fade-up">

        {/* ── Left: Avatar card ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Avatar */}
          <div className="glass-card" style={{ padding: 28, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <div className="glow-brand" style={{ width: 200, height: 200, top: -60, left: '50%', transform: 'translateX(-50%)', opacity: 0.5 }} />
            <div style={{ position: 'relative', zIndex: 1 }}>

              {/* Avatar circle */}
              <div style={{ position: 'relative', display: 'inline-block', marginBottom: 16 }}>
                {user.avatarUrl
                  ? <img src={user.avatarUrl} alt="" style={{ width: 88, height: 88, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--brand-border)', boxShadow: 'var(--shadow-brand)' }} />
                  : <div style={{ width: 88, height: 88, borderRadius: '50%', background: 'linear-gradient(135deg, var(--brand-bg), var(--surface3))', border: '2px solid var(--brand-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800, color: 'var(--brand-light)', boxShadow: 'var(--shadow-brand)' }}>
                      {getInitials()}
                    </div>
                }
                <div style={{ position: 'absolute', bottom: 4, right: 4, width: 14, height: 14, borderRadius: '50%', background: 'var(--green)', border: '2px solid var(--surface)' }} />
              </div>

              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text1)', marginBottom: 4, letterSpacing: '-0.01em' }}>{user.fullName || 'Founder'}</div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 99, background: 'var(--brand-bg)', border: '1px solid var(--brand-border)', fontSize: 11, fontWeight: 700, color: roleColor }}>
                  <Star size={10} fill="currentColor" /> {user.role}
                </div>
              </div>

              <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 16, wordBreak: 'break-all' }}>{user.email}</div>

              {/* Upload */}
              <div style={{ display: 'flex', gap: 8 }}>
                <label style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '8px 0', borderRadius: 'var(--r)', border: '1px solid var(--border2)', background: 'transparent', color: 'var(--text2)', fontSize: 11, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface2)'; e.currentTarget.style.color = 'var(--text1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text2)'; }}>
                  <Upload size={12} /> Upload
                  <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
                </label>
                {user.avatarUrl && (
                  <button onClick={() => { setUserInfo({ ...user, avatarUrl: '' }); showToast('Avatar removed.', 'info'); }}
                    style={{ padding: '8px 10px', borderRadius: 'var(--r)', border: '1px solid var(--red-border)', background: 'var(--red-bg)', color: 'var(--red)', cursor: 'pointer', fontSize: 11, fontWeight: 600, transition: 'all 0.15s' }}>
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Stats card */}
          <div className="glass-card" style={{ padding: 20 }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text3)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 5 }}>
              <BarChart2 size={12} /> Activity
            </div>
            {[
              { label: 'Validations',   val: dashboardStats.totalStartups,    color: 'var(--brand-light)' },
              { label: 'Reports done',  val: dashboardStats.completedAnalysis, color: 'var(--green)' },
              { label: 'Roadmap steps', val: dashboardStats.roadmapProgress,   color: 'var(--cyan)' },
              { label: 'Draft status',  val: dashboardStats.savedDraftCount > 0 ? 'Saved' : 'None', color: 'var(--amber)' },
            ].map(({ label, val, color }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 12, color: 'var(--text2)' }}>{label}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color, fontFamily: 'var(--font-mono)' }}>{val}</span>
              </div>
            ))}
            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--green)' }}>
              <ShieldCheck size={12} /> Account verified
            </div>
          </div>
        </div>

        {/* ── Right: Forms ── */}
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Personal info */}
          <div className="glass-card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
              <User size={15} style={{ color: 'var(--brand-light)' }} />
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text1)' }}>Personal Information</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              <InputField label="Full Name" type="text" name="fullName" value={formData.fullName} onChange={e => setFormData(p => ({...p, fullName: e.target.value}))} placeholder="Elon Musk" required />
              <InputField label="Email" type="email" name="email" value={formData.email} onChange={e => setFormData(p => ({...p, email: e.target.value}))} placeholder="you@example.com" required />
            </div>
            <div style={{ marginTop: 16 }}>
              <div className="field-label">Role</div>
              <select value={formData.role} onChange={e => setFormData(p => ({...p, role: e.target.value}))}>
                {['Founder','Student','Developer','Business Analyst','Advisor','Other'].map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
          </div>

          {/* Startup info */}
          <div className="glass-card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
              <Briefcase size={15} style={{ color: 'var(--cyan)' }} />
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text1)' }}>Active Venture</div>
            </div>

            {startupDetails.startupName ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                <InputField label="Startup Name" type="text" name="startupName" value={startupData.startupName} onChange={e => setStartupData(p => ({...p, startupName: e.target.value}))} placeholder="My Startup" />
                <InputField label="Domain" type="text" name="startupDomain" value={startupData.startupDomain} onChange={e => setStartupData(p => ({...p, startupDomain: e.target.value}))} placeholder="SaaS / AI" />
                <InputField label="Revenue Model" type="text" name="revenueModel" value={startupData.revenueModel} onChange={e => setStartupData(p => ({...p, revenueModel: e.target.value}))} placeholder="Subscription" />
                <div>
                  <div className="field-label">Stage</div>
                  <select value={startupData.startupStage} onChange={e => setStartupData(p => ({...p, startupStage: e.target.value}))}>
                    {['Idea','Validation','MVP','Growth','Scaling'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <Award size={28} style={{ color: 'var(--text3)', margin: '0 auto 12px' }} />
                <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 16 }}>No startup validated yet</div>
                <button type="button" onClick={() => navigate('/onboarding/role')} className="btn btn-primary btn-sm">
                  <Sparkles size={13} /> Validate an Idea
                </button>
              </div>
            )}
          </div>

          {/* Save */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" disabled={isSaving} className="btn btn-primary">
              {isSaving
                ? <div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spinSlow 0.8s linear infinite' }} />
                : <><Save size={13} /> Save Profile</>
              }
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
