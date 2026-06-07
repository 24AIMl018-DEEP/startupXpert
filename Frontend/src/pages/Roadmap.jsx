import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactFlow, { MiniMap, Controls, Background, MarkerType, Handle, Position } from 'reactflow';
import 'reactflow/dist/style.css';
import { useStartup } from '../context/StartupContext';
import { useToast } from '../context/ToastContext';
import DashboardLayout from '../layouts/DashboardLayout';
import {
  Plus, Trash2, Compass, X, Check, Sparkles, Download,
  PlusCircle, User, Users, Clock, AlertTriangle, CheckCircle2,
  ChevronDown, ChevronUp, Lock, Sun, Moon, Target, Activity, Zap
} from 'lucide-react';

// ── Theme tokens mapping to our CSS custom properties ────────────────────────
const getTokens = (isLight) => ({
  bg:         isLight ? '#f8fafc' : '#060609',
  surface:    isLight ? '#ffffff' : '#0e0e18',
  surface2:   isLight ? '#f1f5f9' : '#12121e',
  border:     isLight ? '#e2e8f0' : 'rgba(59,130,246,0.1)',
  border2:    isLight ? '#cbd5e1' : 'rgba(59,130,246,0.18)',
  text1:      isLight ? '#0f172a' : '#f1f5f9',
  text2:      isLight ? '#475569' : '#94a3b8',
  text3:      isLight ? '#94a3b8' : '#4b5563',
  brand:      '#2563eb',
  brandLight: isLight ? '#2563eb' : '#3b82f6',
  brandBg:    isLight ? '#eff6ff' : 'rgba(37,99,235,0.08)',
  brandBdr:   isLight ? '#bfdbfe' : 'rgba(37,99,235,0.2)',
  success:    isLight ? '#059669' : '#10b981',
  successBg:  isLight ? '#f0fdf4' : 'rgba(16,185,129,0.08)',
  successBdr: isLight ? '#bbf7d0' : 'rgba(16,185,129,0.2)',
  warning:    isLight ? '#d97706' : '#f59e0b',
  warningBg:  isLight ? '#fffbeb' : 'rgba(245,158,11,0.08)',
  warningBdr: isLight ? '#fde68a' : 'rgba(245,158,11,0.2)',
  danger:     isLight ? '#dc2626' : '#f43f5e',
  dangerBg:   isLight ? '#fef2f2' : 'rgba(244,63,94,0.08)',
  dangerBdr:  isLight ? '#fecaca' : 'rgba(244,63,94,0.2)',
  purple:     '#7c3aed',
  purpleBg:   isLight ? '#f5f3ff' : 'rgba(124,58,237,0.08)',
  purpleBdr:  isLight ? '#ede9fe' : 'rgba(124,58,237,0.2)',
  track:      isLight ? '#e2e8f0' : '#1e1e2e',
  shadow:     isLight ? '0 1px 3px rgba(0,0,0,0.06),0 4px 12px rgba(0,0,0,0.04)'
                      : '0 1px 3px rgba(0,0,0,0.4),0 4px 12px rgba(0,0,0,0.3)',
  shadowMd:   isLight ? '0 4px 24px rgba(0,0,0,0.07),0 16px 48px rgba(0,0,0,0.04)'
                      : '0 4px 24px rgba(0,0,0,0.5),0 16px 48px rgba(0,0,0,0.4)',
});

// ── Custom ReactFlow Node (Premium Design) ───────────────────────────────────
const CustomRoadmapNode = ({ data }) => {
  const isRoot = data.id === 'root';
  const { isLight } = data;
  const T = getTokens(isLight);

  const statusConfig = {
    Completed:   { color: T.success, bg: T.successBg, border: T.successBdr },
    'In Progress':{ color: T.brandLight, bg: T.brandBg, border: T.brandBdr },
    Blocked:     { color: T.danger, bg: T.dangerBg, border: T.dangerBdr },
    Pending:     { color: T.text2, bg: T.surface2, border: T.border2 },
  };

  const priorityConfig = {
    High:   { color: T.danger, bg: T.dangerBg, border: T.dangerBdr },
    Medium: { color: T.warning, bg: T.warningBg, border: T.warningBdr },
    Low:    { color: T.text2, bg: T.surface2, border: T.border2 },
  };

  const st = statusConfig[data.status] || statusConfig.Pending;
  const pr = priorityConfig[data.priority] || priorityConfig.Medium;

  return (
    <div
      onClick={data.onClick}
      style={{
        background: T.surface,
        border: `1px solid ${data.isSelected ? st.color : T.border}`,
        boxShadow: data.isSelected ? `0 0 0 1px ${st.color}, ${T.shadowMd}` : T.shadow,
        borderRadius: 14,
        padding: 16,
        minWidth: 260,
        maxWidth: 300,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        transform: data.isSelected ? 'scale(1.02)' : 'scale(1)',
      }}
      className="roadmap-node-container"
    >
      {!isRoot && <Handle type="target" position={Position.Left} style={{ background: st.color, width: 8, height: 8, border: `2px solid ${T.surface}` }} />}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Badges */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '3px 8px', borderRadius: 20, color: st.color, background: st.bg, border: `1px solid ${st.border}` }}>
            {data.status}
          </span>
          <span style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '3px 8px', borderRadius: 20, color: pr.color, background: pr.bg, border: `1px solid ${pr.border}` }}>
            {data.priority || 'Medium'}
          </span>
        </div>

        {/* Text */}
        <div>
          <h4 style={{ fontSize: 13, fontWeight: 700, color: T.text1, margin: '0 0 4px', lineHeight: 1.3 }}>{data.title}</h4>
          <p style={{ fontSize: 11, color: T.text2, margin: 0, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{data.description}</p>
        </div>

        {/* Progress Bar */}
        {data.tasksCount > 0 && (
          <div style={{ marginTop: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: T.text3, fontWeight: 600, marginBottom: 4 }}>
              <span>{data.tasksCount} tasks</span>
              <span style={{ color: T.brandLight }}>{Math.round(data.progress)}%</span>
            </div>
            <div style={{ height: 6, width: '100%', background: T.track, borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: st.color, width: `${data.progress}%`, transition: 'width 0.4s ease' }} />
            </div>
          </div>
        )}
      </div>

      {data.hasChildren && (
        <button
          onClick={(e) => { e.stopPropagation(); data.onToggleExpand(); }}
          style={{
            position: 'absolute', right: -12, top: '50%', transform: 'translateY(-50%)',
            width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: T.surface, border: `1px solid ${T.border}`, color: T.text2,
            fontSize: 14, fontWeight: 800, cursor: 'pointer', zIndex: 20, boxShadow: T.shadow,
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = T.brandLight; e.currentTarget.style.borderColor = T.brandLight; }}
          onMouseLeave={e => { e.currentTarget.style.color = T.text2; e.currentTarget.style.borderColor = T.border; }}
        >
          {data.isExpanded ? '−' : '+'}
        </button>
      )}
      <Handle type="source" position={Position.Right} style={{ background: st.color, width: 8, height: 8, border: `2px solid ${T.surface}` }} />
    </div>
  );
};

const nodeTypes = { roadmapNode: CustomRoadmapNode };

// ── Team Input Modal ─────────────────────────────────────────────────────────
const TeamModal = ({ onConfirm, onCancel, isGenerating, isLight }) => {
  const T = getTokens(isLight);
  const [members, setMembers] = useState([{ name: '', role: '', skills: '' }]);

  const addMember = () => setMembers(m => [...m, { name: '', role: '', skills: '' }]);
  const removeMember = (i) => setMembers(m => m.filter((_, idx) => idx !== i));
  const updateMember = (i, field, val) => setMembers(m => m.map((mem, idx) => idx === i ? { ...mem, [field]: val } : mem));

  const handleConfirm = () => {
    const team = members
      .filter(m => m.name.trim())
      .map(m => ({ name: m.name.trim(), role: m.role.trim() || 'Founder', skills: m.skills.split(',').map(s => s.trim()).filter(Boolean) }));
    onConfirm(team);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 540, borderRadius: 20, background: T.surface, border: `1px solid ${T.border}`, boxShadow: T.shadowMd, overflow: 'hidden' }}>
        
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: T.text1, margin: 0 }}>Team Setup</h2>
            <p style={{ fontSize: 13, color: T.text2, margin: '2px 0 0' }}>Add team members to map tasks directly to resources.</p>
          </div>
          <button onClick={onCancel} style={{ width: 32, height: 32, borderRadius: 8, background: T.surface2, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.text2, cursor: 'pointer' }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: '20px 24px', maxHeight: 360, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {members.map((m, i) => (
            <div key={i} style={{ background: T.surface2, border: `1px solid ${T.border}`, borderRadius: 12, padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: T.brandLight, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Team Member {i + 1}</span>
                {members.length > 1 && (
                  <button onClick={() => removeMember(i)} style={{ background: 'none', border: 'none', color: T.text3, cursor: 'pointer' }}>
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                <input value={m.name} onChange={e => updateMember(i, 'name', e.target.value)} placeholder="Full Name *" style={{ width: '100%', borderRadius: 8, border: `1px solid ${T.border2}`, background: T.surface, padding: '10px 12px', fontSize: 13, color: T.text1, outline: 'none' }} />
                <input value={m.role} onChange={e => updateMember(i, 'role', e.target.value)} placeholder="Role (e.g. CTO)" style={{ width: '100%', borderRadius: 8, border: `1px solid ${T.border2}`, background: T.surface, padding: '10px 12px', fontSize: 13, color: T.text1, outline: 'none' }} />
              </div>
              <input value={m.skills} onChange={e => updateMember(i, 'skills', e.target.value)} placeholder="Skills (comma-separated: React, Python, Marketing)" style={{ width: '100%', boxSizing: 'border-box', borderRadius: 8, border: `1px solid ${T.border2}`, background: T.surface, padding: '10px 12px', fontSize: 13, color: T.text1, outline: 'none' }} />
            </div>
          ))}
          <button onClick={addMember} style={{ width: '100%', padding: 12, borderRadius: 12, border: `1px dashed ${T.brandBdr}`, background: 'transparent', color: T.brandLight, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <Plus size={14} /> Add Member
          </button>
        </div>

        <div style={{ padding: '20px 24px', borderTop: `1px solid ${T.border}`, display: 'flex', gap: 12 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: '12px', borderRadius: 10, border: `1px solid ${T.border}`, background: T.surface2, color: T.text2, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
          <button onClick={handleConfirm} disabled={isGenerating} style={{ flex: 1, padding: '12px', borderRadius: 10, border: 'none', background: T.brand, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {isGenerating ? 'Generating...' : <><Sparkles size={14} /> Generate Roadmap</>}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main Roadmap Page ────────────────────────────────────────────────────────
const Roadmap = () => {
  const navigate = useNavigate();
  const { user, startupDetails, roadmapNodes, isGeneratingRoadmap, generateRoadmap, updateRoadmapNode, addRoadmapNode, deleteRoadmapNode, manageSubTask, manageNote } = useStartup();
  const { showToast } = useToast();

  const [selectedNodeId, setSelectedNodeId]   = useState(null);
  const [isDrawerOpen, setIsDrawerOpen]       = useState(false);
  const [showTeamModal, setShowTeamModal]     = useState(false);
  const [newTaskText, setNewTaskText]         = useState('');
  const [newNoteText, setNewNoteText]         = useState('');
  const [childTitle, setChildTitle]           = useState('');
  const [childDesc, setChildDesc]             = useState('');
  const [expandedTaskId, setExpandedTaskId]   = useState(null);
  const [isLight, setIsLight]                 = useState(true);

  const T = getTokens(isLight);
  const activeNode = useMemo(() => roadmapNodes.find(n => n.id === selectedNodeId) || null, [roadmapNodes, selectedNodeId]);

  // Layout algo
  const getLayoutedElements = useCallback((nodes) => {
    const parentMap = {};
    nodes.forEach(n => { if (n.parentId) { parentMap[n.parentId] = parentMap[n.parentId] || []; parentMap[n.parentId].push(n); } });
    const root = nodes.find(n => !n.parentId);
    if (!root) return nodes;
    const pos = { [root.id]: { x: 60, y: 300 } };
    const place = (pid, px, py) => {
      const kids = parentMap[pid] || [];
      if (!kids.length) return;
      const gap = 200, total = (kids.length - 1) * gap;
      kids.forEach((k, i) => { pos[k.id] = { x: px + 350, y: py - total / 2 + i * gap }; place(k.id, px + 350, py - total / 2 + i * gap); });
    };
    place(root.id, 60, 300);
    return nodes.map(n => ({ ...n, position: pos[n.id] || { x: 100, y: 100 } }));
  }, []);

  const elements = useMemo(() => {
    const collapsed = new Set(roadmapNodes.filter(n => n.isExpanded === false).map(n => n.id));
    const getDesc = pid => { const kids = roadmapNodes.filter(n => n.parentId === pid); return [...kids.map(k => k.id), ...kids.flatMap(k => getDesc(k.id))]; };
    const hidden = new Set([...collapsed].flatMap(id => getDesc(id)));
    const visible = roadmapNodes.filter(n => !hidden.has(n.id));
    const laid = getLayoutedElements(visible);

    const rfNodes = laid.map(node => {
      const total = node.tasks?.length || 0;
      const done  = node.tasks?.filter(t => t.completed).length || 0;
      return {
        id: node.id, type: 'roadmapNode', position: node.position,
        data: {
          id: node.id, title: node.title, description: node.description,
          status: node.status, priority: node.priority,
          progress: total > 0 ? (done / total) * 100 : 0,
          tasksCount: total, isExpanded: node.isExpanded,
          hasChildren: roadmapNodes.some(n => n.parentId === node.id),
          isSelected: node.id === selectedNodeId,
          isLight,
          onToggleExpand: () => updateRoadmapNode(node.id, { isExpanded: !node.isExpanded }),
          onClick: () => { setSelectedNodeId(node.id); setIsDrawerOpen(true); }
        }
      };
    });

    const rfEdges = visible.filter(n => n.parentId).map(n => ({
      id: `e-${n.parentId}-${n.id}`, source: n.parentId, target: n.id, type: 'smoothstep',
      animated: n.status === 'In Progress',
      style: { stroke: n.status === 'Completed' ? T.success : n.status === 'In Progress' ? T.brandLight : T.border2, strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: n.status === 'Completed' ? T.success : n.status === 'In Progress' ? T.brandLight : T.border2 }
    }));

    return { nodes: rfNodes, edges: rfEdges };
  }, [roadmapNodes, updateRoadmapNode, getLayoutedElements, isLight, selectedNodeId, T]);

  const totals = useMemo(() => {
    const total = roadmapNodes.reduce((a, n) => a + (n.tasks?.length || 0), 0);
    const done  = roadmapNodes.reduce((a, n) => a + (n.tasks?.filter(t => t.completed).length || 0), 0);
    return { total, done, percent: total > 0 ? Math.round((done / total) * 100) : 0 };
  }, [roadmapNodes]);

  const handleGenerateClick = () => {
    if (!user?.userId) { showToast('Please log in again to continue.', 'error'); return; }
    setShowTeamModal(true);
  };

  const handleTeamConfirm = async (team) => {
    await generateRoadmap(team);
    setShowTeamModal(false);
  };

  const handleAddTask   = (e) => { e.preventDefault(); if (!newTaskText.trim()) return; manageSubTask(selectedNodeId, 'add', { text: newTaskText }); setNewTaskText(''); };
  const handleAddNote   = (e) => { e.preventDefault(); if (!newNoteText.trim()) return; manageNote(selectedNodeId, 'add', { text: newNoteText }); setNewNoteText(''); };
  const handleAddChild  = (e) => { e.preventDefault(); if (!childTitle.trim()) return; addRoadmapNode(selectedNodeId, childTitle, childDesc); setChildTitle(''); setChildDesc(''); };
  const handleDeleteNode = () => { if (selectedNodeId === 'root') { showToast('Cannot delete root node.', 'error'); return; } deleteRoadmapNode(selectedNodeId); setIsDrawerOpen(false); setSelectedNodeId(null); };

  return (
    <DashboardLayout activeTab="roadmap">
      <div style={{ background: T.bg, minHeight: 'calc(100vh - 80px)', fontFamily: "'Plus Jakarta Sans','Inter',sans-serif", color: T.text1, padding: 24, transition: 'background 0.3s, color 0.3s', position: 'relative' }}>
        
        {showTeamModal && <TeamModal onConfirm={handleTeamConfirm} onCancel={() => setShowTeamModal(false)} isGenerating={isGeneratingRoadmap} isLight={isLight} />}

        {/* ── HEADER ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 24, borderBottom: `1px solid ${T.border}`, paddingBottom: 24 }}>
          <div>
            <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: T.brandLight, background: T.brandBg, border: `1px solid ${T.brandBdr}`, padding: '4px 12px', borderRadius: 20 }}>
              Execution OS
            </span>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: T.text1, margin: '12px 0 4px', letterSpacing: '-0.02em' }}>{startupDetails.startupName || 'Venture'} Roadmap</h1>
            <p style={{ fontSize: 13, color: T.text2, margin: 0 }}>Visual mission control for your validated product strategy.</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setIsLight(!isLight)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 14px', borderRadius: 8, border: `1px solid ${T.border}`, background: T.surface, color: T.text2, fontSize: 12, fontWeight: 600, cursor: 'pointer', boxShadow: T.shadow }}>
              {isLight ? <Moon size={14} /> : <Sun size={14} />} {isLight ? 'Dark' : 'Light'}
            </button>
            <button onClick={handleGenerateClick} disabled={isGeneratingRoadmap} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 8, border: 'none', background: T.brand, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', boxShadow: T.shadow, opacity: isGeneratingRoadmap ? 0.6 : 1 }}>
              {isGeneratingRoadmap ? 'Generating...' : <><Sparkles size={14} /> {roadmapNodes.length > 0 ? 'Regenerate' : 'Generate Roadmap'}</>}
            </button>
          </div>
        </div>

        {/* ── STATS BAR ── */}
        {roadmapNodes.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16, marginBottom: 24 }}>
            {[
              { label: 'Total Branches', val: roadmapNodes.filter(n => n.parentId === 'root').length, c: T.brandLight },
              { label: 'Action Items',   val: totals.total, c: T.text1 },
              { label: 'Completed',      val: totals.done,  c: T.success },
              { label: 'Velocity',       val: `${totals.percent}%`, c: T.purple },
            ].map((s) => (
              <div key={s.label} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: '16px 20px', boxShadow: T.shadow }}>
                <p style={{ fontSize: 24, fontWeight: 900, color: s.c, margin: 0, fontFamily: "'JetBrains Mono', monospace" }}>{s.val}</p>
                <p style={{ fontSize: 11, fontWeight: 600, color: T.text3, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '4px 0 0' }}>{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── EMPTY STATES ── */}
        {roadmapNodes.length === 0 && !isGeneratingRoadmap && (() => {
          if (!user?.userId) return (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16 }}>
              <AlertTriangle size={48} style={{ color: T.warning, margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: 18, fontWeight: 700, color: T.text1, margin: '0 0 8px' }}>Validation Required</h3>
              <p style={{ fontSize: 14, color: T.text2, margin: '0 auto 24px', maxWidth: 400 }}>Your roadmap is built on validated data. Complete idea validation first.</p>
              <button onClick={() => navigate('/onboarding/role')} style={{ padding: '12px 24px', borderRadius: 8, background: T.warning, color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}>Validate My Idea</button>
            </div>
          );
          return (
            <div style={{ textAlign: 'center', padding: '80px 20px', background: T.surface, border: `1px dashed ${T.border2}`, borderRadius: 16 }}>
              <Compass size={48} style={{ color: T.brandLight, margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: 18, fontWeight: 700, color: T.text1, margin: '0 0 8px' }}>Map Your Journey</h3>
              <p style={{ fontSize: 14, color: T.text2, margin: '0 auto 24px', maxWidth: 450 }}>Generate an AI-powered execution plan tailored to your team's skills and your startup's validation profile.</p>
              <button onClick={handleGenerateClick} style={{ padding: '12px 24px', borderRadius: 8, background: T.brand, color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}><Sparkles size={16} /> Generate Roadmap</button>
            </div>
          );
        })()}

        {/* ── CANVAS ── */}
        {roadmapNodes.length > 0 && (
          <div style={{ width: '100%', height: 600, background: T.surface2, border: `1px solid ${T.border}`, borderRadius: 16, overflow: 'hidden', boxShadow: T.shadowMd, position: 'relative' }}>
            <ReactFlow
              nodes={elements.nodes} edges={elements.edges} nodeTypes={nodeTypes}
              fitView fitViewOptions={{ padding: 0.3 }} minZoom={0.2} maxZoom={2}
              proOptions={{ hideAttribution: true }}
            >
              <Background color={T.border2} gap={24} size={1} />
              <Controls style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, overflow: 'hidden' }} />
              <MiniMap style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8 }} maskColor={isLight ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'} />
            </ReactFlow>
          </div>
        )}

        {/* ── DRAWER (PREMIUM DESIGN) ── */}
        {isDrawerOpen && activeNode && (
          <div style={{
            position: 'fixed', top: 0, right: 0, width: 440, height: '100vh', zIndex: 100,
            background: T.surface, borderLeft: `1px solid ${T.border}`, boxShadow: T.shadowMd,
            display: 'flex', flexDirection: 'column', animation: 'slideIn 0.3s ease-out'
          }}>
            {/* Header */}
            <div style={{ padding: '24px 24px 20px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexShrink: 0, background: T.surface2 }}>
              <div>
                <p style={{ fontSize: 10, fontWeight: 800, color: T.brandLight, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 6px' }}>Branch Detail</p>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: T.text1, margin: 0, lineHeight: 1.3 }}>{activeNode.title}</h3>
              </div>
              <button onClick={() => { setIsDrawerOpen(false); setSelectedNodeId(null); }} style={{ background: T.surface, border: `1px solid ${T.border}`, width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: T.text2 }}><X size={16} /></button>
            </div>

            {/* Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
              
              {/* Properties */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ background: T.surface2, padding: 12, borderRadius: 10, border: `1px solid ${T.border}` }}>
                  <label style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', color: T.text3, letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>Status</label>
                  <select value={activeNode.status} onChange={e => updateRoadmapNode(activeNode.id, { status: e.target.value })} style={{ width: '100%', background: 'transparent', border: 'none', fontSize: 13, fontWeight: 700, color: T.text1, outline: 'none', cursor: 'pointer' }}>
                    {['Pending','In Progress','Completed','Blocked'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div style={{ background: T.surface2, padding: 12, borderRadius: 10, border: `1px solid ${T.border}` }}>
                  <label style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', color: T.text3, letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>Priority</label>
                  <select value={activeNode.priority} onChange={e => updateRoadmapNode(activeNode.id, { priority: e.target.value })} style={{ width: '100%', background: 'transparent', border: 'none', fontSize: 13, fontWeight: 700, color: T.text1, outline: 'none', cursor: 'pointer' }}>
                    {['Low','Medium','High'].map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              {/* Summary */}
              {activeNode.recommendations && (
                <div style={{ background: T.brandBg, border: `1px solid ${T.brandBdr}`, borderRadius: 12, padding: 16 }}>
                  <p style={{ fontSize: 10, fontWeight: 800, color: T.brandLight, textTransform: 'uppercase', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 6 }}><Sparkles size={12} /> AI Insight</p>
                  <p style={{ fontSize: 13, color: T.text1, margin: 0, lineHeight: 1.6 }}>{activeNode.recommendations}</p>
                </div>
              )}

              {/* Tasks */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: T.text1 }}>Action Items</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: T.brandLight }}>{activeNode.tasks?.filter(t=>t.completed).length || 0} / {activeNode.tasks?.length || 0}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {activeNode.tasks?.map(t => (
                    <div key={t.id} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: 14, boxShadow: T.shadow }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                        <input type="checkbox" checked={t.completed} onChange={() => manageSubTask(selectedNodeId, 'toggle', { id: t.id })} style={{ marginTop: 3, width: 16, height: 16, cursor: 'pointer', accentColor: T.brand }} />
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: t.completed ? T.text3 : T.text1, textDecoration: t.completed ? 'line-through' : 'none', margin: '0 0 8px', lineHeight: 1.4 }}>{t.text}</p>
                          
                          {/* Rich Metadata Pills */}
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {t.assignedTo && t.assignedTo !== 'Unassigned' && (
                              <span style={{ display: 'flex', alignItems: 'center', gap: 4, background: T.purpleBg, border: `1px solid ${T.purpleBdr}`, color: T.purple, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6 }}>
                                <User size={10} /> {t.assignedTo}
                              </span>
                            )}
                            {t.complexity && (
                              <span style={{ background: T.surface2, border: `1px solid ${T.border2}`, color: T.text2, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6 }}>
                                <Activity size={10} style={{ verticalAlign: 'middle', marginRight: 2 }} /> {t.complexity}
                              </span>
                            )}
                            {t.costImpact && t.costImpact !== 'None' && (
                              <span style={{ background: T.warningBg, border: `1px solid ${T.warningBdr}`, color: T.warning, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6 }}>
                                {t.costImpact} Cost
                              </span>
                            )}
                          </div>
                          
                          {t.description && (
                            <div style={{ marginTop: 8 }}>
                              <p style={{ fontSize: 11, color: T.text2, margin: 0, lineHeight: 1.5 }}>{t.description}</p>
                            </div>
                          )}
                        </div>
                        <button onClick={() => manageSubTask(selectedNodeId, 'delete', { id: t.id })} style={{ background: 'none', border: 'none', color: T.text3, cursor: 'pointer' }}><Trash2 size={14} /></button>
                      </div>
                    </div>
                  ))}
                  <form onSubmit={handleAddTask} style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                    <input value={newTaskText} onChange={e => setNewTaskText(e.target.value)} placeholder="Add a new task..." style={{ flex: 1, padding: '10px 12px', borderRadius: 8, border: `1px solid ${T.border}`, background: T.surface2, color: T.text1, fontSize: 12, outline: 'none' }} />
                    <button type="submit" style={{ width: 36, height: 36, borderRadius: 8, background: T.brand, color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={16} /></button>
                  </form>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div style={{ padding: 20, borderTop: `1px solid ${T.border}`, background: T.surface }}>
              <button onClick={handleDeleteNode} disabled={activeNode.id === 'root'} style={{ width: '100%', padding: '12px', borderRadius: 10, background: T.dangerBg, border: `1px solid ${T.dangerBdr}`, color: T.danger, fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: activeNode.id === 'root' ? 0.4 : 1 }}>
                <Trash2 size={14} /> Delete Branch
              </button>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default Roadmap;
