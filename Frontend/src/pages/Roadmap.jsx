import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import ReactFlow, {
  MiniMap, Controls, Background, MarkerType, Handle, Position,
  useReactFlow, ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useNavigate } from 'react-router-dom';
import { useStartup } from '../context/StartupContext';
import { useToast } from '../context/ToastContext';
import DashboardLayout from '../layouts/DashboardLayout';
import {
  Sparkles, X, Clock, CheckCircle2, Flag, Maximize2, Minimize2,
  ChevronDown, User, AlertTriangle, Trash2, Plus, BarChart2,
  Layers, ArrowRight, Lock, Compass
} from 'lucide-react';

// ── Color helpers ─────────────────────────────────────────────────────────────
const statusColors = {
  Completed:    { color: 'var(--green)',  bg: 'var(--green-bg)',  border: 'var(--green-border)',  badge: 'badge badge-green'  },
  'In Progress':{ color: 'var(--brand)', bg: 'var(--brand-bg)', border: 'var(--brand-border)', badge: 'badge badge-brand'  },
  Blocked:      { color: 'var(--red)',   bg: 'var(--red-bg)',   border: 'var(--red-border)',   badge: 'badge badge-red'    },
  Pending:      { color: 'var(--text3)', bg: 'var(--surface3)', border: 'var(--border2)',      badge: 'badge badge-ghost'  },
};
const sc = (s) => statusColors[s] || statusColors.Pending;
const pc = (p) => p==='High' ? 'badge badge-red' : p==='Medium' ? 'badge badge-amber' : 'badge badge-ghost';

// ── Root Node ────────────────────────────────────────────────────────────────
const RootNode = ({ data }) => (
  <div onClick={data.onClick} style={{
    padding: '14px 20px', borderRadius: 16, cursor: 'pointer',
    background: 'linear-gradient(135deg, var(--brand-bg), var(--surface2))',
    border: '2px solid var(--brand-border)',
    boxShadow: 'var(--shadow-brand)',
    minWidth: 220, maxWidth: 280, textAlign: 'center',
    transition: 'all 0.2s',
  }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.boxShadow = '0 0 30px rgba(124,58,237,0.4)'; }}
    onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'var(--shadow-brand)'; }}>
    <div style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--brand-light)', marginBottom: 6 }}>
      STARTUP
    </div>
    <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--text1)', letterSpacing: '-0.02em', marginBottom: 4 }}>{data.title}</div>
    {data.description && (
      <div style={{ fontSize: 11, color: 'var(--text2)', lineHeight: 1.5 }}>{data.description}</div>
    )}
    <Handle type="source" position={Position.Right} style={{ background: 'var(--brand)', width: 8, height: 8, border: '2px solid var(--surface)' }} />
  </div>
);

// ── Branch Node ──────────────────────────────────────────────────────────────
const BranchNode = ({ data }) => {
  const meta = sc(data.status);
  const done = data.tasks?.filter(t => t.completed).length || 0;
  const total = data.tasks?.length || 0;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <div onClick={data.onClick} style={{
      padding: '12px 16px', borderRadius: 14, cursor: 'pointer',
      background: 'var(--surface)', border: `1.5px solid ${meta.border}`,
      minWidth: 210, maxWidth: 260,
      boxShadow: `0 2px 12px ${meta.color}20`,
      transition: 'all 0.2s',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 6px 20px ${meta.color}35`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 2px 12px ${meta.color}20`; }}>
      <Handle type="target" position={Position.Left} style={{ background: meta.color, width: 7, height: 7, border: '2px solid var(--surface)' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span className={meta.badge} style={{ fontSize: 9 }}>{data.status}</span>
        {total > 0 && <span style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>{done}/{total}</span>}
      </div>
      <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text1)', marginBottom: 4, lineHeight: 1.3 }}>
        {data.title.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
      </div>
      {data.description && (
        <div style={{ fontSize: 10.5, color: 'var(--text2)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: total > 0 ? 8 : 0 }}>
          {data.description}
        </div>
      )}
      {total > 0 && (
        <>
          <div className="progress-track" style={{ height: 4 }}>
            <div className="progress-fill" style={{ width: `${pct}%`, height: '100%', background: meta.color }} />
          </div>
          <div style={{ fontSize: 9, color: 'var(--text3)', marginTop: 2, textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{pct}%</div>
        </>
      )}
      <Handle type="source" position={Position.Right} style={{ background: meta.color, width: 7, height: 7, border: '2px solid var(--surface)' }} />
    </div>
  );
};

// ── Phase Node (milestone group header) ───────────────────────────────────────
const PhaseNode = ({ data }) => (
  <div onClick={data.onClick} style={{
    padding: '8px 14px', borderRadius: 10, cursor: 'pointer',
    background: 'var(--surface2)', border: `1px solid var(--brand-border)`,
    minWidth: 160, maxWidth: 200, textAlign: 'center',
    transition: 'all 0.15s',
  }}
    onMouseEnter={e => e.currentTarget.style.background = 'var(--brand-bg)'}
    onMouseLeave={e => e.currentTarget.style.background = 'var(--surface2)'}>
    <Handle type="target" position={Position.Left} style={{ background: 'var(--brand)', width: 6, height: 6, border: '2px solid var(--surface)' }} />
    <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--brand-light)', marginBottom: 3 }}>Phase</div>
    <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text1)' }}>{data.title}</div>
    {data.description && <div style={{ fontSize: 10, color: 'var(--text2)', marginTop: 3, lineHeight: 1.4 }}>{data.description}</div>}
    <Handle type="source" position={Position.Right} style={{ background: 'var(--brand)', width: 6, height: 6, border: '2px solid var(--surface)' }} />
  </div>
);

// ── Task Node ─────────────────────────────────────────────────────────────────
const TaskNode = ({ data }) => {
  const isMilestone = data.milestone;
  const isBlocked   = data.depStatus === 'Blocked';
  return (
    <div onClick={data.onClick} style={{
      padding: '10px 13px', cursor: 'pointer', transition: 'all 0.2s',
      minWidth: 180, maxWidth: 230,
      borderRadius: isMilestone ? 12 : 10,
      background: isMilestone ? 'linear-gradient(135deg, rgba(245,158,11,0.12), var(--surface2))' : 'var(--surface2)',
      border: `1.5px solid ${isMilestone ? 'var(--amber-border)' : isBlocked ? 'var(--red-border)' : 'var(--border2)'}`,
      boxShadow: isMilestone ? '0 2px 12px rgba(245,158,11,0.15)' : 'none',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.borderColor = isMilestone ? 'var(--amber)' : 'var(--brand-border)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.borderColor = isMilestone ? 'var(--amber-border)' : isBlocked ? 'var(--red-border)' : 'var(--border2)'; }}>
      <Handle type="target" position={Position.Left} style={{ background: isMilestone ? 'var(--amber)' : 'var(--brand)', width: 6, height: 6, border: '2px solid var(--surface2)' }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
        {isMilestone ? <Flag size={10} style={{ color: 'var(--amber)', flexShrink: 0 }} /> :
         isBlocked    ? <Lock size={10} style={{ color: 'var(--red)', flexShrink: 0 }} /> :
         data.completed ? <CheckCircle2 size={10} style={{ color: 'var(--green)', flexShrink: 0 }} /> :
         <div style={{ width: 8, height: 8, borderRadius: '50%', border: '1.5px solid var(--brand)', flexShrink: 0 }} />}
        <span className={pc(data.priority)} style={{ fontSize: 8 }}>{data.priority}</span>
        {data.assignedTo && data.assignedTo !== 'Unassigned' && (
          <span style={{ fontSize: 9, color: 'var(--brand-light)', background: 'var(--brand-bg)', border: '1px solid var(--brand-border)', borderRadius: 99, padding: '1px 6px', fontWeight: 600, marginLeft: 'auto' }}>
            {data.assignedTo.split(' ')[0]}
          </span>
        )}
      </div>

      <div style={{ fontSize: 11, fontWeight: 700, color: data.completed ? 'var(--text3)' : 'var(--text1)', textDecoration: data.completed ? 'line-through' : 'none', lineHeight: 1.3, marginBottom: 3 }}>
        {data.title}
      </div>

      {data.timeline && (
        <div style={{ fontSize: 9, color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: 3 }}>
          <Clock size={8} /> {data.timeline}
        </div>
      )}
    </div>
  );
};

// ── Milestone Diamond Node ────────────────────────────────────────────────────
const MilestoneNode = ({ data }) => (
  <div onClick={data.onClick} style={{
    width: 80, height: 80, cursor: 'pointer',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    background: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(245,158,11,0.05))',
    border: '2px solid var(--amber)',
    borderRadius: 4, transform: 'rotate(45deg)',
    boxShadow: '0 0 20px rgba(245,158,11,0.25)',
    transition: 'all 0.2s',
  }}
    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 30px rgba(245,158,11,0.5)'; e.currentTarget.style.transform = 'rotate(45deg) scale(1.1)'; }}
    onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 20px rgba(245,158,11,0.25)'; e.currentTarget.style.transform = 'rotate(45deg) scale(1)'; }}>
    <Handle type="target" position={Position.Left} style={{ background: 'var(--amber)', width: 6, height: 6, border: '2px solid var(--surface)', transform: 'rotate(-45deg) translateX(-8px)' }} />
    <div style={{ transform: 'rotate(-45deg)', textAlign: 'center' }}>
      <Flag size={14} style={{ color: 'var(--amber)', margin: '0 auto 2px' }} />
      <div style={{ fontSize: 8, fontWeight: 800, color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Milestone</div>
    </div>
    <Handle type="source" position={Position.Right} style={{ background: 'var(--amber)', width: 6, height: 6, border: '2px solid var(--surface)', transform: 'rotate(-45deg) translateX(8px)' }} />
  </div>
);

const nodeTypes = {
  root:      RootNode,
  branch:    BranchNode,
  phase:     PhaseNode,
  task:      TaskNode,
  milestone: MilestoneNode,
};

// ── Team Modal ────────────────────────────────────────────────────────────────
const TeamModal = ({ onConfirm, onCancel, isGenerating }) => {
  const [members, setMembers] = useState([{ name: '', role: '', skills: '' }]);
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', padding: 16 }}>
      <div className="glass-card animate-scale-in" style={{ width: '100%', maxWidth: 460, overflow: 'hidden' }}>
        <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text1)' }}>Team Setup</div>
            <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>Add team members — AI will assign tasks by role and skill.</div>
          </div>
          <button onClick={onCancel} className="btn btn-ghost btn-icon"><X size={14} /></button>
        </div>
        <div style={{ padding: '14px 20px', maxHeight: 300, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {members.map((m, i) => (
            <div key={i} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--brand-light)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Member {i + 1}</span>
                {members.length > 1 && <button onClick={() => setMembers(m => m.filter((_, j) => j !== i))} className="btn btn-ghost btn-icon-sm"><Trash2 size={11} /></button>}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                <input value={m.name}   onChange={e => setMembers(ms => ms.map((x,j) => j===i ? {...x, name: e.target.value} : x))} placeholder="Full name *" />
                <input value={m.role}   onChange={e => setMembers(ms => ms.map((x,j) => j===i ? {...x, role: e.target.value} : x))} placeholder="Role (e.g. CTO)" />
              </div>
              <input value={m.skills} onChange={e => setMembers(ms => ms.map((x,j) => j===i ? {...x, skills: e.target.value} : x))} placeholder="Skills: React, Python, Marketing…" />
            </div>
          ))}
          <button onClick={() => setMembers(m => [...m, { name:'', role:'', skills:'' }])}
            style={{ padding: 8, borderRadius: 'var(--r)', border: '1px dashed var(--brand-border)', background: 'transparent', color: 'var(--brand-light)', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <Plus size={13} /> Add Member
          </button>
        </div>
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10 }}>
          <button onClick={onCancel} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
          <button onClick={() => onConfirm(members.filter(m => m.name.trim()).map(m => ({ name: m.name.trim(), role: m.role.trim() || 'Founder', skills: m.skills.split(',').map(s => s.trim()).filter(Boolean) })))}
            disabled={isGenerating} className="btn btn-primary" style={{ flex: 1 }}>
            {isGenerating ? <div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spinSlow 0.8s linear infinite' }} /> : <><Sparkles size={13} /> Generate</>}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Build nodes from roadmap data ─────────────────────────────────────────────
function buildNodesFromRoadmap(roadmapData, startupName, onNodeClick) {
  if (!roadmapData) return { nodes: [], edges: [] };

  const branches = roadmapData.branch_roadmaps || roadmapData.branches || [];
  const synced   = roadmapData.synced_tasks || [];
  const rfNodes = [], rfEdges = [];

  // Root
  rfNodes.push({
    id: 'root', type: 'root', position: { x: 0, y: 0 },
    data: {
      id: 'root', title: startupName || roadmapData.startup_name || 'Startup',
      description: roadmapData.profiler_output?.business_type || '',
      onClick: () => onNodeClick({ id: 'root', type: 'root', title: startupName, tasks: [] }),
    },
  });

  let branchY = 0;
  const BRANCH_GAP = 320, PHASE_GAP = 180, TASK_GAP = 130;

  branches.forEach((branch, bIdx) => {
    const branchId  = `branch-${branch.branch}`;
    const branchX   = 320;
    const branchTasks = synced.filter(t => t.branch === branch.branch);
    const tasksToUse  = branchTasks.length > 0 ? branchTasks : (branch.tasks || []);

    // Group tasks by phase
    const phaseMap = {};
    tasksToUse.forEach(t => {
      const ph = t.phase || 'Main';
      if (!phaseMap[ph]) phaseMap[ph] = [];
      phaseMap[ph].push(t);
    });
    const phases = Object.keys(phaseMap);

    // Calculate branch Y center
    const totalTasks = tasksToUse.length;
    const branchHeight = Math.max(phases.length * PHASE_GAP, totalTasks * TASK_GAP, 200);

    rfNodes.push({
      id: branchId, type: 'branch', position: { x: branchX, y: branchY },
      data: {
        id: branchId, title: branch.branch, description: branch.summary || '',
        status: branch.status === 'success' ? 'In Progress' : 'Pending',
        tasks: tasksToUse, selected: false,
        onClick: () => onNodeClick({ id: branchId, type: 'branch', title: branch.branch, tasks: tasksToUse, summary: branch.summary, branchDbId: branch.db_id }),
      },
    });

    rfEdges.push({
      id: `e-root-${branchId}`, source: 'root', target: branchId, type: 'smoothstep',
      style: { stroke: 'var(--brand-border)', strokeWidth: 1.5 },
      markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--brand)', width: 10, height: 10 },
    });

    // Phases and tasks
    let phaseY = branchY - (phases.length - 1) * (PHASE_GAP / 2);
    phases.forEach((phaseName, pIdx) => {
      const phaseTasks = phaseMap[phaseName];
      const phaseId    = `phase-${branchId}-${pIdx}`;
      const phaseX     = branchX + 280;

      rfNodes.push({
        id: phaseId, type: 'phase', position: { x: phaseX, y: phaseY },
        data: { id: phaseId, title: phaseName, description: phaseTasks[0]?.phase_goal || '' },
      });
      rfEdges.push({
        id: `e-${branchId}-${phaseId}`, source: branchId, target: phaseId, type: 'smoothstep',
        style: { stroke: 'var(--brand-border)', strokeWidth: 1, opacity: 0.7 },
      });

      // Tasks in this phase
      const taskStartY = phaseY - (phaseTasks.length - 1) * (TASK_GAP / 2);
      phaseTasks.forEach((task, tIdx) => {
        const taskId = `task-${branchId}-${pIdx}-${tIdx}`;
        const taskX  = phaseX + 240;
        const taskY  = taskStartY + tIdx * TASK_GAP;
        const isMilestone = task.milestone === true;

        rfNodes.push({
          id: taskId,
          type: isMilestone ? 'milestone' : 'task',
          position: { x: taskX + (isMilestone ? 30 : 0), y: taskY + (isMilestone ? -10 : 0) },
          data: {
            id: taskId, title: task.title || task.text || '',
            description: task.description || '', timeline: task.timeline || '',
            priority: task.priority || 'Medium', milestone: isMilestone,
            completed: task.completed || false, depStatus: task.status || 'Ready',
            assignedTo: task.assigned_to || task.assignedTo || 'Unassigned',
            onClick: () => onNodeClick({ ...task, id: taskId, type: 'task' }),
          },
        });

        rfEdges.push({
          id: `e-${phaseId}-${taskId}`, source: phaseId, target: taskId, type: 'smoothstep',
          animated: !task.completed && task.status === 'In Progress',
          style: { stroke: isMilestone ? 'var(--amber)' : 'var(--border2)', strokeWidth: 1.5, opacity: 0.8 },
          markerEnd: { type: MarkerType.ArrowClosed, color: isMilestone ? 'var(--amber)' : 'var(--brand)', width: 8, height: 8 },
        });
      });

      phaseY += PHASE_GAP;
    });

    branchY += branchHeight + BRANCH_GAP;
  });

  return { nodes: rfNodes, edges: rfEdges };
}

// ── Task Drawer ───────────────────────────────────────────────────────────────
const TaskDrawer = ({ node, onClose, onToggle }) => {
  if (!node) return null;
  const isBranch = node.type === 'branch';
  const isTask   = node.type === 'task' || node.type === 'milestone';
  const meta = sc(node.status || 'Pending');

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: 90 }} onClick={onClose} />
      <div className="drawer" style={{ position: 'fixed', top: 0, right: 0, width: 380, height: '100vh', zIndex: 100, background: 'var(--surface)', borderLeft: '1px solid var(--border2)', boxShadow: 'var(--shadow-lg)', display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border)', background: 'var(--surface2)', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--brand-light)', marginBottom: 4 }}>
                {isBranch ? 'Branch' : node.milestone ? 'Milestone' : 'Task'}
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text1)', lineHeight: 1.3, maxWidth: 280 }}>{node.title}</div>
            </div>
            <button onClick={onClose} className="btn btn-ghost btn-icon"><X size={13} /></button>
          </div>
          {node.phase && (
            <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
              <span className="badge badge-brand" style={{ fontSize: 9 }}>Phase: {node.phase}</span>
              {node.milestone && <span className="badge badge-amber" style={{ fontSize: 9 }}><Flag size={8} /> Milestone</span>}
            </div>
          )}
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Description */}
          {node.description && (
            <div style={{ padding: '12px 14px', background: 'var(--brand-bg)', border: '1px solid var(--brand-border)', borderRadius: 'var(--r)', borderLeft: '3px solid var(--brand)' }}>
              <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--brand-light)', marginBottom: 6 }}>Description</div>
              <p style={{ fontSize: 12.5, color: 'var(--text1)', lineHeight: 1.7, margin: 0 }}>{node.description || node.summary}</p>
            </div>
          )}

          {/* Task metadata */}
          {isTask && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { label: 'Priority',    val: node.priority,                   color: node.priority==='High' ? 'var(--red)' : node.priority==='Medium' ? 'var(--amber)' : 'var(--text2)' },
                { label: 'Timeline',    val: node.timeline || '—',            color: 'var(--cyan)'        },
                { label: 'Assigned',    val: node.assignedTo || 'Unassigned', color: 'var(--brand-light)' },
                { label: 'Status',      val: node.depStatus || 'Ready',       color: meta.color           },
                { label: 'Complexity',  val: node.complexity || '—',          color: 'var(--text2)'       },
                { label: 'Cost Impact', val: node.costImpact || node.cost_impact || '—', color: 'var(--amber)' },
              ].map(({ label, val, color: c }) => (
                <div key={label} style={{ padding: '10px 12px', background: 'var(--surface2)', borderRadius: 8, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text3)', marginBottom: 3 }}>{label}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: c }}>{val}</div>
                </div>
              ))}
            </div>
          )}

          {/* Branch tasks list */}
          {isBranch && node.tasks?.length > 0 && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text3)', marginBottom: 10 }}>
                Tasks ({node.tasks.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {node.tasks.map((t, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 10px', background: 'var(--surface2)', borderRadius: 8, border: '1px solid var(--border)' }}>
                    {t.milestone ? <Flag size={11} style={{ color: 'var(--amber)', flexShrink: 0, marginTop: 1 }} /> :
                     t.completed ? <CheckCircle2 size={11} style={{ color: 'var(--green)', flexShrink: 0, marginTop: 1 }} /> :
                     <div style={{ width: 8, height: 8, borderRadius: '50%', border: '1.5px solid var(--brand)', flexShrink: 0, marginTop: 3 }} />}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text1)', marginBottom: 2 }}>{t.title || t.text}</div>
                      {t.phase && <span className="badge badge-ghost" style={{ fontSize: 8 }}>{t.phase}</span>}
                      {t.timeline && <span style={{ fontSize: 10, color: 'var(--text3)', marginLeft: 4 }}>{t.timeline}</span>}
                    </div>
                    {t.priority && <span className={pc(t.priority)} style={{ fontSize: 8, flexShrink: 0 }}>{t.priority}</span>}
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

// ── Inner canvas (needs ReactFlow context) ────────────────────────────────────
const RoadmapCanvas = ({ nodes, edges, isFullscreen, setIsFullscreen }) => {
  const { fitView } = useReactFlow();
  useEffect(() => { setTimeout(() => fitView({ padding: 0.2, duration: 400 }), 100); }, [nodes.length]);

  return (
    <div style={{ width: '100%', height: isFullscreen ? '100vh' : 600, position: 'relative', background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: isFullscreen ? 0 : 'var(--r-lg)', overflow: 'hidden' }}>
      <ReactFlow
        nodes={nodes} edges={edges} nodeTypes={nodeTypes}
        fitView fitViewOptions={{ padding: 0.2 }}
        minZoom={0.08} maxZoom={2.5}
        proOptions={{ hideAttribution: true }}
        style={{ width: '100%', height: '100%' }}>
        <Background color="var(--border)" gap={24} size={1} />
        <Controls />
        <MiniMap maskColor="rgba(0,0,0,0.5)" nodeColor={(n) => n.type==='root' ? 'var(--brand)' : n.type==='milestone' ? 'var(--amber)' : 'var(--surface3)'} />
      </ReactFlow>

      {/* Fullscreen toggle */}
      <button onClick={() => setIsFullscreen(v => !v)}
        style={{ position: 'absolute', top: 12, right: 12, zIndex: 10, width: 32, height: 32, borderRadius: 8, background: 'var(--surface2)', border: '1px solid var(--border2)', color: 'var(--text2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
        onMouseEnter={e => { e.currentTarget.style.color = 'var(--text1)'; e.currentTarget.style.background = 'var(--surface3)'; }}
        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text2)'; e.currentTarget.style.background = 'var(--surface2)'; }}>
        {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
      </button>

      {/* Legend */}
      <div style={{ position: 'absolute', left: 12, bottom: 48, padding: '8px 12px', borderRadius: 'var(--r)', background: 'var(--surface2)', border: '1px solid var(--border)', fontSize: 10, display: 'flex', flexDirection: 'column', gap: 4, pointerEvents: 'none', zIndex: 5 }}>
        {[
          { color: 'var(--brand)', label: 'Branch'    },
          { color: 'var(--amber)', label: 'Milestone' },
          { color: 'var(--green)', label: 'Completed' },
          { color: 'var(--red)',   label: 'Blocked'   },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text3)' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const Roadmap = () => {
  const navigate = useNavigate();
  const { user, startupDetails, roadmapData, isGeneratingRoadmap, generateRoadmap, allRoadmaps } = useStartup();
  const { showToast } = useToast();

  const [showTeamModal, setShowTeamModal]   = useState(false);
  const [selectedNode,  setSelectedNode]    = useState(null);
  const [isFullscreen,  setIsFullscreen]    = useState(false);
  const [activeSession, setActiveSession]   = useState(null);
  const [loadingSession,setLoadingSession]  = useState(false);

  // Determine which roadmap to show
  const displayData = activeSession || roadmapData;

  const { nodes, edges } = useMemo(() => {
    if (!displayData) return { nodes: [], edges: [] };
    return buildNodesFromRoadmap(
      displayData,
      startupDetails.startupName,
      (nodeData) => setSelectedNode(nodeData)
    );
  }, [displayData, startupDetails.startupName]);

  // Stats
  const stats = useMemo(() => {
    const allTasks = nodes.filter(n => n.type === 'task' || n.type === 'milestone');
    const done     = allTasks.filter(n => n.data?.completed).length;
    const branches = nodes.filter(n => n.type === 'branch').length;
    const milestones = nodes.filter(n => n.type === 'milestone').length;
    return { branches, total: allTasks.length, done, pct: allTasks.length > 0 ? Math.round((done/allTasks.length)*100) : 0, milestones };
  }, [nodes]);

  const handleGenerate = async (team) => {
    setShowTeamModal(false);
    await generateRoadmap(team);
  };

  // Load a past roadmap by session
  const loadPastRoadmap = async (session) => {
    setLoadingSession(true);
    try {
      const { fetchSessionRoadmap } = await import('../services/startupApi');
      const data = await fetchSessionRoadmap(session.session_id);
      if (data) setActiveSession(data);
      else showToast('Could not load that roadmap.', 'error');
    } catch {
      showToast('Failed to load roadmap.', 'error');
    } finally {
      setLoadingSession(false);
    }
  };

  return (
    <DashboardLayout activeTab="roadmap">
      {/* Fullscreen overlay */}
      {isFullscreen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 150, background: 'var(--bg)' }}>
          <ReactFlowProvider>
            <RoadmapCanvas nodes={nodes} edges={edges} isFullscreen={isFullscreen} setIsFullscreen={setIsFullscreen} />
          </ReactFlowProvider>
          {selectedNode && <TaskDrawer node={selectedNode} onClose={() => setSelectedNode(null)} />}
        </div>
      )}

      {showTeamModal && (
        <TeamModal
          onConfirm={handleGenerate}
          onCancel={() => setShowTeamModal(false)}
          isGenerating={isGeneratingRoadmap}
        />
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--brand-light)', marginBottom: 4 }}>Execution OS</div>
            <h1 style={{ fontSize: 22, fontWeight: 900, color: 'var(--text1)', letterSpacing: '-0.02em', margin: 0, marginBottom: 2 }}>
              {startupDetails.startupName || 'Venture'} Roadmap
            </h1>
            <p style={{ fontSize: 12, color: 'var(--text2)', margin: 0 }}>
              {nodes.length > 0 ? 'Multi-level execution plan — click any node for details.' : 'Generate an AI-powered roadmap from your validated strategy.'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {/* Past roadmaps dropdown */}
            {allRoadmaps?.length > 0 && (
              <select onChange={e => { const r = allRoadmaps.find(x => x.session_id === e.target.value); if (r) loadPastRoadmap(r); }}
                style={{ fontSize: 12, maxWidth: 200 }} defaultValue="">
                <option value="" disabled>Load past roadmap…</option>
                {allRoadmaps.map(r => (
                  <option key={r.session_id} value={r.session_id}>{r.startup_name} — {new Date(r.created_at).toLocaleDateString('en-IN', { day:'2-digit', month:'short' })}</option>
                ))}
              </select>
            )}
            <button
              onClick={() => { if (!user?.userId) { showToast('Please log in.', 'error'); return; } setShowTeamModal(true); }}
              disabled={isGeneratingRoadmap || loadingSession}
              className="btn btn-primary btn-sm">
              {isGeneratingRoadmap
                ? <><div style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spinSlow 0.8s linear infinite' }} /> Generating…</>
                : <><Sparkles size={13} /> {nodes.length > 0 ? 'Regenerate' : 'Generate Roadmap'}</>
              }
            </button>
          </div>
        </div>

        {/* Stats */}
        {nodes.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12 }}>
            {[
              { label: 'Branches',   val: stats.branches,   color: 'var(--brand-light)' },
              { label: 'Tasks',      val: stats.total,      color: 'var(--text1)'       },
              { label: 'Milestones', val: stats.milestones, color: 'var(--amber)'       },
              { label: 'Completed',  val: stats.done,       color: 'var(--green)'       },
              { label: 'Progress',   val: `${stats.pct}%`,  color: 'var(--cyan)'        },
            ].map(s => (
              <div key={s.label} className="stat-card" style={{ padding: '12px 16px' }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: s.color, fontFamily: 'var(--font-mono)', letterSpacing: '-0.03em', lineHeight: 1 }}>{s.val}</div>
                <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 3 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {nodes.length === 0 && !isGeneratingRoadmap && (
          <div style={{ textAlign: 'center', padding: '72px 24px', background: 'var(--surface)', border: '1px dashed var(--border2)', borderRadius: 'var(--r-lg)' }} className="animate-fade-up">
            <div className="glow-brand" style={{ width: 300, height: 300, top: '50%', left: '50%', transform: 'translate(-50%,-50%)', opacity: 0.5 }} />
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--brand-bg)', border: '1px solid var(--brand-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', position: 'relative', zIndex: 1 }}>
              <Compass size={32} style={{ color: 'var(--brand-light)' }} />
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text1)', margin: '0 0 8px', position: 'relative', zIndex: 1 }}>Generate Your Execution Roadmap</h2>
            <p style={{ fontSize: 13, color: 'var(--text2)', margin: '0 0 28px', maxWidth: 420, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.7, position: 'relative', zIndex: 1 }}>
              AI will build a multi-level roadmap with phases, milestones, and task assignments based on your validation results.
            </p>
            <button onClick={() => { if (!user?.userId) { showToast('Please log in.', 'error'); return; } setShowTeamModal(true); }}
              className="btn btn-primary" style={{ position: 'relative', zIndex: 1 }}>
              <Sparkles size={15} /> Generate Roadmap
            </button>
          </div>
        )}

        {/* Loading state */}
        {isGeneratingRoadmap && (
          <div style={{ textAlign: 'center', padding: '72px 24px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', border: '3px solid var(--brand)', borderTopColor: 'transparent', animation: 'spinSlow 1s linear infinite', margin: '0 auto 20px' }} />
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text1)', marginBottom: 6 }}>Building your roadmap…</div>
            <div style={{ fontSize: 12, color: 'var(--text2)' }}>AI is generating phases, milestones, and task assignments.</div>
          </div>
        )}

        {/* Canvas */}
        {nodes.length > 0 && !isFullscreen && (
          <ReactFlowProvider>
            <RoadmapCanvas nodes={nodes} edges={edges} isFullscreen={isFullscreen} setIsFullscreen={setIsFullscreen} />
          </ReactFlowProvider>
        )}

        {/* Drawer */}
        {!isFullscreen && selectedNode && (
          <TaskDrawer node={selectedNode} onClose={() => setSelectedNode(null)} />
        )}
      </div>
    </DashboardLayout>
  );
};

export default Roadmap;
