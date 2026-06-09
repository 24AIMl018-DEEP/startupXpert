import React, { useState, useEffect } from 'react';
import { useStartup } from '../context/StartupContext';
import { useToast } from '../context/ToastContext';
import DashboardLayout from '../layouts/DashboardLayout';
import { Palette, Database, Trash2, RefreshCw, Save, ShieldAlert, Sparkles, Check, Zap, Moon, Sun, Monitor } from 'lucide-react';

const THEMES = [
  {
    id: 'Dark Futurism',
    label: 'Dark Futurism',
    desc: 'Deep violet on near-black',
    dots: ['#7c3aed', '#06b6d4', '#1e1e32'],
    bodyClass: 'theme-dark-futurism',
  },
  {
    id: 'Midnight Blue',
    label: 'Midnight Blue',
    desc: 'Cobalt depths & sky accents',
    dots: ['#3b82f6', '#60a5fa', '#121e3a'],
    bodyClass: 'theme-midnight-blue',
  },
  {
    id: 'Neo Emerald',
    label: 'Neo Emerald',
    desc: 'Forest base & seafoam glow',
    dots: ['#10b981', '#34d399', '#10251a'],
    bodyClass: 'theme-neo-emerald',
  },
];

const ANALYSIS_MODES = [
  { value: 'Comprehensive', label: 'Comprehensive', sub: 'All 9 dimensions, 5 agents', icon: Zap },
  { value: 'Standard',      label: 'Standard',      sub: 'Core metrics only',         icon: Sparkles },
  { value: 'Fast',          label: 'Fast',           sub: 'Quick proof-of-concept',   icon: Moon },
];

const Settings = () => {
  const { settings, saveSettings, resetSettingsDefaults, clearDraft, clearHistory, loadingState } = useStartup();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    theme: settings.theme || 'Dark Futurism',
    themeMode: settings.themeMode || 'Dark',
    autoSaveDrafts: settings.autoSaveDrafts !== false,
    analysisPreference: settings.analysisPreference || 'Comprehensive',
  });

  useEffect(() => {
    setFormData({
      theme: settings.theme || 'Dark Futurism',
      themeMode: settings.themeMode || 'Dark',
      autoSaveDrafts: settings.autoSaveDrafts !== false,
      analysisPreference: settings.analysisPreference || 'Comprehensive',
    });
  }, [settings]);

  const handleSave = (e) => {
    e.preventDefault();
    saveSettings(formData);
  };

  const applyTheme = (themeId) => {
    const updated = { ...formData, theme: themeId };
    setFormData(updated);
    saveSettings(updated);
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div style={{ marginBottom: 32 }} className="animate-fade-up">
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--brand-light)', marginBottom: 6 }}>
          Preferences
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text1)', letterSpacing: '-0.02em', margin: 0, marginBottom: 4 }}>
          Settings
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text2)', margin: 0 }}>
          Customize your workspace theme, analysis depth, and data management.
        </p>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* ── Theme ── */}
        <div className="glass-card animate-fade-up" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--brand-bg)', border: '1px solid var(--brand-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Palette size={14} style={{ color: 'var(--brand-light)' }} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text1)' }}>Workspace Theme</div>
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>All components update instantly</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            {THEMES.map(t => {
              const active = formData.theme === t.id;
              return (
                <button key={t.id} type="button" onClick={() => applyTheme(t.id)}
                  style={{
                    padding: '16px 18px', borderRadius: 'var(--r-lg)',
                    border: `1px solid ${active ? 'var(--brand)' : 'var(--border2)'}`,
                    background: active ? 'var(--brand-bg)' : 'var(--surface2)',
                    cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                    position: 'relative', overflow: 'hidden',
                  }}>
                  {active && (
                    <div style={{ position: 'absolute', top: 10, right: 10, width: 18, height: 18, borderRadius: '50%', background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Check size={10} color="#fff" />
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 5, marginBottom: 10 }}>
                    {t.dots.map((c, i) => (
                      <span key={i} style={{ width: 12, height: 12, borderRadius: '50%', background: c, display: 'inline-block' }} />
                    ))}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: active ? 'var(--brand-light)' : 'var(--text1)', marginBottom: 2 }}>{t.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>{t.desc}</div>
                </button>
              );
            })}
          </div>

          {/* Light / Dark mode toggle */}
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text1)', marginBottom: 2 }}>Display Mode</div>
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>Switch between dark and light appearance</div>
            </div>
            <div style={{ display: 'flex', gap: 6, padding: 3, background: 'var(--surface3)', borderRadius: 'var(--r-md)', border: '1px solid var(--border2)' }}>
              {[{ val: 'Dark', Icon: Moon }, { val: 'Light', Icon: Sun }].map(({ val, Icon }) => {
                const active = formData.themeMode === val;
                return (
                  <button key={val} type="button"
                    onClick={() => { const u = { ...formData, themeMode: val }; setFormData(u); saveSettings(u); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5, padding: '6px 14px',
                      borderRadius: 'var(--r)', border: 'none',
                      background: active ? 'var(--brand)' : 'transparent',
                      color: active ? '#fff' : 'var(--text3)',
                      cursor: 'pointer', fontSize: 12, fontWeight: 700, transition: 'all 0.18s',
                      boxShadow: active ? '0 2px 8px rgba(124,58,237,0.3)' : 'none',
                    }}>
                    <Icon size={12} /> {val}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Analysis Depth ── */}
        <div className="glass-card animate-fade-up delay-75" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--cyan-bg)', border: '1px solid var(--cyan-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={14} style={{ color: 'var(--cyan)' }} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text1)' }}>AI Analysis Depth</div>
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>Controls how many dimensions are analyzed</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
            {ANALYSIS_MODES.map(m => {
              const active = formData.analysisPreference === m.value;
              const Icon = m.icon;
              return (
                <button key={m.value} type="button" onClick={() => setFormData(p => ({ ...p, analysisPreference: m.value }))}
                  className={`pill${active ? ' active' : ''}`}
                  style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '12px 14px', gap: 6, height: 'auto' }}>
                  <Icon size={14} style={{ color: active ? 'var(--brand-light)' : 'var(--text3)' }} />
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: active ? 'var(--brand-light)' : 'var(--text1)', textAlign: 'left' }}>{m.label}</div>
                    <div style={{ fontSize: 10, color: 'var(--text3)', textAlign: 'left' }}>{m.sub}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Auto Save Toggle ── */}
        <div className="glass-card animate-fade-up delay-150" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--green-bg)', border: '1px solid var(--green-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Save size={14} style={{ color: 'var(--green)' }} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text1)' }}>Auto-Save Drafts</div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>Silently saves onboarding progress so you never lose input</div>
              </div>
            </div>
            <button type="button" onClick={() => setFormData(p => ({ ...p, autoSaveDrafts: !p.autoSaveDrafts }))}
              style={{
                width: 48, height: 26, borderRadius: 99, border: 'none', cursor: 'pointer', transition: 'all 0.2s', position: 'relative', flexShrink: 0,
                background: formData.autoSaveDrafts ? 'var(--brand)' : 'var(--surface3)',
              }}>
              <div style={{
                width: 20, height: 20, borderRadius: '50%', background: '#fff',
                position: 'absolute', top: 3, transition: 'left 0.2s',
                left: formData.autoSaveDrafts ? 25 : 3,
              }} />
            </button>
          </div>
        </div>

        {/* ── Actions ── */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }} className="animate-fade-up delay-225">
          <button type="button" onClick={resetSettingsDefaults} className="btn btn-outline">
            <RefreshCw size={13} /> Reset Defaults
          </button>
          <button type="submit" disabled={loadingState} className="btn btn-primary">
            {loadingState
              ? <div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spinSlow 0.8s linear infinite' }} />
              : <><Save size={13} /> Save Settings</>
            }
          </button>
        </div>
      </form>

      {/* ── Danger Zone ── */}
      <div style={{ marginTop: 32, padding: 24, borderRadius: 'var(--r-lg)', border: '1px solid var(--red-border)', background: 'var(--red-bg)' }} className="animate-fade-up delay-300">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <ShieldAlert size={15} style={{ color: 'var(--red)' }} />
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Data Management</div>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 16, lineHeight: 1.6 }}>
          These actions permanently remove local data and cannot be undone.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <button onClick={() => { if (window.confirm('Clear saved onboarding draft?')) { clearDraft(); showToast('Draft cleared.', 'info'); } }}
            className="btn btn-danger btn-sm">
            <Trash2 size={12} /> Clear Draft
          </button>
          <button onClick={() => { if (window.confirm('Delete all analysis history?')) clearHistory(); }}
            className="btn btn-danger btn-sm">
            <Trash2 size={12} /> Purge History
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
