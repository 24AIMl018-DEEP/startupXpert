import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactFlow, { MiniMap, Controls, Background, MarkerType, Handle, Position } from 'reactflow';
import 'reactflow/dist/style.css';
import { useStartup } from '../context/StartupContext';
import { useToast } from '../context/ToastContext';
import DashboardLayout from '../layouts/DashboardLayout';
import {
  Plus, Trash2, Compass, X, Check, Sparkles, Download,
  PlusCircle, User, Users, Clock, AlertTriangle, CheckCircle2,
  ChevronDown, ChevronUp, Lock
} from 'lucide-react';
import jsPDF from 'jspdf';

// ── Custom ReactFlow Node ─────────────────────────────────────────────────────
const CustomRoadmapNode = ({ data }) => {
  const isRoot = data.id === 'root';
  const borderMap = {
    Completed:   'border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.15)]',
    'In Progress':'border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.2)]',
    Blocked:     'border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.15)]',
  };
  const badgeMap = {
    Completed:   'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    'In Progress':'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    Blocked:     'bg-rose-500/10 text-rose-400 border-rose-500/20',
  };
  const borderClass = borderMap[data.status] || 'border-indigo-500/10';
  const badgeClass  = badgeMap[data.status]  || 'bg-gray-500/10 text-gray-400 border-gray-500/20';
  const priorityClass = data.priority === 'High'
    ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
    : data.priority === 'Medium'
      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
      : 'bg-slate-500/10 text-slate-400 border-slate-500/20';

  return (
    <div
      onClick={data.onClick}
      className={`p-4 rounded-xl border bg-[#0e0e16]/95 backdrop-blur-md transition-all duration-300 min-w-[240px] max-w-[280px] text-left relative cursor-pointer hover:scale-[1.02] hover:border-indigo-500/40 select-none ${borderClass}`}
    >
      {!isRoot && <Handle type="target" position={Position.Left} style={{ background: '#6366f1', width: 8, height: 8, border: '2px solid #0e0e16' }} />}

      <div className="space-y-2">
        <div className="flex justify-between items-center gap-2">
          <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded tracking-wider border ${badgeClass}`}>{data.status}</span>
          <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded tracking-wider border ${priorityClass}`}>{data.priority || 'Medium'}</span>
        </div>
        <h4 className="text-xs font-bold text-white truncate">{data.title}</h4>
        <p className="text-[10px] text-gray-500 line-clamp-2 leading-relaxed">{data.description}</p>

        {data.tasksCount > 0 && (
          <div className="pt-1.5 border-t border-indigo-500/5 space-y-1">
            <div className="flex justify-between text-[9px] font-mono text-gray-500">
              <span>{data.tasksCount} tasks</span>
              <span>{Math.round(data.progress)}%</span>
            </div>
            <div className="h-1.5 w-full bg-[#0a0a0f] rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full" style={{ width: `${data.progress}%` }} />
            </div>
          </div>
        )}
      </div>

      {data.hasChildren && (
        <button
          onClick={(e) => { e.stopPropagation(); data.onToggleExpand(); }}
          className="absolute -right-3 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full border border-indigo-500/30 bg-[#0e0e16] hover:bg-indigo-600 text-indigo-400 hover:text-white text-xs font-bold z-20"
        >
          {data.isExpanded ? '−' : '+'}
        </button>
      )}
      <Handle type="source" position={Position.Right} style={{ background: '#6366f1', width: 8, height: 8, border: '2px solid #0e0e16' }} />
    </div>
  );
};

const nodeTypes = { roadmapNode: CustomRoadmapNode };

// ── Team Input Modal ──────────────────────────────────────────────────────────
const TeamModal = ({ onConfirm, onCancel, isGenerating }) => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl border border-indigo-500/20 bg-[#0e0e16] shadow-[0_0_60px_rgba(99,102,241,0.15)] overflow-hidden">

        <div className="px-6 py-5 border-b border-indigo-500/10 flex items-center justify-between">
          <div>
            <h2 className="font-heading text-base font-bold text-white">Team Setup</h2>
            <p className="text-xs text-gray-500 mt-0.5">Add your team members — the AI will assign tasks based on roles and skills.</p>
          </div>
          <button onClick={onCancel} className="h-8 w-8 flex items-center justify-center rounded-lg bg-indigo-500/5 text-gray-500 hover:text-white transition-all">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6 py-4 space-y-3 max-h-72 overflow-y-auto">
          {members.map((m, i) => (
            <div key={i} className="rounded-xl border border-indigo-500/10 bg-[#0a0a0f] p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Member {i + 1}</span>
                {members.length > 1 && (
                  <button onClick={() => removeMember(i)} className="text-gray-600 hover:text-rose-400 transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input value={m.name} onChange={e => updateMember(i, 'name', e.target.value)} placeholder="Full Name *" className="rounded-lg border border-indigo-500/10 bg-[#0e0e16] px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none" />
                <input value={m.role} onChange={e => updateMember(i, 'role', e.target.value)} placeholder="Role (e.g. CTO)" className="rounded-lg border border-indigo-500/10 bg-[#0e0e16] px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none" />
              </div>
              <input value={m.skills} onChange={e => updateMember(i, 'skills', e.target.value)} placeholder="Skills (comma-separated: React, Python, Marketing)" className="w-full rounded-lg border border-indigo-500/10 bg-[#0e0e16] px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none" />
            </div>
          ))}
          <button onClick={addMember} className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-indigo-500/20 py-2.5 text-xs text-indigo-400 hover:border-indigo-500/40 hover:text-indigo-300 transition-all">
            <Plus className="h-3.5 w-3.5" />Add Member
          </button>
        </div>

        <div className="px-6 py-4 border-t border-indigo-500/10 flex gap-3">
          <button onClick={onCancel} className="flex-1 rounded-lg border border-indigo-500/10 bg-indigo-500/5 py-2.5 text-xs font-bold text-gray-400 hover:text-white transition-all">
            Cancel
          </button>
          <button onClick={handleConfirm} disabled={isGenerating} className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 py-2.5 text-xs font-bold text-white transition-all">
            {isGenerating ? <><div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />Generating...</> : <><Sparkles className="h-3.5 w-3.5" />Generate Roadmap</>}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main Roadmap Page ─────────────────────────────────────────────────────────
const Roadmap = () => {
  const navigate = useNavigate();
  const { user, startupDetails, analysisScores, roadmapNodes, roadmapData, isGeneratingRoadmap, generateRoadmap, updateRoadmapNode, addRoadmapNode, deleteRoadmapNode, manageSubTask, manageNote } = useStartup();
  const { showToast } = useToast();

  const [selectedNodeId, setSelectedNodeId]   = useState(null);
  const [isDrawerOpen, setIsDrawerOpen]       = useState(false);
  const [showTeamModal, setShowTeamModal]     = useState(false);
  const [newTaskText, setNewTaskText]         = useState('');
  const [newNoteText, setNewNoteText]         = useState('');
  const [childTitle, setChildTitle]           = useState('');
  const [childDesc, setChildDesc]             = useState('');
  const [expandedTaskId, setExpandedTaskId]   = useState(null);

  const activeNode = useMemo(() => roadmapNodes.find(n => n.id === selectedNodeId) || null, [roadmapNodes, selectedNodeId]);

  // ── Layout algorithm ───────────────────────────────────────────────────────
  const getLayoutedElements = useCallback((nodes) => {
    const parentMap = {};
    nodes.forEach(n => { if (n.parentId) { parentMap[n.parentId] = parentMap[n.parentId] || []; parentMap[n.parentId].push(n); } });
    const root = nodes.find(n => !n.parentId);
    if (!root) return nodes;
    const pos = { [root.id]: { x: 60, y: 300 } };
    const place = (pid, px, py) => {
      const kids = parentMap[pid] || [];
      if (!kids.length) return;
      const gap = 170, total = (kids.length - 1) * gap;
      kids.forEach((k, i) => { pos[k.id] = { x: px + 290, y: py - total / 2 + i * gap }; place(k.id, px + 290, py - total / 2 + i * gap); });
    };
    place(root.id, 60, 300);
    return nodes.map(n => ({ ...n, position: pos[n.id] || { x: 100, y: 100 } }));
  }, []);

  // ── ReactFlow elements ─────────────────────────────────────────────────────
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
          onToggleExpand: () => updateRoadmapNode(node.id, { isExpanded: !node.isExpanded }),
          onClick: () => { setSelectedNodeId(node.id); setIsDrawerOpen(true); }
        }
      };
    });

    const rfEdges = visible.filter(n => n.parentId).map(n => ({
      id: `e-${n.parentId}-${n.id}`, source: n.parentId, target: n.id, type: 'smoothstep',
      animated: n.status === 'In Progress',
      style: { stroke: n.status === 'Completed' ? '#10b981' : n.status === 'In Progress' ? '#6366f1' : 'rgba(99,102,241,0.2)', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: n.status === 'Completed' ? '#10b981' : n.status === 'In Progress' ? '#6366f1' : 'rgba(99,102,241,0.2)' }
    }));

    return { nodes: rfNodes, edges: rfEdges };
  }, [roadmapNodes, updateRoadmapNode, getLayoutedElements]);

  const totals = useMemo(() => {
    const total = roadmapNodes.reduce((a, n) => a + (n.tasks?.length || 0), 0);
    const done  = roadmapNodes.reduce((a, n) => a + (n.tasks?.filter(t => t.completed).length || 0), 0);
    return { total, done, percent: total > 0 ? Math.round((done / total) * 100) : 0 };
  }, [roadmapNodes]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleGenerateClick = () => {
    // Gate: must have a validated session — check via user.userId (DB-backed)
    // roadmapNodes check: if user has roadmap nodes loaded, they came from DB already
    if (!user?.userId) {
      showToast('Please log in again to continue.', 'error');
      return;
    }
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

  const depStatusColor = (s) => {
    if (s === 'Ready') return 'text-emerald-400';
    if (s === 'Blocked') return 'text-rose-400';
    return 'text-gray-400';
  };

  return (
    <DashboardLayout activeTab="roadmap">
      <div className="space-y-5 text-left relative" style={{ minHeight: 'calc(100vh - 80px)' }}>

        {/* Team Modal */}
        {showTeamModal && (
          <TeamModal
            onConfirm={handleTeamConfirm}
            onCancel={() => setShowTeamModal(false)}
            isGenerating={isGeneratingRoadmap}
          />
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-indigo-500/5 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">Startup OS</span>
            <h1 className="font-heading text-2xl font-extrabold text-white mt-1">
              {startupDetails.startupName || 'Venture'} — AI Roadmap
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {roadmapNodes.length > 0 ? 'Click any branch to view tasks, assign notes, and track progress.' : 'Generate a personalized AI roadmap based on your validation results.'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={handleGenerateClick}
              disabled={isGeneratingRoadmap}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider shadow-lg shadow-indigo-600/10 transition-all"
            >
              {isGeneratingRoadmap
                ? <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />Generating...</>
                : <><Sparkles className="h-4 w-4" />{roadmapNodes.length > 0 ? 'Regenerate' : 'Generate Roadmap'}</>}
            </button>
          </div>
        </div>

        {/* Stats bar */}
        {roadmapNodes.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 rounded-xl border border-indigo-500/5 bg-indigo-950/10 p-4">
            {[
              ['Branches',   roadmapNodes.filter(n => n.parentId === 'root').length, 'text-indigo-400'],
              ['Total Tasks',totals.total, 'text-white'],
              ['Completed',  totals.done,  'text-emerald-400'],
              ['Progress',   `${totals.percent}%`, 'text-cyan-400'],
            ].map(([label, val, cls]) => (
              <div key={label} className="text-center">
                <p className={`text-xl font-black font-mono ${cls}`}>{val}</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Empty State — two variants: no validation vs validated but no roadmap */}
        {roadmapNodes.length === 0 && !isGeneratingRoadmap && (() => {
          // Use user.userId presence as proxy for "has validated" — actual check happens in generateRoadmap
          const hasValidatedSession = !!user?.userId;

          if (!hasValidatedSession) {
            // No validated idea at all
            return (
              <div className="rounded-2xl border border-amber-500/15 bg-amber-950/10 p-16 text-center space-y-5">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/5 text-amber-400">
                  <AlertTriangle className="h-8 w-8" />
                </div>
                <div className="space-y-2 max-w-sm mx-auto">
                  <h3 className="text-base font-bold text-white">Validate an Idea First</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Your roadmap is built on validated data. Complete the idea validation process before generating a roadmap.
                  </p>
                </div>
                <button
                  onClick={() => navigate('/onboarding/role')}
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white px-6 py-3 text-xs font-bold uppercase tracking-wider transition-all"
                >
                  <Plus className="h-4 w-4" />Validate My Idea
                </button>
              </div>
            );
          }

          // Has a validated idea, just no roadmap generated yet
          return (
            <div className="rounded-2xl border border-indigo-500/10 bg-[#0e0e16]/60 p-16 text-center space-y-5">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-500/5 text-indigo-400">
                <Compass className="h-8 w-8" />
              </div>
              <div className="space-y-2 max-w-sm mx-auto">
                <h3 className="text-base font-bold text-white">No Roadmap Generated Yet</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Your idea is validated. Click <span className="text-indigo-400 font-semibold">Generate Roadmap</span> to build a personalized execution plan — add your team and the AI assigns tasks by role and skill.
                </p>
              </div>
              <button
                onClick={handleGenerateClick}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 text-xs font-bold uppercase tracking-wider shadow-lg shadow-indigo-600/10 transition-all"
              >
                <Sparkles className="h-4 w-4" />Generate My Roadmap
              </button>
            </div>
          );
        })()}

        {/* Loading state */}
        {isGeneratingRoadmap && (
          <div className="rounded-2xl border border-indigo-500/10 bg-[#0e0e16]/60 p-16 text-center space-y-4">
            <div className="mx-auto h-12 w-12 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
            <p className="text-sm font-bold text-white">AI is building your roadmap...</p>
            <p className="text-xs text-gray-500">Analyzing validation data, assigning tasks, mapping dependencies.</p>
          </div>
        )}

        {/* Canvas */}
        {roadmapNodes.length > 0 && (
          <div className="w-full border border-indigo-500/10 bg-[#0e0e16]/40 rounded-2xl overflow-hidden relative shadow-[0_0_50px_rgba(0,0,0,0.5)]" style={{ height: '580px' }}>
            <ReactFlow
              nodes={elements.nodes}
              edges={elements.edges}
              nodeTypes={nodeTypes}
              fitView
              fitViewOptions={{ padding: 0.3 }}
              minZoom={0.15}
              maxZoom={2}
              style={{ width: '100%', height: '100%' }}
              proOptions={{ hideAttribution: true }}
            >
              <Background color="rgba(99,102,241,0.04)" gap={16} size={1} />
              <Controls className="!bg-[#0e0e16] !border-indigo-500/20" />
              <MiniMap className="!bg-[#0e0e16]/90 !border-indigo-500/20" nodeColor={() => '#1e1e2f'} maskColor="rgba(10,10,15,0.6)" />
            </ReactFlow>

            {/* Legend */}
            <div className="absolute left-4 bottom-4 p-2.5 rounded-lg border border-indigo-500/10 bg-[#0e0e16]/90 pointer-events-none text-[10px] space-y-1 z-10 text-gray-400">
              {[['bg-indigo-500','In Progress'],['bg-emerald-500','Completed'],['bg-rose-500','Blocked'],['bg-gray-600','Pending']].map(([color, label]) => (
                <div key={label} className="flex items-center gap-1.5"><span className={`h-2 w-2 rounded-full ${color}`} />{label}</div>
              ))}
            </div>
          </div>
        )}

        {/* Detail Drawer */}
        {isDrawerOpen && activeNode && (
          <div className="fixed top-0 right-0 h-screen w-[420px] z-50 border-l border-indigo-500/10 bg-[#0d0d14]/97 shadow-[-20px_0_60px_rgba(0,0,0,0.7)] backdrop-blur-md flex flex-col text-left">

            {/* Drawer header */}
            <div className="p-5 border-b border-indigo-500/5 flex items-center justify-between shrink-0">
              <div>
                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Branch Detail</p>
                <p className="text-sm font-bold text-white mt-0.5 truncate max-w-[300px]">{activeNode.title}</p>
              </div>
              <button onClick={() => { setIsDrawerOpen(false); setSelectedNodeId(null); }} className="h-8 w-8 flex items-center justify-center rounded-lg bg-indigo-500/5 text-gray-500 hover:text-white transition-all">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-grow overflow-y-auto p-5 space-y-5">

              {/* Status / Priority */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Status</label>
                  <select value={activeNode.status} onChange={e => updateRoadmapNode(activeNode.id, { status: e.target.value })} className="w-full rounded-lg border border-indigo-500/10 bg-[#0a0a0f] px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none cursor-pointer">
                    {['Pending','In Progress','Completed','Blocked'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Priority</label>
                  <select value={activeNode.priority} onChange={e => updateRoadmapNode(activeNode.id, { priority: e.target.value })} className="w-full rounded-lg border border-indigo-500/10 bg-[#0a0a0f] px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none cursor-pointer">
                    {['Low','Medium','High'].map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              {/* Summary */}
              {activeNode.recommendations && (
                <div className="rounded-lg bg-indigo-500/5 border border-indigo-500/10 p-3">
                  <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-1">AI Summary</p>
                  <p className="text-xs text-gray-300 leading-relaxed">{activeNode.recommendations}</p>
                </div>
              )}

              {/* Tasks from backend — rich display */}
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b border-indigo-500/5 pb-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tasks ({activeNode.tasks?.length || 0})</span>
                  <span className="text-[10px] text-indigo-400 font-mono">{activeNode.tasks?.filter(t => t.completed).length || 0} / {activeNode.tasks?.length || 0} done</span>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {activeNode.tasks?.length > 0 ? activeNode.tasks.map(t => {
                    const isBlocked = t.status === 'Blocked' || t.depStatus === 'Blocked';
                    return (
                      <div key={t.id} className="rounded-lg border border-indigo-500/5 bg-[#0a0a0f] overflow-hidden">
                        {/* Task row */}
                        <div className="flex items-start gap-2.5 p-2.5">
                          <input type="checkbox" checked={t.completed} onChange={() => manageSubTask(selectedNodeId, 'toggle', { id: t.id })} className="mt-0.5 h-3.5 w-3.5 rounded border-indigo-500/30 text-indigo-600 cursor-pointer shrink-0" />
                          <div className="flex-grow min-w-0 text-left">
                            <p className={`text-xs leading-relaxed ${t.completed ? 'text-gray-500 line-through' : 'text-gray-200'}`}>{t.text}</p>
                            
                            {/* Rich metadata from backend */}
                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                              {t.assignedTo && t.assignedTo !== 'Unassigned' && (
                                <span className="flex items-center gap-1 rounded bg-indigo-950 border border-indigo-500/20 px-1.5 py-0.5 text-[9px] font-bold text-indigo-300">
                                  <User className="h-2.5 w-2.5" />
                                  {t.assignedTo}
                                  {t.assigneeRole && <span className="text-[8px] text-indigo-400 font-medium">({t.assigneeRole})</span>}
                                </span>
                              )}
                              {t.priority && (
                                <span className={`rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase ${t.priority === 'High' ? 'bg-rose-950 border-rose-500/20 text-rose-300' : t.priority === 'Medium' ? 'bg-amber-950 border-amber-500/20 text-amber-300' : 'bg-slate-900 border-slate-500/20 text-slate-300'}`}>
                                  {t.priority}
                                </span>
                              )}
                              {t.complexity && (
                                <span className="rounded bg-cyan-950 border border-cyan-500/20 px-1.5 py-0.5 text-[9px] font-bold text-cyan-300">
                                  {t.complexity} Complexity
                                </span>
                              )}
                              {t.costImpact && t.costImpact !== 'None' && (
                                <span className="rounded bg-purple-950 border border-purple-500/20 px-1.5 py-0.5 text-[9px] font-bold text-purple-300">
                                  {t.costImpact} Cost
                                </span>
                              )}
                              {t.depStatus && (
                                <span className={`flex items-center gap-1 text-[9px] font-bold ${depStatusColor(t.depStatus)}`}>
                                  {isBlocked ? <Lock className="h-2.5 w-2.5" /> : <CheckCircle2 className="h-2.5 w-2.5" />}
                                  {t.depStatus}
                                </span>
                              )}
                            </div>

                            {/* Blocking dependencies list */}
                            {isBlocked && t.blockedBy && t.blockedBy.length > 0 && (
                              <div className="mt-2 text-[9px] font-medium text-rose-400 bg-rose-950/10 border border-rose-500/10 px-2 py-1 rounded flex items-center gap-1">
                                <span>⚠️ Blocked by:</span>
                                <span className="truncate max-w-[200px]" title={t.blockedBy.join(', ')}>
                                  {t.blockedBy.map(bId => bId.replace(/^.*?_task_/, 'Task ')).join(', ')}
                                </span>
                              </div>
                            )}

                            {/* Description expand */}
                            {t.description && (
                              <button onClick={() => setExpandedTaskId(expandedTaskId === t.id ? null : t.id)} className="flex items-center gap-1 text-[9px] text-gray-600 hover:text-indigo-400 mt-1 transition-colors">
                                {expandedTaskId === t.id ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                {expandedTaskId === t.id ? 'Hide' : 'Details'}
                              </button>
                            )}
                            {expandedTaskId === t.id && t.description && (
                              <p className="text-[10px] text-gray-400 mt-1.5 leading-relaxed border-t border-indigo-500/5 pt-1.5">{t.description}</p>
                            )}
                          </div>
                          <button onClick={() => manageSubTask(selectedNodeId, 'delete', { id: t.id })} className="text-gray-600 hover:text-rose-400 shrink-0 p-0.5">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  }) : (
                    <p className="text-xs text-gray-600 italic py-2">No tasks. Add one below.</p>
                  )}
                </div>

                <form onSubmit={handleAddTask} className="flex gap-2">
                  <input value={newTaskText} onChange={e => setNewTaskText(e.target.value)} placeholder="Add a task..." className="flex-grow rounded-lg border border-indigo-500/10 bg-[#0a0a0f] px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none" />
                  <button type="submit" className="h-8 w-8 flex items-center justify-center rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shrink-0">
                    <Plus className="h-4 w-4" />
                  </button>
                </form>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <div className="border-b border-indigo-500/5 pb-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Notes ({activeNode.notes?.length || 0})</span>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {activeNode.notes?.length > 0 ? activeNode.notes.map(n => (
                    <div key={n.id} className="p-2.5 rounded-lg border border-indigo-500/5 bg-[#0a0a0f] relative group">
                      <button onClick={() => manageNote(selectedNodeId, 'delete', { id: n.id })} className="absolute right-2 top-2 text-gray-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all">
                        <Trash2 className="h-3 w-3" />
                      </button>
                      <p className="text-[9px] text-indigo-400 font-mono mb-1">{new Date(n.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                      <p className="text-xs text-gray-300 leading-relaxed pr-4">{n.text}</p>
                    </div>
                  )) : <p className="text-xs text-gray-600 italic py-2">No notes yet.</p>}
                </div>
                <form onSubmit={handleAddNote} className="flex gap-2">
                  <input value={newNoteText} onChange={e => setNewNoteText(e.target.value)} placeholder="Log a note..." className="flex-grow rounded-lg border border-indigo-500/10 bg-[#0a0a0f] px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none" />
                  <button type="submit" className="h-8 w-8 flex items-center justify-center rounded-lg border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 hover:bg-indigo-600 hover:text-white shrink-0">
                    <Plus className="h-4 w-4" />
                  </button>
                </form>
              </div>

              {/* Add child branch */}
              <div className="border-t border-indigo-500/5 pt-4 space-y-2">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Add Sub-Branch</span>
                <form onSubmit={handleAddChild} className="space-y-2">
                  <input value={childTitle} onChange={e => setChildTitle(e.target.value)} placeholder="Branch Title..." className="w-full rounded-lg border border-indigo-500/10 bg-[#0a0a0f] px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none" />
                  <input value={childDesc} onChange={e => setChildDesc(e.target.value)} placeholder="Description (optional)..." className="w-full rounded-lg border border-indigo-500/10 bg-[#0a0a0f] px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none" />
                  <button type="submit" className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-indigo-500/20 bg-indigo-500/5 px-4 py-2 text-xs font-bold uppercase text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all">
                    <PlusCircle className="h-3.5 w-3.5" />Create Sub-Branch
                  </button>
                </form>
              </div>
            </div>

            {/* Drawer footer */}
            <div className="p-5 border-t border-indigo-500/5 shrink-0">
              <button onClick={handleDeleteNode} disabled={activeNode.id === 'root'} className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-transparent bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white py-2.5 text-xs font-bold uppercase disabled:opacity-20 disabled:pointer-events-none transition-all">
                <Trash2 className="h-3.5 w-3.5" />Delete Branch
              </button>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default Roadmap;
