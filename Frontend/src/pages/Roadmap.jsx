import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStartup } from '../context/StartupContext';
import { useToast } from '../context/ToastContext';
import DashboardLayout from '../layouts/DashboardLayout';
import {
  Sparkles, X, Clock, CheckCircle2, Flag, Maximize2, Minimize2,
  Trash2, Plus, Compass, AlertTriangle, Lock, User, ChevronRight,
  BarChart2, Circle, ZapIcon
} from 'lucide-react';

// ── color helpers ─────────────────────────────────────────────────────────────
const STATUS = {
  Completed:    { color: '#10b981', dim: '#064e3b', dot: '#10b981' },
  'In Progress':{ color: '#8b5cf6', dim: '#2e1065', dot: '#8b5cf6' },
  Blocked:      { color: '#ef4444', dim: '#450a0a', dot: '#ef4444' },
  Pending:      { color: '#52525b', dim: '#18181b', dot: '#52525b' },
  Success:      { color: '#10b981', dim: '#064e3b', dot: '#10b981' },
};
const st = (s) => STATUS[s] || STATUS.Pending;
const priorityColor = (p) => p === 'High' ? '#ef4444' : p === 'Medium' ? '#f59e0b' : '#71717a';

// ── Railway-style connector line ──────────────────────────────────────────────
const Connector = ({ vertical = false, color = '#3f3f46', dashed = false, length = 40 }) => (
  <div style={{
    [vertical ? 'height' : 'width']: length,
    [vertical ? 'width' : 'height']: 2,
    background: dashed ? 'none' : color,
    borderTop: dashed && !vertical ? `2px dashed ${color}` : 'none',
    borderLeft: dashed && vertical ? `2px dashed ${color}` : 'none',
    flexShrink: 0,
    opacity: 0.7,
  }} />
);

// ── Node: Root ────────────────────────────────────────────────────────────────
const RootNode = ({ title, domain, score, onClick }) => (
  <div onClick={onClick} style={{
    display: 'flex', flexDirection: 'column', gap: 4,
    padding: '14px 18px', borderRadius: 12, cursor: 'pointer',
    background: 'linear-gradient(135deg, #1c1040, #0f0a2e)',
    border: '1.5px solid #7c3aed60',
    boxShadow: '0 0 24px rgba(124,58,237,0.25)',
    minWidth: 180, maxWidth: 200, flexShrink: 0,
    transition: 'all 0.2s',
  }}
    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 36px rgba(124,58,237,0.45)'; e.currentTarget.style.borderColor = '#7c3aed'; }}
    onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 24px rgba(124,58,237,0.25)'; e.currentTarget.style.borderColor = '#7c3aed60'; }}>
    <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#a78bfa', marginBottom: 2 }}>Startup</div>
    <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', lineHeight: 1.3 }}>{title}</div>
    {domain && <div style={{ fontSize: 10, color: '#a78bfa80' }}>{domain}</div>}
    {score && (
      <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
        <div style={{ flex: 1, height: 3, borderRadius: 99, background: '#ffffff15', overflow: 'hidden' }}>
          <div style={{ width: `${score}%`, height: '100%', background: 'linear-gradient(90deg, #7c3aed, #a78bfa)', borderRadius: 99 }} />
        </div>
        <span style={{ fontSize: 9, color: '#a78bfa', fontWeight: 700, fontFamily: 'monospace' }}>{score}</span>
      </div>
    )}
  </div>
);

// ── Node: Branch ──────────────────────────────────────────────────────────────
const BranchNode = ({ branch, onClick, active }) => {
  const done  = branch.tasks?.filter(t => t.completed).length || 0;
  const total = branch.tasks?.length || 0;
  const pct   = total > 0 ? Math.round((done / total) * 100) : 0;
  const meta  = st(branch.status === 'success' ? 'In Progress' : 'Pending');
  return (
    <div onClick={onClick} style={{
      padding: '12px 14px', borderRadius: 10, cursor: 'pointer',
      background: active ? meta.dim + '80' : '#18181b',
      border: `1.5px solid ${active ? meta.color + '80' : '#3f3f46'}`,
      minWidth: 170, maxWidth: 190, flexShrink: 0,
      transition: 'all 0.15s',
      boxShadow: active ? `0 0 16px ${meta.color}30` : 'none',
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = meta.color + '60'; e.currentTarget.style.background = meta.dim + '50'; }}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = '#3f3f46'; e.currentTarget.style.background = '#18181b'; } }}>
      {/* Dot + name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: meta.dot, boxShadow: `0 0 6px ${meta.dot}`, flexShrink: 0 }} />
        <span style={{ fontSize: 11, fontWeight: 700, color: '#e4e4e7', lineHeight: 1.3 }}>
          {branch.branch.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
        </span>
      </div>
      {branch.summary && (
        <div style={{ fontSize: 10, color: '#71717a', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: 6 }}>
          {branch.summary}
        </div>
      )}
      {total > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#52525b', marginBottom: 3 }}>
            <span>{done}/{total} tasks</span>
            <span style={{ color: meta.dot, fontFamily: 'monospace' }}>{pct}%</span>
          </div>
          <div style={{ height: 3, borderRadius: 99, background: '#27272a', overflow: 'hidden' }}>
            <div style={{ width: `${pct}%`, height: '100%', background: meta.dot, borderRadius: 99, transition: 'width 0.5s' }} />
          </div>
        </div>
      )}
    </div>
  );
};

// ── Node: Phase header ────────────────────────────────────────────────────────
const PhaseNode = ({ name, goal, taskCount, onClick }) => (
  <div onClick={onClick} style={{
    padding: '8px 12px', borderRadius: 8, cursor: 'pointer',
    background: '#1c1917', border: '1px solid #7c3aed30',
    minWidth: 150, maxWidth: 180, flexShrink: 0,
    transition: 'all 0.15s',
  }}
    onMouseEnter={e => { e.currentTarget.style.background = '#1c1040'; e.currentTarget.style.borderColor = '#7c3aed60'; }}
    onMouseLeave={e => { e.currentTarget.style.background = '#1c1917'; e.currentTarget.style.borderColor = '#7c3aed30'; }}>
    <div style={{ fontSize: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#a78bfa', marginBottom: 3 }}>Phase</div>
    <div style={{ fontSize: 11, fontWeight: 700, color: '#d4d4d8' }}>{name}</div>
    {goal && <div style={{ fontSize: 9, color: '#52525b', marginTop: 2, lineHeight: 1.4 }}>{goal}</div>}
    <div style={{ marginTop: 4, fontSize: 9, color: '#71717a' }}>{taskCount} task{taskCount !== 1 ? 's' : ''}</div>
  </div>
);

// ── Node: Task ────────────────────────────────────────────────────────────────
const TaskNode = ({ task, onClick }) => {
  const isMilestone = task.milestone === true;
  const isBlocked   = task.depStatus === 'Blocked' || task.status === 'Blocked';
  const pc = priorityColor(task.priority);

  return (
    <div onClick={onClick} style={{
      padding: '9px 12px', borderRadius: isMilestone ? 10 : 8, cursor: 'pointer',
      background: isMilestone ? '#1c150a' : '#18181b',
      border: `1.5px solid ${isMilestone ? '#f59e0b50' : isBlocked ? '#ef444440' : '#3f3f46'}`,
      minWidth: 160, maxWidth: 190, flexShrink: 0,
      transition: 'all 0.15s',
      boxShadow: isMilestone ? '0 0 12px rgba(245,158,11,0.15)' : 'none',
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = isMilestone ? '#f59e0b' : '#52525b'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = isMilestone ? '#f59e0b50' : isBlocked ? '#ef444440' : '#3f3f46'; }}>

      {/* top row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
        {isMilestone ? <Flag size={10} style={{ color: '#f59e0b', flexShrink: 0 }} /> :
         task.completed ? <CheckCircle2 size={10} style={{ color: '#10b981', flexShrink: 0 }} /> :
         isBlocked ? <Lock size={10} style={{ color: '#ef4444', flexShrink: 0 }} /> :
         <Circle size={9} style={{ color: '#52525b', flexShrink: 0 }} />}
        <div style={{ width: 5, height: 5, borderRadius: '50%', background: pc, flexShrink: 0, boxShadow: `0 0 4px ${pc}80` }} />
        {task.assignedTo && task.assignedTo !== 'Unassigned' && (
          <span style={{ marginLeft: 'auto', fontSize: 9, color: '#a78bfa', background: '#1c1040', border: '1px solid #7c3aed30', borderRadius: 99, padding: '1px 6px', fontWeight: 600, whiteSpace: 'nowrap' }}>
            {task.assignedTo.split(' ')[0]}
          </span>
        )}
      </div>

      <div style={{ fontSize: 11, fontWeight: 600, color: task.completed ? '#52525b' : '#e4e4e7', textDecoration: task.completed ? 'line-through' : 'none', lineHeight: 1.35, marginBottom: 4 }}>
        {task.title || task.text}
      </div>

      {task.timeline && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 9, color: '#52525b' }}>
          <Clock size={8} /> {task.timeline}
        </div>
      )}
    </div>
  );
};

// ── Milestone Diamond ─────────────────────────────────────────────────────────
const MilestoneDiamond = ({ title, onClick }) => (
  <div onClick={onClick} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer', flexShrink: 0 }}>
    <div style={{
      width: 40, height: 40, background: 'linear-gradient(135deg, rgba(245,158,11,0.3), rgba(245,158,11,0.1))',
      border: '2px solid #f59e0b',
      transform: 'rotate(45deg)',
      borderRadius: 4,
      boxShadow: '0 0 16px rgba(245,158,11,0.3)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'all 0.2s',
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 28px rgba(245,158,11,0.6)'; e.currentTarget.style.transform = 'rotate(45deg) scale(1.15)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 16px rgba(245,158,11,0.3)'; e.currentTarget.style.transform = 'rotate(45deg) scale(1)'; }}>
      <Flag size={12} style={{ color: '#f59e0b', transform: 'rotate(-45deg)' }} />
    </div>
    {title && <div style={{ fontSize: 8, fontWeight: 700, color: '#f59e0b', maxWidth: 80, textAlign: 'center', lineHeight: 1.3 }}>{title}</div>}
  </div>
);

// ── Drawer ────────────────────────────────────────────────────────────────────
const NodeDrawer = ({ node, onClose }) => {
  if (!node) return null;
  return (
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: 90 }} onClick={onClose} />
      <div style={{
        position: 'fixed', top: 0, right: 0, width: 360, height: '100vh', zIndex: 100,
        background: '#0a0a0f', borderLeft: '1px solid #3f3f46',
        boxShadow: '-8px 0 32px rgba(0,0,0,0.6)',
        display: 'flex', flexDirection: 'column',
        animation: 'slideIn 0.22s cubic-bezier(0.16,1,0.3,1) both',
      }}>
        {/* Header */}
        <div style={{ padding: '16px 18px', borderBottom: '1px solid #27272a', background: '#111113', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#a78bfa', marginBottom: 4 }}>
                {node.type === 'branch' ? 'Branch' : node.milestone ? '★ Milestone' : node.type === 'phase' ? 'Phase' : 'Task'}
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', lineHeight: 1.3, maxWidth: 280 }}>{node.title || node.name}</div>
            </div>
            <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 7, background: '#27272a', border: '1px solid #3f3f46', color: '#71717a', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={13} />
            </button>
          </div>
          {node.phase && <div style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, padding: '2px 8px', borderRadius: 99, background: '#1c1040', border: '1px solid #7c3aed40', color: '#a78bfa', fontWeight: 600 }}>Phase: {node.phase}</div>}
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Description */}
          {(node.description || node.summary) && (
            <div style={{ padding: '12px 14px', background: '#1c1040', border: '1px solid #7c3aed30', borderRadius: 10, borderLeft: '3px solid #7c3aed' }}>
              <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#a78bfa', marginBottom: 6 }}>Description</div>
              <p style={{ fontSize: 12.5, color: '#d4d4d8', lineHeight: 1.7, margin: 0 }}>{node.description || node.summary}</p>
            </div>
          )}

          {/* Task metadata grid */}
          {(node.priority || node.timeline || node.assignedTo) && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                node.priority    && { label: 'Priority',    val: node.priority,                   color: priorityColor(node.priority) },
                node.timeline    && { label: 'Timeline',    val: node.timeline,                    color: '#06b6d4' },
                node.assignedTo  && { label: 'Assigned',    val: node.assignedTo || 'Unassigned',  color: '#a78bfa' },
                node.depStatus   && { label: 'Status',      val: node.depStatus,                   color: node.depStatus === 'Blocked' ? '#ef4444' : '#10b981' },
                node.complexity  && { label: 'Complexity',  val: node.complexity,                  color: '#71717a' },
                (node.costImpact || node.cost_impact) && { label: 'Cost',    val: node.costImpact || node.cost_impact, color: '#f59e0b' },
              ].filter(Boolean).map(({ label, val, color: c }) => (
                <div key={label} style={{ padding: '10px 12px', background: '#18181b', borderRadius: 8, border: '1px solid #27272a' }}>
                  <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#52525b', marginBottom: 3 }}>{label}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: c }}>{val}</div>
                </div>
              ))}
            </div>
          )}

          {/* Branch task list */}
          {node.type === 'branch' && node.tasks?.length > 0 && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#52525b', marginBottom: 10 }}>
                Tasks ({node.tasks.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {node.tasks.map((t, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 10px', background: '#18181b', borderRadius: 8, border: '1px solid #27272a' }}>
                    {t.milestone ? <Flag size={10} style={{ color: '#f59e0b', flexShrink: 0, marginTop: 1 }} /> :
                     t.completed ? <CheckCircle2 size={10} style={{ color: '#10b981', flexShrink: 0, marginTop: 1 }} /> :
                     <Circle size={9} style={{ color: '#52525b', flexShrink: 0, marginTop: 2 }} />}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#d4d4d8', marginBottom: 2, lineHeight: 1.3 }}>{t.title || t.text}</div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {t.phase && <span style={{ fontSize: 9, color: '#a78bfa', background: '#1c1040', borderRadius: 99, padding: '1px 6px', border: '1px solid #7c3aed30' }}>{t.phase}</span>}
                        {t.timeline && <span style={{ fontSize: 9, color: '#52525b' }}>{t.timeline}</span>}
                      </div>
                    </div>
                    {t.priority && (
                      <div style={{ width: 5, height: 5, borderRadius: '50%', background: priorityColor(t.priority), flexShrink: 0, marginTop: 3 }} />
                    )}
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

// ── Main Roadmap Canvas ───────────────────────────────────────────────────────
// Railway-style: horizontal scrollable, fixed nodes (no drag), clean pipeline
const RailwayCanvas = ({ roadmapData, startupName, onNodeClick }) => {
  if (!roadmapData) return null;

  const branches    = roadmapData.branch_roadmaps || roadmapData.branches || [];
  const synced      = roadmapData.synced_tasks || [];
  const [activeBranch, setActiveBranch] = useState(null);

  const displayBranch = activeBranch !== null ? branches[activeBranch] : null;
  const branchTasks = displayBranch
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0, background: '#09090f', borderRadius: 16, border: '1px solid #27272a', overflow: 'hidden' }}>

      {/* ── Level 1: Root → Branches (horizontal scroll) ── */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #27272a', overflowX: 'auto' }}>
        <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#52525b', marginBottom: 16 }}>
          Roadmap Pipeline
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, minWidth: 'max-content' }}>

          {/* Root */}
          <RootNode
            title={startupName || roadmapData.startup_name || 'Startup'}
            domain={roadmapData.profiler_output?.business_type}
            onClick={() => onNodeClick({ type: 'root', title: startupName, description: roadmapData.profiler_output?.reasoning })}
          />

          {/* Connector from root */}
          <Connector length={32} color="#7c3aed60" />

          {/* Branches in a vertical stack with horizontal connector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {branches.map((branch, i) => {
              const isFirst  = i === 0;
              const isLast   = i === branches.length - 1;
              const isActive = activeBranch === i;
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                  {/* Vertical line segment */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 24 }}>
                    <div style={{ width: 2, height: isFirst ? '50%' : '100%', background: isFirst ? 'transparent' : '#3f3f46', minHeight: isFirst ? 0 : 20 }} />
                    <div style={{ width: 14, height: 2, background: '#3f3f46' }} />
                    <div style={{ width: 2, height: isLast ? '50%' : '100%', background: isLast ? 'transparent' : '#3f3f46', minHeight: isLast ? 0 : 20 }} />
                  </div>

                  {/* Branch node */}
                  <div style={{ padding: '12px 0', display: 'flex', alignItems: 'center', gap: 0 }}>
                    <BranchNode
                      branch={branch}
                      active={isActive}
                      onClick={() => { setActiveBranch(isActive ? null : i); onNodeClick({ ...branch, type: 'branch', title: branch.branch }); }}
                    />
                    {/* Arrow to show this branch is expandable */}
                    {activeBranch === i && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                        <Connector length={20} color="#7c3aed60" dashed />
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#7c3aed', boxShadow: '0 0 8px #7c3aed' }} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Level 2: Phases (shown when a branch is selected) ── */}
      {activeBranch !== null && phases.length > 0 && (
        <div style={{ padding: '20px 24px', borderBottom: phases.length > 0 ? '1px solid #27272a' : 'none', overflowX: 'auto', background: '#0d0d14' }}>
          <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#52525b', marginBottom: 14 }}>
            {branches[activeBranch]?.branch.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} — Phases
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0, minWidth: 'max-content' }}>
            {phases.map((phase, pIdx) => (
              <React.Fragment key={pIdx}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
                  <PhaseNode name={phase.name} goal={phase.goal} taskCount={phase.tasks.length} onClick={() => onNodeClick({ type: 'phase', title: phase.name, description: phase.goal })} />
                  {/* Tasks under this phase */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 0, alignItems: 'center' }}>
                    {phase.tasks.map((task, tIdx) => (
                      <React.Fragment key={tIdx}>
                        <Connector vertical length={12} color="#3f3f46" />
                        {task.milestone
                          ? <MilestoneDiamond title={task.title} onClick={() => onNodeClick({ ...task, type: 'milestone' })} />
                          : <TaskNode task={task} onClick={() => onNodeClick({ ...task, type: 'task' })} />
                        }
                      </React.Fragment>
                    ))}
                  </div>
                </div>
                {/* Connector between phases */}
                {pIdx < phases.length - 1 && (
                  <div style={{ display: 'flex', alignItems: 'center', padding: '0 0', paddingBottom: 40 }}>
                    <Connector length={40} color="#3f3f46" />
                    <ChevronRight size={12} style={{ color: '#52525b', flexShrink: 0 }} />
                    <Connector length={8} color="#3f3f46" />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* ── Empty branch hint ── */}
      {activeBranch === null && branches.length > 0 && (
        <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 8, color: '#52525b', fontSize: 12 }}>
          <ChevronRight size={14} />
          Click any branch to expand its phases and tasks
        </div>
      )}
    </div>
  );
};

// ── Team Modal ────────────────────────────────────────────────────────────────
const TeamModal = ({ onConfirm, onCancel, isGenerating }) => {
  const [members, setMembers] = useState([{ name: '', role: '', skills: '' }]);
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 440, background: '#111113', border: '1px solid #3f3f46', borderRadius: 16, overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.8)' }} className="animate-scale-in">
        <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid #27272a', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>Team Setup</div>
            <div style={{ fontSize: 12, color: '#71717a', marginTop: 2 }}>Add members — AI assigns tasks by role & skill.</div>
          </div>
          <button onClick={onCancel} style={{ width: 28, height: 28, borderRadius: 7, background: '#27272a', border: '1px solid #3f3f46', color: '#71717a', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={13} />
          </button>
        </div>
        <div style={{ padding: '14px 20px', maxHeight: 300, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {members.map((m, i) => (
            <div key={i} style={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: 10, padding: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Member {i + 1}</span>
                {members.length > 1 && <button onClick={() => setMembers(ms => ms.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', color: '#71717a', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><Trash2 size={12} /></button>}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                <input value={m.name} onChange={e => setMembers(ms => ms.map((x, j) => j===i ? {...x, name: e.target.value} : x))} placeholder="Full name *" />
                <input value={m.role} onChange={e => setMembers(ms => ms.map((x, j) => j===i ? {...x, role: e.target.value} : x))} placeholder="Role (e.g. CTO)" />
              </div>
              <input value={m.skills} onChange={e => setMembers(ms => ms.map((x, j) => j===i ? {...x, skills: e.target.value} : x))} placeholder="Skills: React, Python, Marketing…" />
            </div>
          ))}
          <button onClick={() => setMembers(ms => [...ms, { name:'', role:'', skills:'' }])}
            style={{ padding: 9, borderRadius: 8, border: '1px dashed #7c3aed40', background: 'transparent', color: '#a78bfa', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <Plus size={13} /> Add Member
          </button>
        </div>
        <div style={{ padding: '12px 20px', borderTop: '1px solid #27272a', display: 'flex', gap: 10 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: '9px', borderRadius: 8, border: '1px solid #3f3f46', background: 'transparent', color: '#a1a1aa', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
          <button
            onClick={() => onConfirm(members.filter(m => m.name.trim()).map(m => ({ name: m.name.trim(), role: m.role.trim() || 'Founder', skills: m.skills.split(',').map(s => s.trim()).filter(Boolean) })))}
            disabled={isGenerating}
            style={{ flex: 1, padding: '9px', borderRadius: 8, border: 'none', background: '#7c3aed', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            {isGenerating ? <div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spinSlow 0.8s linear infinite' }} /> : <><Sparkles size={13} /> Generate</>}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────────
const Roadmap = () => {
  const navigate = useNavigate();
  const { user, startupDetails, roadmapData, isGeneratingRoadmap, generateRoadmap, allRoadmaps } = useStartup();
  const { showToast } = useToast();

  const [showTeamModal, setShowTeamModal] = useState(false);
  const [selectedNode,  setSelectedNode]  = useState(null);
  const [activeSession, setActiveSession] = useState(null);

  const displayData = activeSession || roadmapData;
  const branches = displayData?.branch_roadmaps || displayData?.branches || [];
  const synced   = displayData?.synced_tasks || [];
  const allTasks = [...branches.flatMap(b => {
    const bt = synced.filter(t => t.branch === b.branch);
    return bt.length > 0 ? bt : (b.tasks || []);
  })];
  const done = allTasks.filter(t => t.completed).length;
  const pct  = allTasks.length > 0 ? Math.round((done / allTasks.length) * 100) : 0;
  const milestones = allTasks.filter(t => t.milestone).length;

  const handleGenerate = async (team) => {
    setShowTeamModal(false);
    await generateRoadmap(team);
  };

  const loadPastRoadmap = async (sessionId) => {
    try {
      const { fetchSessionRoadmap } = await import('../services/startupApi');
      const data = await fetchSessionRoadmap(sessionId);
      if (data) { setActiveSession(data); showToast('Roadmap loaded.', 'success'); }
      else showToast('Could not load roadmap.', 'error');
    } catch { showToast('Failed to load roadmap.', 'error'); }
  };

  return (
    <DashboardLayout activeTab="roadmap">
      {showTeamModal && (
        <TeamModal onConfirm={handleGenerate} onCancel={() => setShowTeamModal(false)} isGenerating={isGeneratingRoadmap} />
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
              Click a branch to expand its phases and tasks.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {allRoadmaps?.length > 1 && (
              <select onChange={e => { if (e.target.value) loadPastRoadmap(e.target.value); }} style={{ fontSize: 12, maxWidth: 200 }} defaultValue="">
                <option value="" disabled>Load past roadmap…</option>
                {allRoadmaps.map(r => (
                  <option key={r.session_id} value={r.session_id}>{r.startup_name} — {new Date(r.created_at).toLocaleDateString('en-IN', { day:'2-digit', month:'short' })}</option>
                ))}
              </select>
            )}
            <button
              onClick={() => { if (!user?.userId) { showToast('Please log in.', 'error'); return; } setShowTeamModal(true); }}
              disabled={isGeneratingRoadmap}
              className="btn btn-primary btn-sm">
              {isGeneratingRoadmap
                ? <><div style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spinSlow 0.8s linear infinite' }} /> Generating…</>
                : <><Sparkles size={13} /> {displayData ? 'Regenerate' : 'Generate Roadmap'}</>
              }
            </button>
          </div>
        </div>

        {/* Stats */}
        {displayData && branches.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 12 }}>
            {[
              { label: 'Branches',   val: branches.length, color: '#8b5cf6' },
              { label: 'Tasks',      val: allTasks.length,  color: '#e4e4e7' },
              { label: 'Milestones', val: milestones,        color: '#f59e0b' },
              { label: 'Completed',  val: done,              color: '#10b981' },
              { label: 'Progress',   val: `${pct}%`,         color: '#06b6d4' },
            ].map(s => (
              <div key={s.label} style={{ padding: '12px 14px', background: '#111113', border: '1px solid #27272a', borderRadius: 10 }}>
                <div style={{ fontSize: 20, fontWeight: 900, color: s.color, fontFamily: 'monospace', letterSpacing: '-0.03em', lineHeight: 1 }}>{s.val}</div>
                <div style={{ fontSize: 9, fontWeight: 600, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.07em', marginTop: 3 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!displayData && !isGeneratingRoadmap && (
          <div style={{ textAlign: 'center', padding: '72px 24px', background: '#09090f', border: '1px dashed #27272a', borderRadius: 16 }} className="animate-fade-up">
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#1c1040', border: '1px solid #7c3aed40', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Compass size={32} style={{ color: '#a78bfa' }} />
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#fff', margin: '0 0 8px' }}>Generate Your Roadmap</h2>
            <p style={{ fontSize: 13, color: '#71717a', margin: '0 0 28px', maxWidth: 380, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.7 }}>
              AI builds a phased execution plan with milestones and task assignments from your validation.
            </p>
            <button onClick={() => { if (!user?.userId) { showToast('Please log in.', 'error'); return; } setShowTeamModal(true); }}
              style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: '#7c3aed', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, boxShadow: '0 0 24px rgba(124,58,237,0.4)' }}>
              <Sparkles size={15} /> Generate Roadmap
            </button>
          </div>
        )}

        {/* Generating */}
        {isGeneratingRoadmap && (
          <div style={{ textAlign: 'center', padding: '72px 24px', background: '#09090f', border: '1px solid #27272a', borderRadius: 16 }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', border: '3px solid #7c3aed', borderTopColor: 'transparent', animation: 'spinSlow 1s linear infinite', margin: '0 auto 20px' }} />
            <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 6 }}>Building roadmap…</div>
            <div style={{ fontSize: 12, color: '#71717a' }}>Generating phases, milestones, and task assignments.</div>
          </div>
        )}

        {/* Railway Canvas */}
        {displayData && !isGeneratingRoadmap && (
          <RailwayCanvas
            roadmapData={displayData}
            startupName={startupDetails.startupName}
            onNodeClick={(n) => setSelectedNode(n)}
          />
        )}

        {/* Drawer */}
        {selectedNode && <NodeDrawer node={selectedNode} onClose={() => setSelectedNode(null)} />}
      </div>
    </DashboardLayout>
  );
};

export default Roadmap;
