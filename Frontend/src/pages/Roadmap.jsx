import React, { useState, useCallback, useMemo } from 'react';
import ReactFlow, { MiniMap, Controls, Background, MarkerType, Handle, Position } from 'reactflow';
import 'reactflow/dist/style.css';
import { useStartup } from '../context/StartupContext';
import { useToast } from '../context/ToastContext';
import DashboardLayout from '../layouts/DashboardLayout';
import { Plus, Trash2, Compass, X, Sparkles, Clock, ChevronDown } from 'lucide-react';

/* ─── helpers ─────────────────────────────────────── */
const statusMeta = (status) => ({
  Completed:    { color: 'var(--green)',  badgeClass: 'badge badge-green'  },
  'In Progress':{ color: 'var(--brand)', badgeClass: 'badge badge-brand'  },
  Blocked:      { color: 'var(--red)',   badgeClass: 'badge badge-red'    },
  Pending:      { color: 'var(--text3)', badgeClass: 'badge badge-ghost'  },
}[status] || { color: 'var(--text3)', badgeClass: 'badge badge-ghost' });

const priorityBadgeClass = (p = '') =>
  p === 'High' ? 'badge badge-red' : p === 'Medium' ? 'badge badge-amber' : 'badge badge-ghost';

const fmt = (iso) => new Date(iso).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });

/* ─── ReactFlow node ──────────────────────────────── */
const RoadmapNode = ({ data }) => {
  const isRoot = data.id === 'root';
  const sc     = statusMeta(data.status);
  const done   = data.tasks?.filter(t => t.completed).length || 0;
  const total  = data.tasks?.length || 0;
  const pct    = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <div onClick={data.onClick} className={isRoot ? 'rn rn-root' : `rn${data.selected ? ' rn-sel' : ''}`}>
      {!isRoot && <Handle type="target" position={Position.Left} style={{ background: sc.color, width:7, height:7, border:'2px solid var(--surface)' }} />}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
        <span className={sc.badgeClass}>{data.status}</span>
        {total > 0 && <span style={{ fontSize:10, color:'var(--text3)', fontWeight:600 }}>{done}/{total}</span>}
      </div>
      <div style={{ fontSize: isRoot?13:12, fontWeight:700, color:'var(--text1)', marginBottom:4, lineHeight:1.35 }}>{data.title}</div>
      {data.description && (
        <div style={{ fontSize:11, color:'var(--text2)', lineHeight:1.5, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden', marginBottom: total>0?8:0 }}>
          {data.description}
        </div>
      )}
      {total > 0 && (
        <div>
          <div className="progress-track" style={{ height:3 }}>
            <div className="progress-fill" style={{ width:`${pct}%`, height:'100%' }} />
          </div>
          <div style={{ fontSize:10, color:'var(--text3)', marginTop:3, textAlign:'right' }}>{pct}%</div>
        </div>
      )}
      <Handle type="source" position={Position.Right} style={{ background: sc.color, width:7, height:7, border:'2px solid var(--surface)' }} />
    </div>
  );
};
const nodeTypes = { rn: RoadmapNode };

/* ─── Team Modal ──────────────────────────────────── */
const TeamModal = ({ onConfirm, onCancel, isGenerating }) => {
  const [members, setMembers] = useState([{ name:'', role:'', skills:'' }]);
  const add    = () => setMembers(m => [...m, { name:'', role:'', skills:'' }]);
  const remove = i => setMembers(m => m.filter((_,j) => j!==i));
  const update = (i,f,v) => setMembers(m => m.map((x,j) => j===i ? {...x,[f]:v} : x));
  const confirm = () => onConfirm(
    members.filter(m => m.name.trim()).map(m => ({
      name: m.name.trim(), role: m.role.trim() || 'Founder',
      skills: m.skills.split(',').map(s => s.trim()).filter(Boolean),
    }))
  );
  return (
    <div style={{ position:'fixed', inset:0, zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.65)', backdropFilter:'blur(6px)', padding:16 }}>
      <div className="glass-card animate-scale-in" style={{ width:'100%', maxWidth:480, overflow:'hidden' }}>
        <div style={{ padding:'18px 20px 16px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <div>
            <div style={{ fontSize:15, fontWeight:700, color:'var(--text1)' }}>Team Setup</div>
            <div style={{ fontSize:12, color:'var(--text2)', marginTop:2 }}>Add team members for task assignment.</div>
          </div>
          <button onClick={onCancel} className="btn btn-ghost btn-icon"><X size={14}/></button>
        </div>
        <div style={{ padding:'14px 20px', maxHeight:320, overflowY:'auto', display:'flex', flexDirection:'column', gap:10 }}>
          {members.map((m,i) => (
            <div key={i} style={{ background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:'var(--r-md)', padding:12 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
                <span style={{ fontSize:10, fontWeight:700, color:'var(--brand-light)', textTransform:'uppercase', letterSpacing:'0.07em' }}>Member {i+1}</span>
                {members.length > 1 && <button onClick={() => remove(i)} className="btn btn-ghost btn-icon-sm"><Trash2 size={12}/></button>}
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:8 }}>
                <input value={m.name}   onChange={e => update(i,'name',  e.target.value)} placeholder="Name *" />
                <input value={m.role}   onChange={e => update(i,'role',  e.target.value)} placeholder="Role (e.g. CTO)" />
              </div>
              <input value={m.skills} onChange={e => update(i,'skills',e.target.value)} placeholder="Skills: React, Python…" />
            </div>
          ))}
          <button onClick={add} style={{ padding:8, borderRadius:'var(--r)', border:'1px dashed var(--brand-border)', background:'transparent', color:'var(--brand-light)', fontSize:12, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
            <Plus size={13}/> Add Member
          </button>
        </div>
        <div style={{ padding:'14px 20px', borderTop:'1px solid var(--border)', display:'flex', gap:10 }}>
          <button onClick={onCancel} className="btn btn-outline" style={{ flex:1 }}>Cancel</button>
          <button onClick={confirm} disabled={isGenerating} className="btn btn-primary" style={{ flex:1, gap:6 }}>
            {isGenerating
              ? <><div style={{ width:14, height:14, border:'2px solid rgba(255,255,255,0.4)', borderTopColor:'#fff', borderRadius:'50%', animation:'spinSlow 0.8s linear infinite' }}/> Generating…</>
              : <><Sparkles size={13}/> Generate</>}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Main ────────────────────────────────────────── */
const Roadmap = () => {
  const {
    user, roadmapNodes, allRoadmaps, isGeneratingRoadmap,
    generateRoadmap, updateRoadmapNode, deleteRoadmapNode, manageSubTask, loadRoadmapBySession,
  } = useStartup();
  const { showToast } = useToast();

  const [selectedId,    setSelectedId]    = useState(null);
  const [drawerOpen,    setDrawerOpen]    = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [newTask,       setNewTask]       = useState('');
  const [historyOpen,   setHistoryOpen]   = useState(false);
  const [loadingHist,   setLoadingHist]   = useState(false);

  const activeNode = useMemo(
    () => roadmapNodes.find(n => n.id === selectedId) || null,
    [roadmapNodes, selectedId]
  );

  /* ── Layout ── */
  const layout = useCallback((nodes) => {
    const kids = {};
    nodes.forEach(n => { if (n.parentId) { kids[n.parentId] = kids[n.parentId] || []; kids[n.parentId].push(n); } });
    const root = nodes.find(n => !n.parentId);
    if (!root) return nodes;
    const pos = { [root.id]: { x:60, y:260 } };
    const place = (pid, px, py) => {
      const ch = kids[pid] || [];
      const gap = 190, total = (ch.length-1)*gap;
      ch.forEach((k,i) => { pos[k.id] = { x:px+320, y:py-total/2+i*gap }; place(k.id, px+320, py-total/2+i*gap); });
    };
    place(root.id, 60, 260);
    return nodes.map(n => ({ ...n, position: pos[n.id] || { x:100, y:100 } }));
  }, []);

  const { nodes: rfNodes, edges: rfEdges } = useMemo(() => {
    const laid = layout(roadmapNodes);
    const rNodes = laid.map(n => ({
      id: n.id, type:'rn', position: n.position,
      data: { id:n.id, title:n.title, description:n.description, status:n.status, tasks:n.tasks, selected:n.id===selectedId,
              onClick: () => { setSelectedId(n.id); setDrawerOpen(true); } },
    }));
    const rEdges = roadmapNodes.filter(n => n.parentId).map(n => {
      const sc = statusMeta(n.status);
      return { id:`e-${n.parentId}-${n.id}`, source:n.parentId, target:n.id, type:'smoothstep',
               animated: n.status==='In Progress',
               style:{ stroke:sc.color, strokeWidth:1.5, opacity:0.7 },
               markerEnd:{ type:MarkerType.ArrowClosed, color:sc.color, width:12, height:12 } };
    });
    return { nodes:rNodes, edges:rEdges };
  }, [roadmapNodes, selectedId, layout]);

  const totals = useMemo(() => {
    const total = roadmapNodes.reduce((a,n) => a+(n.tasks?.length||0), 0);
    const done  = roadmapNodes.reduce((a,n) => a+(n.tasks?.filter(t=>t.completed).length||0), 0);
    return { total, done, pct: total>0?Math.round((done/total)*100):0,
             branches: roadmapNodes.filter(n=>n.parentId==='root').length };
  }, [roadmapNodes]);

  const switchRoadmap = async (sessionId) => {
    setHistoryOpen(false);
    setLoadingHist(true);
    try { await loadRoadmapBySession(sessionId); }
    catch { showToast('Failed to load roadmap.', 'error'); }
    finally { setLoadingHist(false); }
  };

  const addTask = e => {
    e.preventDefault();
    if (!newTask.trim()) return;
    manageSubTask(selectedId, 'add', { text: newTask });
    setNewTask('');
  };

  return (
    <DashboardLayout activeTab="roadmap">
      <div style={{ minHeight:'calc(100vh - 56px)' }}>

        {showTeamModal && (
          <TeamModal
            onConfirm={async t => { await generateRoadmap(t); setShowTeamModal(false); }}
            onCancel={() => setShowTeamModal(false)}
            isGenerating={isGeneratingRoadmap}
          />
        )}

        {/* ── Header ── */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12, marginBottom:20, paddingBottom:20, borderBottom:'1px solid var(--border)' }}>
          <div>
            <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'var(--brand-light)', marginBottom:6 }}>Execution OS</div>
            <div style={{ fontSize:20, fontWeight:700, color:'var(--text1)', letterSpacing:'-0.02em', marginBottom:2 }}>
              {roadmapNodes.find(n=>n.id==='root')?.title || 'Venture'} Roadmap
            </div>
            <div style={{ fontSize:12, color:'var(--text2)' }}>Visual execution plan for your validated strategy.</div>
          </div>

          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            {/* History dropdown */}
            {allRoadmaps.length > 0 && (
              <div style={{ position:'relative' }}>
                <button
                  onClick={() => setHistoryOpen(o => !o)}
                  className="btn btn-outline btn-sm"
                  style={{ gap:5 }}>
                  <Clock size={13}/> History ({allRoadmaps.length})
                  <ChevronDown size={12}/>
                </button>
                {historyOpen && (
                  <div style={{ position:'absolute', top:'110%', right:0, zIndex:150, background:'var(--surface2)', border:'1px solid var(--border2)', borderRadius:'var(--r-md)', minWidth:260, boxShadow:'var(--shadow-lg)', overflow:'hidden' }}>
                    {allRoadmaps.map((r, i) => (
                      <button
                        key={r.sessionId}
                        onClick={() => switchRoadmap(r.sessionId)}
                        style={{ width:'100%', textAlign:'left', padding:'10px 14px', background:'transparent', border:'none', borderBottom: i<allRoadmaps.length-1 ? '1px solid var(--border)' : 'none', cursor:'pointer', color:'var(--text1)' }}
                        onMouseEnter={e => e.currentTarget.style.background='var(--surface3)'}
                        onMouseLeave={e => e.currentTarget.style.background='transparent'}
                      >
                        <div style={{ fontSize:12, fontWeight:600 }}>{r.startupName}</div>
                        <div style={{ fontSize:10, color:'var(--text3)', marginTop:2 }}>{r.domain} · {fmt(r.createdAt)}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => { if (!user?.userId) { showToast('Please log in.', 'error'); return; } setShowTeamModal(true); }}
              disabled={isGeneratingRoadmap || loadingHist}
              className="btn btn-primary btn-sm">
              {isGeneratingRoadmap || loadingHist
                ? <><div style={{ width:13, height:13, border:'2px solid rgba(255,255,255,0.4)', borderTopColor:'#fff', borderRadius:'50%', animation:'spinSlow 0.8s linear infinite' }}/> {isGeneratingRoadmap ? 'Generating…' : 'Loading…'}</>
                : <><Sparkles size={13}/> {roadmapNodes.length > 0 ? 'Regenerate' : 'Generate Roadmap'}</>}
            </button>
          </div>
        </div>

        {/* ── Stats ── */}
        {roadmapNodes.length > 0 && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(130px, 1fr))', gap:12, marginBottom:20 }}>
            {[
              { label:'Branches',  val:totals.branches, color:'var(--brand-light)' },
              { label:'Tasks',     val:totals.total,    color:'var(--text1)'       },
              { label:'Completed', val:totals.done,     color:'var(--green)'       },
              { label:'Progress',  val:`${totals.pct}%`,color:'var(--cyan)'        },
            ].map(s => (
              <div key={s.label} className="stat-card">
                <div style={{ fontSize:22, fontWeight:800, color:s.color, fontFamily:"'JetBrains Mono', monospace", letterSpacing:'-0.02em' }}>{s.val}</div>
                <div style={{ fontSize:10, fontWeight:600, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.06em', marginTop:3 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* ── Empty State ── */}
        {roadmapNodes.length === 0 && !isGeneratingRoadmap && !loadingHist && (
          <div style={{ textAlign:'center', padding:'72px 24px', background:'var(--surface)', border:'1px dashed var(--border2)', borderRadius:'var(--r-lg)' }} className="animate-fade-up">
            <div style={{ width:72, height:72, borderRadius:'50%', background:'var(--brand-bg)', border:'1px solid var(--brand-border)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
              <Compass size={32} style={{ color:'var(--brand-light)' }}/>
            </div>
            <div style={{ fontSize:18, fontWeight:700, color:'var(--text1)', marginBottom:8 }}>Generate Your Roadmap</div>
            <div style={{ fontSize:13, color:'var(--text2)', maxWidth:400, margin:'0 auto 28px', lineHeight:1.7 }}>
              Create an AI-powered execution plan tailored to your validated startup profile.
            </div>
            <button onClick={() => { if (!user?.userId) { showToast('Please log in.', 'error'); return; } setShowTeamModal(true); }} className="btn btn-primary">
              <Sparkles size={15}/> Generate Roadmap
            </button>
          </div>
        )}

        {/* ── Loading indicator ── */}
        {(isGeneratingRoadmap || loadingHist) && roadmapNodes.length === 0 && (
          <div style={{ textAlign:'center', padding:'72px 24px', color:'var(--text2)', fontSize:13 }}>
            <div style={{ width:32, height:32, border:'3px solid var(--brand-border)', borderTopColor:'var(--brand)', borderRadius:'50%', animation:'spinSlow 0.8s linear infinite', margin:'0 auto 16px' }}/>
            {isGeneratingRoadmap ? 'Generating your roadmap…' : 'Loading roadmap…'}
          </div>
        )}

        {/* ── Canvas ── */}
        {roadmapNodes.length > 0 && (
          <div style={{ width:'100%', height:580, background:'var(--surface)', border:'1px solid var(--border2)', borderRadius:'var(--r-lg)', overflow:'hidden', boxShadow:'var(--shadow)' }}>
            <ReactFlow nodes={rfNodes} edges={rfEdges} nodeTypes={nodeTypes}
              fitView fitViewOptions={{ padding:0.25 }} minZoom={0.15} maxZoom={2.5}
              proOptions={{ hideAttribution:true }}>
              <Background color="var(--border2)" gap={28} size={1}/>
              <Controls/>
              <MiniMap maskColor="rgba(0,0,0,0.5)"/>
            </ReactFlow>
          </div>
        )}

        {/* ── Drawer ── */}
        {drawerOpen && activeNode && (
          <>
            <div style={{ position:'fixed', inset:0, zIndex:90 }} onClick={() => { setDrawerOpen(false); setSelectedId(null); }}/>
            <div className="drawer" style={{ position:'fixed', top:0, right:0, width:380, height:'100vh', zIndex:100, background:'var(--surface)', borderLeft:'1px solid var(--border2)', boxShadow:'var(--shadow-lg)', display:'flex', flexDirection:'column' }}>

              <div style={{ padding:'16px 18px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexShrink:0, background:'var(--surface2)' }}>
                <div>
                  <div style={{ fontSize:10, fontWeight:700, color:'var(--brand-light)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:4 }}>Branch</div>
                  <div style={{ fontSize:15, fontWeight:700, color:'var(--text1)', lineHeight:1.3 }}>{activeNode.title}</div>
                </div>
                <button onClick={() => { setDrawerOpen(false); setSelectedId(null); }} className="btn btn-ghost btn-icon"><X size={13}/></button>
              </div>

              {(activeNode.tasks?.length||0) > 0 && (
                <div style={{ padding:'10px 18px 0', background:'var(--surface2)', borderBottom:'1px solid var(--border)' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, fontWeight:600, color:'var(--text3)', marginBottom:5 }}>
                    <span>Task Progress</span>
                    <span style={{ color:'var(--brand-light)' }}>{activeNode.tasks.filter(t=>t.completed).length} / {activeNode.tasks.length}</span>
                  </div>
                  <div className="progress-track" style={{ height:4, marginBottom:10 }}>
                    <div className="progress-fill" style={{ width:`${Math.round((activeNode.tasks.filter(t=>t.completed).length/activeNode.tasks.length)*100)}%`, height:'100%' }}/>
                  </div>
                </div>
              )}

              <div style={{ flex:1, overflowY:'auto', padding:'16px 18px', display:'flex', flexDirection:'column', gap:16 }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                  <div>
                    <div className="field-label">Status</div>
                    <select value={activeNode.status} onChange={e => updateRoadmapNode(activeNode.id, { status:e.target.value })}>
                      {['Pending','In Progress','Completed','Blocked'].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <div className="field-label">Priority</div>
                    <select value={activeNode.priority} onChange={e => updateRoadmapNode(activeNode.id, { priority:e.target.value })}>
                      {['Low','Medium','High'].map(p => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                </div>

                {activeNode.recommendations && (
                  <div style={{ padding:'12px 14px', background:'var(--brand-bg)', border:'1px solid var(--brand-border)', borderRadius:'var(--r)' }}>
                    <div style={{ fontSize:10, fontWeight:700, color:'var(--brand-light)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:6, display:'flex', alignItems:'center', gap:5 }}>
                      <Sparkles size={11}/> AI Insight
                    </div>
                    <div style={{ fontSize:12, color:'var(--text1)', lineHeight:1.6 }}>{activeNode.recommendations}</div>
                  </div>
                )}

                <div>
                  <div style={{ fontSize:12, fontWeight:700, color:'var(--text1)', marginBottom:10 }}>Tasks</div>
                  <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                    {activeNode.tasks?.map(t => (
                      <div key={t.id} style={{ padding:'10px 12px', background:'var(--surface2)', borderRadius:'var(--r)', border:'1px solid var(--border)' }}>
                        <div style={{ display:'flex', alignItems:'flex-start', gap:8 }}>
                          <input type="checkbox" checked={t.completed} onChange={() => manageSubTask(selectedId,'toggle',{id:t.id})}
                            style={{ marginTop:2, width:14, height:14, cursor:'pointer', accentColor:'var(--brand)' }}/>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ fontSize:12, color:t.completed?'var(--text3)':'var(--text1)', textDecoration:t.completed?'line-through':'none', lineHeight:1.45, marginBottom:5 }}>
                              {t.text}
                            </div>
                            <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
                              <span className={priorityBadgeClass(t.priority)}>{t.priority||'Low'}</span>
                              {t.assignedTo && t.assignedTo !== 'Unassigned' && (
                                <span style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:10, padding:'1px 7px', borderRadius:99, background:'var(--brand-bg)', color:'var(--brand-light)', border:'1px solid var(--brand-border)', fontWeight:600 }}>
                                  <span style={{ width:14, height:14, borderRadius:'50%', background:'var(--brand)', color:'#fff', display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:8, fontWeight:800 }}>
                                    {t.assignedTo.charAt(0).toUpperCase()}
                                  </span>
                                  {t.assignedTo}
                                </span>
                              )}
                              {t.timeline && (
                                <span style={{ fontSize:10, padding:'1px 6px', borderRadius:99, background:'var(--surface3)', color:'var(--text2)', border:'1px solid var(--border2)', display:'flex', alignItems:'center', gap:3 }}>
                                  <Clock size={9}/> {t.timeline}
                                </span>
                              )}
                              {t.complexity && (
                                <span style={{ fontSize:10, padding:'1px 6px', borderRadius:99, background:'var(--surface3)', color:'var(--text2)', border:'1px solid var(--border2)' }}>{t.complexity}</span>
                              )}
                            </div>
                            {t.description && <div style={{ fontSize:11, color:'var(--text2)', marginTop:5, lineHeight:1.5 }}>{t.description}</div>}
                          </div>
                          <button onClick={() => manageSubTask(selectedId,'delete',{id:t.id})}
                            style={{ background:'none', border:'none', color:'var(--text3)', cursor:'pointer', padding:2 }}
                            onMouseEnter={e => e.currentTarget.style.color='var(--red)'}
                            onMouseLeave={e => e.currentTarget.style.color='var(--text3)'}>
                            <Trash2 size={12}/>
                          </button>
                        </div>
                      </div>
                    ))}
                    <form onSubmit={addTask} style={{ display:'flex', gap:6, marginTop:2 }}>
                      <input value={newTask} onChange={e => setNewTask(e.target.value)} placeholder="Add task…" style={{ flex:1 }}/>
                      <button type="submit" className="btn btn-primary btn-icon" style={{ width:34, height:34, flexShrink:0 }}><Plus size={15}/></button>
                    </form>
                  </div>
                </div>
              </div>

              {activeNode.id !== 'root' && (
                <div style={{ padding:'12px 18px', borderTop:'1px solid var(--border)', flexShrink:0 }}>
                  <button onClick={() => { deleteRoadmapNode(selectedId); setDrawerOpen(false); setSelectedId(null); }}
                    className="btn btn-danger" style={{ width:'100%', justifyContent:'center' }}>
                    <Trash2 size={13}/> Delete Branch
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Roadmap;
