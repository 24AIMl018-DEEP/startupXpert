import React, { useState, useEffect, useRef } from 'react';
import { useStartup } from '../context/StartupContext';
import { useToast } from '../context/ToastContext';
import DashboardLayout from '../layouts/DashboardLayout';
import { FileText, Download, Loader, RefreshCw, CheckCircle2, Sparkles } from 'lucide-react';
import { generateDocument, fetchAllUserRoadmaps, fetchLatestValidatedSession } from '../services/startupApi';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import mermaid from 'mermaid';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// Setup mermaid
mermaid.initialize({ startOnLoad: false, theme: 'dark' });

const DOC_TYPES = [
  'Business Plan', 'Problem Statement', 'Vision & Mission', 
  'Market Research Summary', 'SWOT Analysis', 'Competitor Analysis',
  'Revenue Model', 'Marketing Plan', 'Project Proposal',
  'Pitch Deck Content', 'Internship Project Report', 'Software Requirement Specification (SRS)'
];

const MermaidDiagram = ({ chart }) => {
  const containerRef = useRef(null);
  
  useEffect(() => {
    if (chart && containerRef.current) {
      mermaid.render(`mermaid-${Math.random().toString(36).substr(2, 9)}`, chart).then(res => {
        containerRef.current.innerHTML = res.svg;
      }).catch(e => {
        containerRef.current.innerHTML = `<pre style="color:var(--red);font-size:11px;">Mermaid Error: ${e.message}</pre>`;
      });
    }
  }, [chart]);

  return <div ref={containerRef} className="mermaid-wrapper" style={{ margin: '16px 0', padding: 16, background: 'var(--surface2)', borderRadius: 8, display: 'flex', justifyContent: 'center' }} />;
};

const Documents = () => {
  const { user } = useStartup();
  const { showToast } = useToast();
  
  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [selectedDocType, setSelectedDocType] = useState('Business Plan');
  
  const [generating, setGenerating] = useState(false);
  const [markdownOutput, setMarkdownOutput] = useState('');
  const [exporting, setExporting] = useState(false);

  const documentRef = useRef(null);

  useEffect(() => {
    // Load sessions
    const loadSessions = async () => {
      try {
        if (user?.role === 'founder' || user?.role === 'Founder') {
          const s = await fetchAllUserRoadmaps(user.userId);
          setSessions(s);
          if (s.length > 0) setSelectedSessionId(s[0].sessionId);
        } else {
          // Member: they only see their current org's session.
          // Since members don't have user_id on startup_input, 
          // we can just use the roadmap session if they have one. 
          // Actually, let's just let the API handle the org logic later, 
          // or for now, we use the session from the roadmap tasks.
          // For simplicity, we just fetch their latest session.
          const s = await fetchLatestValidatedSession(user.userId);
          if (s && s.id) {
            setSessions([{ sessionId: s.id, startupName: s.startup_name }]);
            setSelectedSessionId(s.id);
          }
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadSessions();
  }, [user]);

  const handleGenerate = async () => {
    if (!selectedSessionId) return showToast('No startup session selected.', 'error');
    setGenerating(true);
    setMarkdownOutput('');
    try {
      const result = await generateDocument(selectedSessionId, selectedDocType);
      setMarkdownOutput(result);
      showToast(`${selectedDocType} generated successfully.`, 'success');
    } catch (e) {
      showToast(e.message || 'Failed to generate document.', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const exportPDF = async () => {
    if (!documentRef.current || !markdownOutput) return;
    setExporting(true);
    try {
      // Temporarily switch theme to light for PDF if needed, or keep it.
      // We will render it as is.
      const canvas = await html2canvas(documentRef.current, { scale: 2, useCORS: true, logging: false });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      // If height > A4 page, it will overflow or we can add pages.
      // For simplicity, we just dump it on one long page or let jsPDF scale it.
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${selectedDocType.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`);
      showToast('Document exported to PDF!', 'success');
    } catch (e) {
      showToast('Failed to export PDF.', 'error');
    } finally {
      setExporting(false);
    }
  };

  return (
    <DashboardLayout activeTab="documents">
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 24, height: 'calc(100vh - 48px)' }}>
        
        {/* LEFT PANEL - Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--brand-light)', marginBottom: 6 }}>
              Document Generation Center
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text1)', letterSpacing: '-0.02em', margin: 0, marginBottom: 4 }}>
              Reports & Docs
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text2)', margin: 0 }}>
              Generate structured business documents instantly from your validated startup data.
            </p>
          </div>

          <div className="glass-card" style={{ padding: 16 }}>
            <div className="field-label">Target Startup Session</div>
            <select 
              value={selectedSessionId} 
              onChange={e => setSelectedSessionId(e.target.value)}
              style={{ width: '100%', marginBottom: 16 }}
            >
              {sessions.length === 0 && <option value="">No valid sessions found</option>}
              {sessions.map(s => (
                <option key={s.sessionId} value={s.sessionId}>{s.startupName}</option>
              ))}
            </select>

            <div className="field-label">Document Type</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 400, overflowY: 'auto', paddingRight: 4 }}>
              {DOC_TYPES.map(type => (
                <button
                  key={type}
                  onClick={() => setSelectedDocType(type)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px',
                    borderRadius: 8, border: selectedDocType === type ? '1px solid var(--brand)' : '1px solid var(--border)',
                    background: selectedDocType === type ? 'var(--brand-bg)' : 'transparent',
                    color: selectedDocType === type ? 'var(--text1)' : 'var(--text2)',
                    fontSize: 13, fontWeight: 600, cursor: 'pointer', textAlign: 'left',
                    transition: 'all 0.15s'
                  }}
                >
                  <FileText size={14} style={{ color: selectedDocType === type ? 'var(--brand-light)' : 'var(--text3)' }} />
                  {type}
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={generating || !selectedSessionId}
            className="btn btn-primary"
            style={{ width: '100%', padding: '14px', fontSize: 14, justifyContent: 'center' }}
          >
            {generating ? (
              <><Loader size={16} style={{ animation: 'spinSlow 1s linear infinite' }} /> Generating AI Document...</>
            ) : (
              <><Sparkles size={16} /> Generate {selectedDocType}</>
            )}
          </button>
        </div>

        {/* RIGHT PANEL - Preview */}
        <div className="glass-card" style={{ padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FileText size={16} color="var(--brand-light)" />
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text1)' }}>Document Preview</span>
            </div>
            {markdownOutput && (
              <button 
                onClick={exportPDF}
                disabled={exporting}
                className="btn btn-outline"
                style={{ padding: '6px 12px', fontSize: 12 }}
              >
                {exporting ? <Loader size={14} style={{ animation: 'spinSlow 1s linear infinite' }} /> : <Download size={14} />}
                Export PDF
              </button>
            )}
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto', padding: 32, background: '#fff', color: '#111' }}>
            {generating ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 16, color: '#666' }}>
                <RefreshCw size={32} style={{ animation: 'spinSlow 2s linear infinite', color: 'var(--brand)' }} />
                <div style={{ fontSize: 16, fontWeight: 600 }}>Analyzing DB & Generating...</div>
                <div style={{ fontSize: 13, maxWidth: 300, textAlign: 'center' }}>
                  The AI is retrieving your latest validation, roadmaps, and profile to construct the {selectedDocType}.
                </div>
              </div>
            ) : !markdownOutput ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12, color: '#aaa' }}>
                <FileText size={48} style={{ opacity: 0.2 }} />
                <div style={{ fontSize: 14 }}>Select a document type and generate to preview it here.</div>
              </div>
            ) : (
              <div ref={documentRef} className="markdown-body" style={{ maxWidth: 800, margin: '0 auto', padding: '20px 40px', background: '#fff' }}>
                {/* Apply light theme styles specifically for PDF render */}
                <style>{`
                  .markdown-body { color: #111; font-family: 'Inter', sans-serif; line-height: 1.6; }
                  .markdown-body h1, .markdown-body h2, .markdown-body h3 { color: #000; font-weight: 800; margin-top: 1.5em; margin-bottom: 0.5em; }
                  .markdown-body h1 { font-size: 2.2em; border-bottom: 2px solid #eee; padding-bottom: 0.3em; }
                  .markdown-body h2 { font-size: 1.6em; border-bottom: 1px solid #eee; padding-bottom: 0.3em; }
                  .markdown-body p { margin-bottom: 1.2em; }
                  .markdown-body ul, .markdown-body ol { margin-bottom: 1.2em; padding-left: 2em; }
                  .markdown-body li { margin-bottom: 0.3em; }
                  .markdown-body strong { color: #000; font-weight: 700; }
                  .markdown-body table { width: 100%; border-collapse: collapse; margin-bottom: 1.5em; }
                  .markdown-body th, .markdown-body td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; }
                  .markdown-body th { background: #f8f9fa; font-weight: 600; }
                  .markdown-body code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-size: 0.9em; font-family: monospace; }
                  .markdown-body pre { background: #f8f9fa; padding: 16px; border-radius: 8px; overflow-x: auto; border: 1px solid #eee; }
                  .markdown-body blockquote { border-left: 4px solid var(--brand); padding-left: 16px; color: #555; font-style: italic; margin: 0 0 1.5em; }
                `}</style>
                
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({node, inline, className, children, ...props}) {
                      const match = /language-(\w+)/.exec(className || '');
                      if (!inline && match && match[1] === 'mermaid') {
                        return <MermaidDiagram chart={String(children).replace(/\n$/, '')} />;
                      }
                      return <code className={className} {...props}>{children}</code>;
                    }
                  }}
                >
                  {markdownOutput}
                </ReactMarkdown>
              </div>
            )}
          </div>
        </div>
        
      </div>
    </DashboardLayout>
  );
};

export default Documents;
