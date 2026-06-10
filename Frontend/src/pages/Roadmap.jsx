import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useStartup } from '../context/StartupContext';
import { useToast } from '../context/ToastContext';
import DashboardLayout from '../layouts/DashboardLayout';
import {
  Sparkles, X, Clock, CheckCircle2, Flag, Maximize2, Minimize2,
  Trash2, Plus, Compass, Lock, User, ChevronRight, Circle,
  Edit2, Check, Users, Shield, Crown
} from 'lucide-react';

// ── Role meta ─────────────────────────────────────────────────────────────────
const ROLE_META = {
  Founder:   { color: '#a78bfa', bg: 'rgba(124,58,237,0.15)', icon: Crown },
  CTO:       { color: '#06b6d4', bg: 'rgba(6,182,212,0.12)',  icon: Shield },
  Developer: { color: '#10b981', bg: 'rgba(16,185,129,0.12)', icon: Shield },
  Designer:  { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', icon: User },
  Marketing: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)',  icon: User },
  default:   { color: 'var(--text2)', bg: 'var(--surface3)',  icon: User },
};
const roleMeta = (role) => ROLE_META[role] || ROLE_META.default;

const priorityColor = (p) =>
  p === 'High' ? 'var(--red)' : p === 'Medium' ? 'var(--amber)' : 'var(--text3)';

// ── Connector line ─────────────────────────────────────────────────────────────
const Line = ({ vertical, length = 32, dashed, active }) => (
  <div style={{
    [vertical ? 'height' : 'width']: length,
    [vertical ? 'width' : 'height']: 2,
    flexShrink: 0,
    background: dashed 
      ? 'none' 
      : active 
      ? 'linear-gradient(90deg, var(--brand), var(--brand-light))' 
      : 'var(--border2)',
    borderTop: !vertical && dashed 
      ? `2px dashed ${active ? 'var(--brand)' : 'var(--border2)'}` 
      : undefined,
    borderLeft: vertical && dashed 
      ? `2px dashed ${active ? 'var(--brand)' : 'var(--border2)'}` 
      : undefined,
    boxShadow: active 
      ? '0 0 8px var(--brand)' 
      : 'none',
    opacity: active ? 1 : 0.8,
    transition: 'all 0.3s ease',
  }} />
);

// ── Root Node ─────────────────────────────────────────────────────────────────
const RootNode = ({ title, domain, onClick }) => (
  <div onClick={onClick} style={{
    padding: '14px 18px', borderRadius: 12, cursor: 'pointer', flexShrink: 0,
    background: 'linear-gradient(135deg, var(--surface3), var(--brand-bg))',
    border: '1.5px solid var(--brand-border)',
    boxShadow: 'var(--brand-glow)',
    minWidth: 180, maxWidth: 200,
    transition: 'box-shadow 0.2s, border-color 0.2s',
  }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand)'; e.currentTarget.style.boxShadow = '0 0 32px rgba(124,58,237,0.5)'; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--brand-border)'; e.currentTarget.style.boxShadow = 'var(--brand-glow)'; }}>
    <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--brand-light)', marginBottom: 4 }}>Startup</div>
    <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text1)', lineHeight: 1.3 }}>{title}</div>
    {domain && <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 3 }}>{domain}</div>}
  </div>
);

// ── Branch Node ───────────────────────────────────────────────────────────────
const BranchNode = ({ branch, active, onClick }) => {
  const done  = branch.tasks?.filter(t => t.completed || t.status === 'Done').length || 0;
  const total = branch.tasks?.length || 0;
  const pct   = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <div onClick={onClick} style={{
      padding: '12px 14px', borderRadius: 10, cursor: 'pointer', minWidth: 170, maxWidth: 190, flexShrink: 0,
      background: active ? 'var(--brand-bg)' : 'var(--surface)',
      border: `1.5px solid ${active ? 'var(--brand)' : 'var(--border2)'}`,
      boxShadow: active ? 'var(--brand-glow)' : 'none',
      transition: 'all 0.15s',
    }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = 'var(--brand-border)'; e.currentTarget.style.background = 'var(--surface2)'; } }}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.background = 'var(--surface)'; } }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: active ? 'var(--brand)' : 'var(--text3)', boxShadow: active ? '0 0 6px var(--brand)' : 'none', flexShrink: 0 }} />
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text1)', lineHeight: 1.3 }}>
          {branch.branch?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
        </span>
      </div>
      {branch.summary && (
        <div style={{ fontSize: 10, color: 'var(--text3)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: 5 }}>
          {branch.summary}
        </div>
      )}
      {total > 0 && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'var(--text3)', marginBottom: 3 }}>
            <span>{done}/{total} tasks</span>
            <span style={{ color: active ? 'var(--brand-light)' : 'var(--text3)', fontFamily: 'monospace' }}>{pct}%</span>
          </div>
          <div style={{ height: 3, borderRadius: 99, background: 'var(--surface3)', overflow: 'hidden' }}>
            <div style={{ width: `${pct}%`, height: '100%', background: active ? 'var(--brand)' : 'var(--text3)', borderRadius: 99, transition: 'width 0.5s' }} />
          </div>
        </>
      )}
    </div>
  );
};

// ── Phase Node ────────────────────────────────────────────────────────────────
const PhaseNode = ({ name, goal, taskCount, onClick }) => (
  <div onClick={onClick} style={{
    padding: '8px 12px', borderRadius: 8, cursor: 'pointer', minWidth: 150, maxWidth: 180, flexShrink: 0,
    background: 'var(--surface2)', border: '1px solid var(--brand-border)',
    transition: 'all 0.15s',
  }}
    onMouseEnter={e => { e.currentTarget.style.background = 'var(--brand-bg)'; e.currentTarget.style.borderColor = 'var(--brand)'; }}
    onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface2)'; e.currentTarget.style.borderColor = 'var(--brand-border)'; }}>
    <div style={{ fontSize: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--brand-light)', marginBottom: 3 }}>Phase</div>
    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text1)' }}>{name}</div>
    {goal && <div style={{ fontSize: 9, color: 'var(--text3)', marginTop: 2, lineHeight: 1.4 }}>{goal}</div>}
    <div style={{ marginTop: 4, fontSize: 9, color: 'var(--text3)' }}>{taskCount} task{taskCount !== 1 ? 's' : ''}</div>
  </div>
);

// ── Task Node ─────────────────────────────────────────────────────────────────
const TaskNode = ({ task, isFounder, onClick, onEdit }) => {
  const isMilestone = task.milestone === true;
  const isBlocked   = task.depStatus === 'Blocked' || task.status === 'Blocked';
  const isDone      = task.completed || task.status === 'Done';
  const isInProgress = task.depStatus === 'In Progress' || task.status === 'In Progress';
  const pc          = priorityColor(task.priority);
  const rm          = roleMeta(task.assigneeRole || task.assignedTo);

  // Border and status colors matching styling guidelines
  const borderColor = isMilestone 
    ? 'var(--amber-border)' 
    : isDone 
    ? 'rgba(16, 185, 129, 0.4)' 
    : isBlocked 
    ? 'rgba(239, 68, 68, 0.4)' 
    : isInProgress 
    ? 'rgba(124, 93, 249, 0.4)' 
    : 'var(--border2)';

  const borderHoverColor = isMilestone 
    ? 'var(--amber)' 
    : isDone 
    ? 'var(--green)' 
    : isBlocked 
    ? 'var(--red)' 
    : 'var(--brand)';

  return (
    <div style={{
      padding: '10px 12px', borderRadius: isMilestone ? 10 : 8, cursor: 'pointer', flexShrink: 0,
      minWidth: 170, maxWidth: 196,
      background: isMilestone ? 'var(--amber-bg)' : 'var(--surface)',
      border: `1.5px solid ${borderColor}`,
      boxShadow: isMilestone ? '0 0 12px var(--amber-bg)' : isDone ? '0 2px 8px rgba(16, 185, 129, 0.05)' : 'none',
      transition: 'all 0.15s',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
    }}
      onClick={onClick}
      onMouseEnter={e => { e.currentTarget.style.borderColor = borderHoverColor; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = borderColor; }}>

      {/* top row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        {isMilestone ? <Flag size={10} style={{ color: 'var(--amber)', flexShrink: 0 }} /> :
         isDone      ? <CheckCircle2 size={10} style={{ color: 'var(--green)', flexShrink: 0 }} /> :
         isBlocked   ? <Lock size={10} style={{ color: 'var(--red)', flexShrink: 0 }} /> :
         <Circle size={9} style={{ color: 'var(--text3)', flexShrink: 0 }} />}
         
        {/* Priority text */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: pc, flexShrink: 0 }} />
          <span style={{ fontSize: 8, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase' }}>{task.priority || 'Low'}</span>
        </div>

        {isFounder && (
          <button onClick={e => { e.stopPropagation(); onEdit(); }} style={{
            marginLeft: 'auto',
            width: 20, height: 20, borderRadius: 5, background: 'var(--surface3)',
            border: '1px solid var(--border2)', color: 'var(--text3)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            transition: 'color 0.15s, background 0.15s'
          }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text1)'; e.currentTarget.style.background = 'var(--surface2)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text3)'; e.currentTarget.style.background = 'var(--surface3)'; }}>
            <Edit2 size={10} />
          </button>
        )}
      </div>

      {/* Task title */}
      <div style={{
        fontSize: 11, fontWeight: 600, lineHeight: 1.35,
        color: isDone ? 'var(--text3)' : 'var(--text1)',
        textDecoration: isDone ? 'line-through' : 'none',
      }}>
        {task.title || task.text}
      </div>

      {/* Assignee Badge */}
      {task.assignedTo && task.assignedTo !== 'Unassigned' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{
            fontSize: 9, fontWeight: 600, whiteSpace: 'nowrap',
            color: rm.color, background: rm.bg,
            border: `1px solid ${rm.color}30`, borderRadius: 99, padding: '1px 6px',
            display: 'inline-flex', alignItems: 'center', gap: 3
          }}>
            <User size={8} /> {task.assignedTo.split(' ')[0]} {task.assigneeRole && `(${task.assigneeRole})`}
          </span>
        </div>
      )}

      {/* Metadata footer */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6, borderTop: '1px dashed var(--border)', paddingTop: 5, marginTop: 2 }}>
        {task.timeline && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 9, color: 'var(--text3)' }}>
            <Clock size={8} /> {task.timeline}
          </div>
        )}
        {task.complexity && task.complexity !== 'Low' && (
          <span style={{ fontSize: 8, color: 'var(--text2)', background: 'var(--surface2)', padding: '1px 4px', borderRadius: 4, border: '1px solid var(--border)' }}>
            {task.complexity}
          </span>
        )}
        {task.costImpact && task.costImpact !== 'None' && (
          <span style={{ fontSize: 8, color: 'var(--amber)', background: 'var(--amber-bg)', padding: '1px 4px', borderRadius: 4, border: '1px solid var(--amber-border)' }}>
            $ {task.costImpact}
          </span>
        )}
      </div>
    </div>
  );
};

// ── Milestone Diamond ─────────────────────────────────────────────────────────
const MilestoneDiamond = ({ title, onClick }) => (
  <div onClick={onClick} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer', flexShrink: 0 }}>
    <div style={{
      width: 40, height: 40, background: 'var(--amber-bg)', border: '2px solid var(--amber)',
      transform: 'rotate(45deg)', borderRadius: 5,
      boxShadow: '0 0 16px var(--amber-bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'all 0.2s',
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 28px var(--amber-border)'; e.currentTarget.style.transform = 'rotate(45deg) scale(1.15)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 16px var(--amber-bg)'; e.currentTarget.style.transform = 'rotate(45deg)'; }}>
      <Flag size={12} style={{ color: 'var(--amber)', transform: 'rotate(-45deg)' }} />
    </div>
    {title && <div style={{ fontSize: 8, fontWeight: 700, color: 'var(--amber)', maxWidth: 80, textAlign: 'center', lineHeight: 1.3 }}>{title}</div>}
  </div>
);

// ── Task Edit Modal ───────────────────────────────────────────────────────────
const TaskEditModal = ({ task, members, onSave, onDelete, onClose, isFounder }) => {
  const [form, setForm] = useState({
    title:       task.title || task.text || '',
    timeline:    task.timeline || '',
    priority:    task.priority || 'Medium',
    assignedTo:  task.assignedTo || 'Unassigned',
    description: task.description || '',
    complexity:  task.complexity || 'Low',
    costImpact:  task.costImpact || 'None',
    depStatus:   task.depStatus || task.status || 'Ready',
  });
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }} onClick={onClose}>
      <div style={{ width: '100%', maxWidth: 440, background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 16, overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }} onClick={e => e.stopPropagation()} className="animate-scale-in">
        <div style={{ padding: '16px 18px 12px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text1)' }}>Edit Task Details</div>
          <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--surface3)', border: '1px solid var(--border2)', color: 'var(--text3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={13} /></button>
        </div>
        <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <div className="field-label">Task Title</div>
            <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Task title…" />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <div className="field-label">Priority</div>
              <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}>
                {['High', 'Medium', 'Low'].map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <div className="field-label">Timeline</div>
              <input value={form.timeline} onChange={e => setForm(p => ({ ...p, timeline: e.target.value }))} placeholder="e.g. Week 1–2" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            <div>
              <div className="field-label">Complexity</div>
              <select value={form.complexity} onChange={e => setForm(p => ({ ...p, complexity: e.target.value }))}>
                {['Low', 'Medium', 'High'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <div className="field-label">Cost Impact</div>
              <select value={form.costImpact} onChange={e => setForm(p => ({ ...p, costImpact: e.target.value }))}>
                {['None', 'Low', 'Medium', 'High'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <div className="field-label">Status</div>
              <select value={form.depStatus} onChange={e => setForm(p => ({ ...p, depStatus: e.target.value }))}>
                {['Ready', 'In Progress', 'Done', 'Blocked'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div>
            <div className="field-label">Assign To</div>
            <select value={form.assignedTo} onChange={e => setForm(p => ({ ...p, assignedTo: e.target.value }))}>
              <option value="Unassigned">Unassigned</option>
              {members.map(m => <option key={m.name} value={m.name}>{m.name} ({m.role})</option>)}
            </select>
          </div>
          
          <div>
            <div className="field-label">Description</div>
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} placeholder="Task details…" style={{ resize: 'vertical' }} />
          </div>
        </div>
        <div style={{ padding: '10px 18px 14px', display: 'flex', gap: 8 }}>
          {isFounder && (
            <button
              onClick={() => { if (window.confirm("Are you sure you want to delete this task?")) { onDelete(); } }}
              className="btn btn-outline"
              style={{ borderColor: 'var(--red)', color: 'var(--red)', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
              <Trash2 size={13} /> Delete
            </button>
          )}
          <button onClick={onClose} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
          <button onClick={() => { onSave(form); onClose(); }} className="btn btn-primary" style={{ flex: 1 }}>
            <Check size={13} /> Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Node Detail Drawer ────────────────────────────────────────────────────────
const NodeDrawer = ({ node, onClose }) => {
  if (!node) return null;
  const rm = node.assigneeRole ? roleMeta(node.assigneeRole) : null;
  return (
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: 90 }} onClick={onClose} />
      <div style={{
        position: 'fixed', top: 0, right: 0, width: 360, height: '100vh', zIndex: 100,
        background: 'var(--surface)', borderLeft: '1px solid var(--border2)',
        boxShadow: 'var(--shadow-lg)',
        display: 'flex', flexDirection: 'column',
        animation: 'slideIn 0.22s cubic-bezier(0.16,1,0.3,1) both',
      }}>
        <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--brand-light)', marginBottom: 4 }}>
                {node.type === 'branch' ? 'Branch' : node.milestone ? '★ Milestone' : node.type === 'phase' ? 'Phase' : 'Task'}
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text1)', lineHeight: 1.3, maxWidth: 280 }}>{node.title || node.name}</div>
            </div>
            <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--surface3)', border: '1px solid var(--border2)', color: 'var(--text3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={13} />
            </button>
          </div>
          {node.phase && (
            <div style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, padding: '2px 8px', borderRadius: 99, background: 'var(--brand-bg)', border: '1px solid var(--brand-border)', color: 'var(--brand-light)', fontWeight: 600 }}>
              Phase: {node.phase}
            </div>
          )}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {(node.description || node.summary) && (
            <div style={{ padding: '12px 14px', background: 'var(--brand-bg)', border: '1px solid var(--brand-border)', borderRadius: 10, borderLeft: '3px solid var(--brand)' }}>
              <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--brand-light)', marginBottom: 6 }}>Description</div>
              <p style={{ fontSize: 12.5, color: 'var(--text1)', lineHeight: 1.7, margin: 0 }}>{node.description || node.summary}</p>
            </div>
          )}

          {/* Metadata grid */}
          {(node.priority || node.timeline || node.assignedTo || node.depStatus || node.complexity) && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                node.priority    && { label: 'Priority',   val: node.priority,                  color: priorityColor(node.priority) },
                node.timeline    && { label: 'Timeline',   val: node.timeline,                   color: 'var(--cyan)' },
                node.assignedTo  && { label: 'Assigned',   val: node.assignedTo || 'Unassigned', color: rm?.color || 'var(--brand-light)' },
                node.depStatus   && { label: 'Status',     val: node.depStatus,                  color: node.depStatus === 'Blocked' ? 'var(--red)' : 'var(--green)' },
                node.complexity  && { label: 'Complexity', val: node.complexity,                 color: 'var(--text2)' },
                (node.costImpact || node.cost_impact) && { label: 'Cost', val: node.costImpact || node.cost_impact, color: 'var(--amber)' },
              ].filter(Boolean).map(({ label, val, color: c }) => (
                <div key={label} style={{ padding: '10px 12px', background: 'var(--surface2)', borderRadius: 8, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text3)', marginBottom: 3 }}>{label}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: c }}>{val}</div>
                </div>
              ))}
            </div>
          )}

          {/* Branch task list */}
          {node.type === 'branch' && node.tasks?.length > 0 && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text3)', marginBottom: 10 }}>
                Tasks ({node.tasks.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {node.tasks.map((t, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 10px', background: 'var(--surface2)', borderRadius: 8, border: '1px solid var(--border)' }}>
                    {t.milestone ? <Flag size={10} style={{ color: 'var(--amber)', flexShrink: 0, marginTop: 1 }} /> :
                     t.completed ? <CheckCircle2 size={10} style={{ color: 'var(--green)', flexShrink: 0, marginTop: 1 }} /> :
                     <Circle size={9} style={{ color: 'var(--text3)', flexShrink: 0, marginTop: 2 }} />}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text1)', marginBottom: 2, lineHeight: 1.3 }}>{t.title || t.text}</div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {t.phase && <span style={{ fontSize: 9, color: 'var(--brand-light)', background: 'var(--brand-bg)', borderRadius: 99, padding: '1px 6px', border: '1px solid var(--brand-border)' }}>{t.phase}</span>}
                        {t.timeline && <span style={{ fontSize: 9, color: 'var(--text3)' }}>{t.timeline}</span>}
                      </div>
                    </div>
                    {t.priority && <div style={{ width: 5, height: 5, borderRadius: '50%', background: priorityColor(t.priority), flexShrink: 0, marginTop: 3 }} />}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// ── Org Members Panel ─────────────────────────────────────────────────────────
const MembersPanel = ({ members, allTasks, orgName, orgInviteCode }) => {
  const [copied, setCopied] = useState(false);
  if (!members.length) return null;

  const handleCopy = () => {
    if (orgInviteCode) {
      navigator.clipboard.writeText(orgInviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 14, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Users size={14} style={{ color: 'var(--brand-light)' }} />
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text1)' }}>
            {orgName ? `${orgName} Team` : 'Team'}
          </div>
          <span style={{ fontSize: 10, color: 'var(--text3)' }}>({members.length} members)</span>
        </div>
        {orgInviteCode && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, background: 'var(--surface2)', padding: '4px 8px', borderRadius: 6, border: '1px solid var(--border2)' }}>
            <span style={{ color: 'var(--text3)' }}>Invite Code:</span>
            <span style={{ color: 'var(--brand-light)', fontWeight: 700, fontFamily: 'monospace' }}>{orgInviteCode}</span>
            <button 
              onClick={handleCopy}
              style={{
                background: 'none', border: 'none', color: copied ? 'var(--green)' : 'var(--text2)',
                fontSize: 10, cursor: 'pointer', fontWeight: 600, padding: '2px 6px',
                borderRadius: 4, background: 'var(--surface3)', display: 'inline-flex', alignItems: 'center'
              }}
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        )}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {members.map((m, i) => {
          const rm = roleMeta(m.role);
          const RoleIcon = rm.icon;
          const assigned = allTasks.filter(t => t.assignedTo === m.name || t.assigned_to === m.name);
          const done = assigned.filter(t => t.completed || t.status === 'Done').length;
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
              background: rm.bg, border: `1px solid ${rm.color}30`,
              borderRadius: 10, minWidth: 160,
            }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: rm.bg, border: `1.5px solid ${rm.color}60`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <RoleIcon size={12} style={{ color: rm.color }} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text1)', lineHeight: 1.2 }}>{m.name}</div>
                <div style={{ fontSize: 10, color: rm.color, fontWeight: 600 }}>{m.role}</div>
              </div>
              {assigned.length > 0 && (
                <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text1)', fontFamily: 'monospace' }}>{done}/{assigned.length}</div>
                  <div style={{ fontSize: 9, color: 'var(--text3)' }}>tasks</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Railway Canvas ────────────────────────────────────────────────────────────
const RailwayCanvas = ({ roadmapData, startupName, isFounder, members, onNodeClick, onTaskEdit }) => {
  const [activeBranch, setActiveBranch] = useState(null);

  const branches = roadmapData?.branch_roadmaps || roadmapData?.branches || [];
  const synced   = roadmapData?.synced_tasks || [];

  const displayBranch = activeBranch !== null ? branches[activeBranch] : null;
  const branchTasks   = displayBranch
    ? (synced.filter(t => t.branch === displayBranch.branch).length > 0
        ? synced.filter(t => t.branch === displayBranch.branch)
        : (displayBranch.tasks || []))
    : [];

  // Group tasks by phase
  const phaseMap = {};
  branchTasks.forEach(t => {
    const ph = t.phase || 'Main';
    if (!phaseMap[ph]) phaseMap[ph] = { name: ph, goal: t.phase_goal || '', tasks: [] };
    phaseMap[ph].tasks.push(t);
  });
  const phases = Object.values(phaseMap);

  return (
    <div style={{ 
      background: 'radial-gradient(circle at 20% 20%, rgba(20,20,35,0.9) 0%, rgba(10,10,16,0.99) 100%), radial-gradient(rgba(255,255,255,0.02) 1px, transparent 1px) 20px 20px', 
      backgroundSize: 'auto, 20px 20px',
      borderRadius: 16, 
      border: '1px solid var(--border2)', 
      overflow: 'hidden',
      position: 'relative'
    }}>

      {/* Level 1 — Root → Branches */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', overflowX: 'auto', position: 'relative', zIndex: 2 }}>
        <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text3)', marginBottom: 16 }}>
          Roadmap Pipeline
        </div>
        <div style={{ display: 'flex', alignItems: 'center', minWidth: 'max-content' }}>
          <RootNode
            title={startupName || roadmapData?.startup_name || 'Startup'}
            domain={roadmapData?.profiler_output?.business_type}
            onClick={() => onNodeClick({ type: 'root', title: startupName, description: roadmapData?.profiler_output?.reasoning })}
          />
          <Line length={32} active={activeBranch !== null} />

          {/* Branches stacked vertically */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {branches.map((branch, i) => {
              const isFirst = i === 0;
              const isLast  = i === branches.length - 1;
              const active  = activeBranch === i;
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                  {/* T-junction connector */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 20, alignSelf: 'stretch' }}>
                    <div style={{ width: 2, flex: isFirst ? '0 0 50%' : 1, background: isFirst ? 'transparent' : 'var(--border2)' }} />
                    <div style={{ 
                      width: 14, 
                      height: 2, 
                      background: active ? 'linear-gradient(90deg, var(--brand), var(--brand-light))' : 'var(--border2)',
                      boxShadow: active ? '0 0 8px var(--brand)' : 'none',
                      transition: 'all 0.3s ease'
                    }} />
                    <div style={{ width: 2, flex: isLast ? '0 0 50%' : 1, background: isLast ? 'transparent' : 'var(--border2)' }} />
                  </div>

                  <div style={{ padding: '10px 0', display: 'flex', alignItems: 'center', gap: 0 }}>
                    <BranchNode
                      branch={branch}
                      active={active}
                      onClick={() => {
                        setActiveBranch(active ? null : i);
                        onNodeClick({ ...branch, type: 'branch', title: branch.branch });
                      }}
                    />
                    {active && (
                      <>
                        <Line length={16} dashed active />
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--brand)', boxShadow: '0 0 8px var(--brand)' }} />
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Level 2 — Phases (when branch selected) */}
      {activeBranch !== null && phases.length > 0 && (
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', overflowX: 'auto', background: 'rgba(10, 10, 16, 0.4)', backdropFilter: 'blur(2px)', position: 'relative', zIndex: 2 }}>
          <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text3)', marginBottom: 14 }}>
            {branches[activeBranch]?.branch?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} — Phases
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', minWidth: 'max-content', gap: 0 }}>
            {phases.map((phase, pIdx) => (
              <React.Fragment key={pIdx}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <PhaseNode
                    name={phase.name}
                    goal={phase.goal}
                    taskCount={phase.tasks.length}
                    onClick={() => onNodeClick({ type: 'phase', title: phase.name, description: phase.goal })}
                  />
                  {/* Tasks under phase */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
                    {phase.tasks.map((task, tIdx) => (
                      <React.Fragment key={tIdx}>
                        <Line vertical length={10} active />
                        {task.milestone
                          ? <MilestoneDiamond title={task.title} onClick={() => onNodeClick({ ...task, type: 'milestone' })} />
                          : <TaskNode
                              task={task}
                              isFounder={isFounder}
                              onClick={() => onNodeClick({ ...task, type: 'task' })}
                              onEdit={() => onTaskEdit(task)}
                            />
                        }
                      </React.Fragment>
                    ))}
                  </div>
                </div>
                {pIdx < phases.length - 1 && (
                  <div style={{ display: 'flex', alignItems: 'center', paddingBottom: 36 }}>
                    <Line length={32} active />
                    <ChevronRight size={12} style={{ color: 'var(--brand-light)', filter: 'drop-shadow(0 0 4px var(--brand))', flexShrink: 0 }} />
                    <Line length={8} active />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {activeBranch === null && branches.length > 0 && (
        <div style={{ padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text3)', fontSize: 12, position: 'relative', zIndex: 2 }}>
          <ChevronRight size={14} /> Click any branch to expand phases and tasks
        </div>
      )}
    </div>
  );
};

// ── Team Setup Modal ──────────────────────────────────────────────────────────
const TeamModal = ({ onConfirm, onCancel, isGenerating, initialMembers = [] }) => {
  const [members, setMembers] = useState(() => {
    if (initialMembers && initialMembers.length > 0) {
      return initialMembers.map(m => ({
        name: m.name || '',
        role: m.role || '',
        skills: Array.isArray(m.skills) ? m.skills.join(', ') : (m.skills || ''),
      }));
    }
    return [{ name: '', role: '', skills: '' }];
  });
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 440, background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 16, overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }} className="animate-scale-in">
        <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text1)' }}>Team Setup</div>
            <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>Add members — AI assigns tasks by role & skill.</div>
          </div>
          <button onClick={onCancel} style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--surface3)', border: '1px solid var(--border2)', color: 'var(--text3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={13} />
          </button>
        </div>
        <div style={{ padding: '14px 20px', maxHeight: 300, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {members.map((m, i) => (
            <div key={i} style={{ background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: 10, padding: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--brand-light)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Member {i + 1}</span>
                {members.length > 1 && (
                  <button onClick={() => setMembers(ms => ms.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                <input value={m.name}   onChange={e => setMembers(ms => ms.map((x, j) => j === i ? { ...x, name: e.target.value }   : x))} placeholder="Full name *" />
                <input value={m.role}   onChange={e => setMembers(ms => ms.map((x, j) => j === i ? { ...x, role: e.target.value }   : x))} placeholder="Role (e.g. CTO)" />
              </div>
              <input value={m.skills} onChange={e => setMembers(ms => ms.map((x, j) => j === i ? { ...x, skills: e.target.value } : x))} placeholder="Skills: React, Python, Marketing…" />
            </div>
          ))}
          <button onClick={() => setMembers(ms => [...ms, { name: '', role: '', skills: '' }])}
            style={{ padding: 9, borderRadius: 8, border: '1px dashed var(--brand-border)', background: 'transparent', color: 'var(--brand-light)', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <Plus size={13} /> Add Member
          </button>
        </div>
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: '9px', borderRadius: 8, border: '1px solid var(--border2)', background: 'transparent', color: 'var(--text2)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
          <button
            onClick={() => onConfirm(members.filter(m => m.name.trim()).map(m => ({ name: m.name.trim(), role: m.role.trim() || 'Founder', skills: m.skills.split(',').map(s => s.trim()).filter(Boolean) })))}
            disabled={isGenerating}
            style={{ flex: 1, padding: '9px', borderRadius: 8, border: 'none', background: 'var(--brand)', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            {isGenerating
              ? <div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spinSlow 0.8s linear infinite' }} />
              : <><Sparkles size={13} /> Generate</>}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────────
const Roadmap = () => {
  const { user, startupDetails, roadmapData, isGeneratingRoadmap, generateRoadmap, allRoadmaps, manageSubTask, roadmapNodes } = useStartup();
  const { showToast } = useToast();

  const [showTeamModal, setShowTeamModal]   = useState(false);
  const [selectedNode,  setSelectedNode]    = useState(null);
  const [activeSession, setActiveSession]   = useState(null);
  const [fullscreen,    setFullscreen]      = useState(false);
  const [editingTask,   setEditingTask]     = useState(null);
  const [teamMembers,   setTeamMembers]     = useState([]); // persisted across generate calls
  const [orgInviteCode, setOrgInviteCode]   = useState(null);
  const [orgName, setOrgName]               = useState(null);

  useEffect(() => {
    if (user?.userId) {
      const fetchTeam = async () => {
        try {
          const { getMyOrganization } = await import('../services/startupApi');
          const orgData = await getMyOrganization(user.userId);
          if (orgData) {
            if (orgData.org) {
              setOrgInviteCode(orgData.org.invite_code);
              setOrgName(orgData.org.name);
            }
            if (orgData.members) {
              const mapped = orgData.members.map(m => ({
                id: m.id,
                name: m.full_name,
                role: m.job_title || m.role,
                skills: Array.isArray(m.skills) ? m.skills : [],
              }));
              setTeamMembers(mapped);
            }
          }
        } catch (err) {
          console.warn('Failed to load team members:', err);
        }
      };
      fetchTeam();
    }
  }, [user?.userId]);

  const isFounder = !user?.role || user?.role === 'Founder' || user?.role === 'founder';
  const displayData = activeSession || roadmapData;
  const branches = displayData?.branch_roadmaps || displayData?.branches || [];
  const synced   = displayData?.synced_tasks || [];

  const allTasks = branches.flatMap(b => {
    const bt = synced.filter(t => t.branch === b.branch);
    return bt.length > 0 ? bt : (b.tasks || []);
  });
  const done       = allTasks.filter(t => t.completed || t.status === 'Done').length;
  const pct        = allTasks.length > 0 ? Math.round((done / allTasks.length) * 100) : 0;
  const milestones = allTasks.filter(t => t.milestone).length;

  const handleGenerate = async (team) => {
    setTeamMembers(team);
    setShowTeamModal(false);
    await generateRoadmap(team);
  };

  const handleTaskEdit = (task) => {
    if (!isFounder) return;
    setEditingTask(task);
  };

  const handleTaskSave = (taskId, fields) => {
    // Update in roadmapNodes via context manageSubTask
    const branchNode = roadmapNodes.find(n => n.tasks?.some(t => t.id === taskId));
    if (branchNode) {
      // Find the member to see if their id needs to be linked
      const selectedMember = teamMembers.find(m => m.name === fields.assignedTo);
      const enrichedFields = {
        ...fields,
        assigned_member_id: selectedMember ? selectedMember.id : null,
        assignee_role: selectedMember ? selectedMember.role : 'Founder',
      };
      
      // Map status change to local completed flag
      if (fields.depStatus === 'Done') {
        enrichedFields.completed = true;
      } else if (fields.depStatus) {
        enrichedFields.completed = false;
      }

      manageSubTask(branchNode.id, 'updateField', { id: taskId, fields: enrichedFields });
      showToast('Task updated.', 'success');
    }
    setEditingTask(null);
  };

  const handleTaskDelete = (taskId, dbTaskId) => {
    const branchNode = roadmapNodes.find(n => n.tasks?.some(t => t.id === taskId));
    if (branchNode) {
      manageSubTask(branchNode.id, 'delete', { id: taskId, dbTaskId });
      showToast('Task deleted successfully.', 'info');
    }
    setEditingTask(null);
  };

  const loadPastRoadmap = async (sessionId) => {
    try {
      const { fetchSessionRoadmap } = await import('../services/startupApi');
      const data = await fetchSessionRoadmap(sessionId);
      if (data) { setActiveSession(data); showToast('Roadmap loaded.', 'success'); }
      else showToast('Could not load roadmap.', 'error');
    } catch { showToast('Failed to load roadmap.', 'error'); }
  };

  const canvasContent = (
    <>
      {/* Stats */}
      {displayData && branches.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 12 }}>
          {[
            { label: 'Branches',   val: branches.length, color: 'var(--brand-light)' },
            { label: 'Tasks',      val: allTasks.length,  color: 'var(--text1)' },
            { label: 'Milestones', val: milestones,        color: 'var(--amber)' },
            { label: 'Completed',  val: done,              color: 'var(--green)' },
            { label: 'Progress',   val: `${pct}%`,         color: 'var(--cyan)' },
          ].map(s => (
            <div key={s.label} style={{ padding: '12px 14px', background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 10 }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: s.color, fontFamily: 'monospace', letterSpacing: '-0.03em', lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: 9, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginTop: 3 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!displayData && !isGeneratingRoadmap && (
        <div style={{ textAlign: 'center', padding: '72px 24px', background: 'var(--bg-sub)', border: '1px dashed var(--border2)', borderRadius: 16 }} className="animate-fade-up">
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--brand-bg)', border: '1px solid var(--brand-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <Compass size={32} style={{ color: 'var(--brand-light)' }} />
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text1)', margin: '0 0 8px' }}>Generate Your Roadmap</h2>
          <p style={{ fontSize: 13, color: 'var(--text2)', margin: '0 0 28px', maxWidth: 380, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.7 }}>
            AI builds a phased execution plan with milestones and task assignments from your validation.
          </p>
          {isFounder && (
            <button onClick={() => { if (!user?.userId) { showToast('Please log in.', 'error'); return; } setShowTeamModal(true); }}
              style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: 'var(--brand)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, boxShadow: 'var(--shadow-brand)' }}>
              <Sparkles size={15} /> Generate Roadmap
            </button>
          )}
        </div>
      )}

      {/* Generating */}
      {isGeneratingRoadmap && (
        <div style={{ textAlign: 'center', padding: '72px 24px', background: 'var(--bg-sub)', border: '1px solid var(--border2)', borderRadius: 16 }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', border: '3px solid var(--brand)', borderTopColor: 'transparent', animation: 'spinSlow 1s linear infinite', margin: '0 auto 20px' }} />
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text1)', marginBottom: 6 }}>Building roadmap…</div>
          <div style={{ fontSize: 12, color: 'var(--text2)' }}>Generating phases, milestones, and task assignments.</div>
        </div>
      )}

      {/* Canvas */}
      {displayData && !isGeneratingRoadmap && (
        <RailwayCanvas
          roadmapData={displayData}
          startupName={startupDetails.startupName}
          isFounder={isFounder}
          members={teamMembers}
          onNodeClick={setSelectedNode}
          onTaskEdit={handleTaskEdit}
        />
      )}

      {/* Team members */}
      {teamMembers.length > 0 && displayData && (
        <MembersPanel 
          members={teamMembers} 
          allTasks={allTasks} 
          orgName={orgName} 
          orgInviteCode={orgInviteCode} 
        />
      )}
    </>
  );

  return (
    <DashboardLayout activeTab="roadmap">
      {showTeamModal && (
        <TeamModal 
          onConfirm={handleGenerate} 
          onCancel={() => setShowTeamModal(false)} 
          isGenerating={isGeneratingRoadmap} 
          initialMembers={teamMembers}
        />
      )}

      {editingTask && (
        <TaskEditModal
          task={editingTask}
          members={teamMembers}
          isFounder={isFounder}
          onSave={(fields) => handleTaskSave(editingTask.id || editingTask.task_id, fields)}
          onDelete={() => handleTaskDelete(editingTask.id || editingTask.task_id, editingTask.dbTaskId)}
          onClose={() => setEditingTask(null)}
        />
      )}

      {/* Fullscreen overlay */}
      {fullscreen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 150, background: 'var(--bg)', overflowY: 'auto', padding: '24px 32px' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
            <button onClick={() => setFullscreen(false)} className="btn btn-outline btn-sm">
              <Minimize2 size={13} /> Exit Fullscreen
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {canvasContent}
          </div>
          {selectedNode && <NodeDrawer node={selectedNode} onClose={() => setSelectedNode(null)} />}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--brand-light)', marginBottom: 4 }}>Execution OS</div>
            <h1 style={{ fontSize: 22, fontWeight: 900, color: 'var(--text1)', letterSpacing: '-0.02em', margin: '0 0 2px' }}>
              {startupDetails.startupName || 'Venture'} Roadmap
            </h1>
            <p style={{ fontSize: 12, color: 'var(--text2)', margin: 0 }}>
              {isFounder ? 'Click branches to expand phases. Click tasks to view & edit.' : 'Your assigned tasks are shown below each branch.'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {allRoadmaps?.length > 1 && (
              <select onChange={e => { if (e.target.value) loadPastRoadmap(e.target.value); }} style={{ fontSize: 12, maxWidth: 200 }} defaultValue="">
                <option value="" disabled>Load past roadmap…</option>
                {allRoadmaps.map(r => (
                  <option key={r.session_id} value={r.session_id}>
                    {r.startup_name} — {new Date(r.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  </option>
                ))}
              </select>
            )}
            {displayData && (
              <button onClick={() => setFullscreen(true)} className="btn btn-outline btn-sm">
                <Maximize2 size={13} /> Fullscreen
              </button>
            )}
            {isFounder && (
              <button
                onClick={() => { if (!user?.userId) { showToast('Please log in.', 'error'); return; } setShowTeamModal(true); }}
                disabled={isGeneratingRoadmap}
                className="btn btn-primary btn-sm">
                {isGeneratingRoadmap
                  ? <><div style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spinSlow 0.8s linear infinite' }} /> Generating…</>
                  : <><Sparkles size={13} /> {displayData ? 'Regenerate' : 'Generate Roadmap'}</>
                }
              </button>
            )}
          </div>
        </div>

        {canvasContent}
      </div>

      {selectedNode && !fullscreen && <NodeDrawer node={selectedNode} onClose={() => setSelectedNode(null)} />}
    </DashboardLayout>
  );
};

export default Roadmap;
