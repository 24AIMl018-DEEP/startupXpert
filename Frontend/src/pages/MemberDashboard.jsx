import React, { useEffect, useState, useCallback } from 'react';
import { useStartup } from '../context/StartupContext';
import DashboardLayout from '../layouts/DashboardLayout';
import { CheckCircle2, Clock, AlertTriangle, Loader, ChevronDown, ChevronUp } from 'lucide-react';
import { getMemberTasks, updateTaskStatus } from '../services/startupApi';

const STATUS_OPTIONS = ['Pending', 'In Progress', 'Done', 'Blocked'];

const statusStyle = (s) => ({
  'Done':        { color: 'var(--green)',  badge: 'badge badge-green'  },
  'In Progress': { color: 'var(--brand)', badge: 'badge badge-brand'  },
  'Blocked':     { color: 'var(--red)',   badge: 'badge badge-red'    },
  'Pending':     { color: 'var(--text3)', badge: 'badge badge-ghost'  },
}[s] || { color: 'var(--text3)', badge: 'badge badge-ghost' });

const priorityBadge = (p) =>
  p === 'High' ? 'badge badge-red' : p === 'Medium' ? 'badge badge-amber' : 'badge badge-ghost';

const MemberDashboard = () => {
  const { user } = useStartup();
  const [tasks,    setTasks]   = useState([]);
  const [loading,  setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [saving,   setSaving]  = useState(null);
  const [note,     setNote]    = useState({});

  const load = useCallback(async () => {
    if (!user?.userId) return;
    setLoading(true);
    try { setTasks(await getMemberTasks(user.userId)); }
    catch { /* ignore */ }
    finally { setLoading(false); }
  }, [user?.userId]);

  useEffect(() => { load(); }, [load]);

  const changeStatus = async (taskId, newStatus) => {
    setSaving(taskId);
    try {
      await updateTaskStatus(taskId, newStatus, note[taskId] || null);
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    } catch { /* ignore */ }
    finally { setSaving(null); }
  };

  const totals = {
    total:  tasks.length,
    done:   tasks.filter(t => t.status === 'Done').length,
    active: tasks.filter(t => t.status === 'In Progress').length,
    blocked:tasks.filter(t => t.status === 'Blocked').length,
  };

  if (loading) return (
    <DashboardLayout activeTab="member">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, gap: 12, color: 'var(--text3)' }}>
        <Loader size={20} style={{ animation: 'spinSlow 1s linear infinite' }}/> Loading your tasks…
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout activeTab="member">
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--brand-light)', marginBottom: 6 }}>My Workspace</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text1)', letterSpacing: '-0.02em' }}>
          {user?.fullName?.split(' ')[0] || 'Team'}'s Task Board
        </div>
        <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>Tasks assigned to you across all projects.</div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total',      val: totals.total,   color: 'var(--text1)'       },
          { label: 'Done',       val: totals.done,    color: 'var(--green)'       },
          { label: 'Active',     val: totals.active,  color: 'var(--brand-light)' },
          { label: 'Blocked',    val: totals.blocked, color: 'var(--red)'         },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color, fontFamily: "'JetBrains Mono', monospace" }}>{s.val}</div>
            <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 3 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Task list */}
      {tasks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 24px', background: 'var(--surface)', border: '1px dashed var(--border2)', borderRadius: 'var(--r-lg)', color: 'var(--text3)', fontSize: 13 }}>
          No tasks assigned to you yet. Ask your founder to generate a roadmap.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {tasks.map(task => {
            const sc = statusStyle(task.status);
            const open = expanded === task.id;
            return (
              <div key={task.id} className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                {/* Task header row */}
                <div
                  onClick={() => setExpanded(open ? null : task.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', cursor: 'pointer' }}>
                  {/* Status icon */}
                  <div style={{ flexShrink: 0 }}>
                    {task.status === 'Done'
                      ? <CheckCircle2 size={18} color="var(--green)"/>
                      : task.status === 'Blocked'
                      ? <AlertTriangle size={18} color="var(--red)"/>
                      : <Clock size={18} color={sc.color}/>
                    }
                  </div>

                  {/* Title + meta */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text1)', marginBottom: 4,
                      textDecoration: task.status === 'Done' ? 'line-through' : 'none',
                      opacity: task.status === 'Done' ? 0.6 : 1 }}>
                      {task.title}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                      <span className={sc.badge}>{task.status}</span>
                      <span className={priorityBadge(task.priority)}>{task.priority || 'Low'}</span>
                      {task.timeline && (
                        <span style={{ fontSize: 10, color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: 3 }}>
                          <Clock size={9}/> {task.timeline}
                        </span>
                      )}
                      <span style={{ fontSize: 10, color: 'var(--text3)' }}>· {task.startupName} · {task.branch}</span>
                    </div>
                  </div>

                  {open ? <ChevronUp size={14} color="var(--text3)"/> : <ChevronDown size={14} color="var(--text3)"/>}
                </div>

                {/* Expanded content */}
                {open && (
                  <div style={{ padding: '0 16px 16px', borderTop: '1px solid var(--border)', paddingTop: 14 }}>
                    {/* Description — only what they need */}
                    {task.description && (
                      <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.6, marginBottom: 14 }}>
                        {task.description}
                      </div>
                    )}

                    {/* Update status */}
                    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: 140 }}>
                        <div className="field-label">Update Status</div>
                        <select
                          value={task.status}
                          onChange={e => changeStatus(task.id, e.target.value)}
                          disabled={saving === task.id}>
                          {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                        </select>
                      </div>

                      {task.status !== 'Done' && (
                        <div style={{ flex: 2, minWidth: 200 }}>
                          <div className="field-label">Note (optional)</div>
                          <input
                            value={note[task.id] || ''}
                            onChange={e => setNote(p => ({ ...p, [task.id]: e.target.value }))}
                            placeholder="Add a completion note…"
                          />
                        </div>
                      )}

                      {saving === task.id && (
                        <div style={{ color: 'var(--text3)', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4, paddingBottom: 8 }}>
                          <Loader size={12} style={{ animation: 'spinSlow 1s linear infinite' }}/> Saving…
                        </div>
                      )}
                    </div>

                    {task.completionNote && (
                      <div style={{ marginTop: 10, fontSize: 11, color: 'var(--green)', padding: '6px 10px', background: 'var(--green-bg)', borderRadius: 'var(--r)', border: '1px solid var(--green-border)' }}>
                        ✓ {task.completionNote}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
};

export default MemberDashboard;
