import React, { useState, useEffect, useCallback } from 'react';
import { useStartup } from '../context/StartupContext';
import { useToast } from '../context/ToastContext';
import DashboardLayout from '../layouts/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import {
  Users, Mail, Shield, Award, Copy, Check, Plus, Loader,
  Building2, Calendar, ClipboardList, Compass, ArrowRight, ExternalLink
} from 'lucide-react';
import { getMyOrganization, addOrganizationMember } from '../services/startupApi';

const getRandomGradient = (name = 'User') => {
  const hash = [...name].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colors = [
    'linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)', // violet to cyan
    'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)', // blue to light blue
    'linear-gradient(135deg, #10b981 0%, #34d399 100%)', // emerald to green
    'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)', // amber to yellow
    'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)', // pink to rose
    'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)', // violet light
  ];
  return colors[hash % colors.length];
};

const Team = () => {
  const { user } = useStartup();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [orgData, setOrgData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [inserting, setInserting] = useState(false);
  
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    role: '',
    skills: ''
  });

  const fetchOrg = useCallback(async () => {
    if (!user?.userId) return;
    setLoading(true);
    try {
      const data = await getMyOrganization(user.userId);
      setOrgData(data);
    } catch (err) {
      console.error('[Team] Failed to load organization:', err);
      showToast('Failed to load team data. Direct database connection fallback active.', 'warning');
    } finally {
      setLoading(false);
    }
  }, [user?.userId, showToast]);

  useEffect(() => {
    fetchOrg();
  }, [fetchOrg]);

  const copyInviteCode = () => {
    if (orgData?.org?.invite_code) {
      navigator.clipboard.writeText(orgData.org.invite_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      showToast('Invite code copied to clipboard!', 'success');
    }
  };

  const handleInsert = async (e) => {
    e.preventDefault();
    if (!form.fullName.trim() || !form.email.trim() || !form.role.trim()) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email.trim())) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }

    setInserting(true);
    try {
      await addOrganizationMember(
        orgData.org.id,
        form.email.trim(),
        form.fullName.trim(),
        form.role.trim(),
        form.skills.trim()
      );
      showToast('Teammate inserted successfully!', 'success');
      setForm({ fullName: '', email: '', role: '', skills: '' });
      await fetchOrg(); // refresh teammate list
    } catch (err) {
      showToast(err.message || 'Failed to insert teammate.', 'error');
    } finally {
      setInserting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout activeTab="team">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400, gap: 12, color: 'var(--text3)' }}>
          <Loader size={20} style={{ animation: 'spinSlow 1s linear infinite' }} /> Loading team workspace…
        </div>
      </DashboardLayout>
    );
  }

  if (!orgData?.org) {
    return (
      <DashboardLayout activeTab="team">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 400, gap: 16 }}>
          <Users size={48} style={{ color: 'var(--text3)', opacity: 0.5 }} />
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text1)' }}>No Organization Connected</div>
          <div style={{ fontSize: 13, color: 'var(--text3)', maxWidth: 400, textAlign: 'center' }}>
            You need to be part of an organization to view and manage team members.
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const isFounder = orgData.myRole?.toLowerCase() === 'founder';
  const membersCount = orgData.members?.length || 0;
  const totalTasks = orgData.members?.reduce((acc, curr) => acc + (curr.task_count || 0), 0) || 0;

  return (
    <DashboardLayout activeTab="team">
      {/* ── Header ── */}
      <div style={{ marginBottom: 28 }} className="animate-fade-up">
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--brand-light)', marginBottom: 6 }}>
          Workspace Directory
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text1)', letterSpacing: '-0.02em', margin: 0, marginBottom: 4 }}>
          Team Management
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text2)', margin: 0 }}>
          Manage employee insertion, assign roles, copy invite codes, and track teammate tasks.
        </p>
      </div>

      {/* ── Organization Overview & Setup Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: isFounder ? '2fr 1fr' : '1fr', gap: 20, marginBottom: 28 }}>
        
        {/* Org Banner Card */}
        <div className="glass-card animate-fade-up" style={{ padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
          {/* Accent decoration */}
          <div style={{ position: 'absolute', top: 0, right: 0, width: 150, height: 150, background: 'radial-gradient(circle, rgba(124,93,249,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
          
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 42, height: 42, borderRadius: 10, background: 'var(--brand-bg)', border: '1px solid var(--brand-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Building2 size={20} style={{ color: 'var(--brand-light)' }} />
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text1)' }}>{orgData.org.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>{orgData.org.domain || 'Internal Startup Network'}</div>
              </div>
            </div>

            <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6, margin: '0 0 16px 0', maxWidth: 500 }}>
              Teammates connected to this organization can instantly access their dashboards and claim tasks dynamically generated inside the Roadmap engine.
            </p>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text1)', fontFamily: "'JetBrains Mono', monospace" }}>{membersCount}</div>
              <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 2 }}>Connected Staff</div>
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--brand-light)', fontFamily: "'JetBrains Mono', monospace" }}>{totalTasks}</div>
              <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 2 }}>Roadmap Tasks</div>
            </div>
          </div>
        </div>

        {/* Invite Code Panel */}
        <div className="glass-card animate-fade-up delay-75" style={{ padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px dashed var(--brand-border)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Award size={15} style={{ color: 'var(--brand-light)' }} />
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text1)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Organization Code</div>
            </div>
            <p style={{ fontSize: 11, color: 'var(--text3)', lineHeight: 1.5, margin: '0 0 16px 0' }}>
              Share this invite code with employees during registration so they can connect cleanly to your startup database.
            </p>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: 'var(--r-md)', marginBottom: 10 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text1)', letterSpacing: '0.12em', fontFamily: "'JetBrains Mono', monospace" }}>
                {orgData.org.invite_code}
              </span>
              <button 
                onClick={copyInviteCode}
                style={{ background: 'transparent', border: 'none', color: copied ? 'var(--green)' : 'var(--text3)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 2 }}
                title="Copy Code"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
            <button onClick={copyInviteCode} className="btn btn-outline" style={{ width: '100%', fontSize: 11, padding: '8px' }}>
              {copied ? 'Invite Code Copied' : 'Copy Invite Code'}
            </button>
          </div>
        </div>

      </div>

      {/* ── Member Insertion Form (Founders Only) ── */}
      {isFounder && (
        <div className="glass-card animate-fade-up delay-150" style={{ padding: 24, marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--brand-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Plus size={14} style={{ color: 'var(--brand-light)' }} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text1)' }}>Insert New Member</div>
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>Add teammate auth credentials and store their profile in the database</div>
            </div>
          </div>

          <form onSubmit={handleInsert} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, alignItems: 'end' }}>
            <div>
              <label className="field-label" style={{ marginBottom: 6 }}>Full Name *</label>
              <input
                type="text"
                value={form.fullName}
                onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))}
                placeholder="e.g., Aayushi"
                required
              />
            </div>
            <div>
              <label className="field-label" style={{ marginBottom: 6 }}>Email Address *</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="e.g., ayu@gmail.com"
                required
              />
            </div>
            <div>
              <label className="field-label" style={{ marginBottom: 6 }}>Role / Job Title *</label>
              <input
                type="text"
                value={form.role}
                onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                placeholder="e.g., AIML Developer"
                required
              />
            </div>
            <div>
              <label className="field-label" style={{ marginBottom: 6 }}>Skills (comma-separated)</label>
              <input
                type="text"
                value={form.skills}
                onChange={e => setForm(p => ({ ...p, skills: e.target.value }))}
                placeholder="e.g., React, Python, NLP"
              />
            </div>
            <div style={{ gridColumn: 'span 1', display: 'flex' }}>
              <button 
                type="submit" 
                disabled={inserting} 
                className="btn btn-primary"
                style={{ width: '100%', height: 40, justifyContent: 'center' }}
              >
                {inserting ? (
                  <Loader size={14} style={{ animation: 'spinSlow 1s linear infinite' }} />
                ) : (
                  <>
                    <Plus size={14} /> Insert Member
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Teammates Directory Grid ── */}
      <div className="animate-fade-up delay-225">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text1)' }}>Teammate Directory</div>
          <div style={{ fontSize: 11, color: 'var(--text3)' }}>Sorted by joined date</div>
        </div>

        {orgData.members.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 24px', background: 'var(--surface)', border: '1px dashed var(--border2)', borderRadius: 'var(--r-lg)', color: 'var(--text3)' }}>
            No members are registered in this organization. Invite your team using the invite code.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
            {orgData.members.map((member) => {
              const name = member.full_name || member.email?.split('@')[0] || 'Teammate';
              const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
              const initialsGradient = getRandomGradient(name);
              const formattedDate = member.joined_at 
                ? new Date(member.joined_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
                : 'Joined Recently';
              
              const isCurrentMemberCard = member.user_id === user.userId;

              return (
                <div key={member.id} className="glass-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'transform 0.2s, border-color 0.2s' }}>
                  
                  <div>
                    {/* Teammate Header (Avatar + Name) */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: 10,
                        background: initialsGradient,
                        color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 14, fontWeight: 800, letterSpacing: '0.05em',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                      }}>
                        {initials || '?'}
                      </div>
                      
                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {name}
                          </span>
                          {isCurrentMemberCard && (
                            <span className="badge badge-brand" style={{ fontSize: 8, padding: '1px 4px' }}>You</span>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                          <span style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.03em' }}>
                            {member.job_title || 'Team Member'}
                          </span>
                          <span style={{ fontSize: 10, color: 'var(--text3)' }}>·</span>
                          <span className={`badge ${member.role === 'founder' ? 'badge-amber' : 'badge-ghost'}`} style={{ fontSize: 8, textTransform: 'capitalize', padding: '1px 4px' }}>
                            {member.role || 'member'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Email detail */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, color: 'var(--text2)' }}>
                      <Mail size={12} style={{ color: 'var(--text3)', flexShrink: 0 }} />
                      <span style={{ fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {member.email || 'No email provided'}
                      </span>
                    </div>

                    {/* Skills pills */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 16 }}>
                      {(member.skills || []).length > 0 ? (
                        member.skills.map((skill, idx) => (
                          <span key={idx} className="badge badge-ghost" style={{ fontSize: 9, padding: '2px 6px', border: '1px solid var(--border)' }}>
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span style={{ fontSize: 10, color: 'var(--text3)', fontStyle: 'italic' }}>No skills cataloged</span>
                      )}
                    </div>
                  </div>

                  {/* Teammate Footer & Task Access */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text3)' }}>
                      <Calendar size={11} />
                      <span style={{ fontSize: 10 }}>{formattedDate}</span>
                    </div>

                    {/* Tasks Link */}
                    {isCurrentMemberCard ? (
                      <button 
                        onClick={() => navigate(user.role === 'Founder' ? '/roadmap' : '/member')}
                        style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'transparent', border: 'none', color: 'var(--brand-light)', fontSize: 11, fontWeight: 700, cursor: 'pointer', padding: '4px 8px', borderRadius: 4, transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--brand-bg)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        My Tasks <ArrowRight size={12} />
                      </button>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 10, color: 'var(--text3)' }}>Assigned:</span>
                        <span style={{ 
                          fontSize: 11, fontWeight: 700, 
                          color: member.task_count > 0 ? 'var(--brand-light)' : 'var(--text3)', 
                          fontFamily: "'JetBrains Mono', monospace",
                          background: member.task_count > 0 ? 'var(--brand-bg)' : 'var(--surface2)',
                          padding: '1px 6px', borderRadius: 4,
                          border: member.task_count > 0 ? '1px solid var(--brand-border)' : '1px solid var(--border2)'
                        }}>
                          {member.task_count || 0}
                        </span>
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Team;
