import React, { useState, useEffect } from 'react';
import { getTaskComments, postTaskComment } from '../services/startupApi';
import { useStartup } from '../context/StartupContext';
import { Loader, Send, User } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const TaskComments = ({ taskId }) => {
  const { user } = useStartup();
  const { showToast } = useToast();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    if (!taskId) return;
    let mounted = true;
    setLoading(true);
    getTaskComments(taskId).then(data => {
      if (mounted) {
        setComments(data);
        setLoading(false);
      }
    }).catch(() => {
      if (mounted) setLoading(false);
    });
    return () => { mounted = false; };
  }, [taskId]);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user?.userId) return;
    setPosting(true);
    try {
      const newC = await postTaskComment(taskId, user.userId, newMessage.trim());
      setComments(prev => [...prev, newC]);
      setNewMessage('');
    } catch (err) {
      showToast('Failed to post comment', 'error');
    } finally {
      setPosting(false);
    }
  };

  return (
    <div style={{ marginTop: 16, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text3)', marginBottom: 12 }}>
        Queries & Doubts
      </div>
      
      {loading ? (
        <div style={{ padding: '12px', textAlign: 'center', color: 'var(--text3)' }}>
          <Loader size={14} style={{ animation: 'spinSlow 1s linear infinite', display: 'inline-block' }} />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16, maxHeight: 200, overflowY: 'auto' }}>
          {comments.length === 0 ? (
            <div style={{ fontSize: 12, color: 'var(--text3)', fontStyle: 'italic' }}>No queries yet.</div>
          ) : (
            comments.map(c => {
              const isMine = c.user_id === user.userId;
              return (
                <div key={c.id} style={{ display: 'flex', gap: 8, flexDirection: isMine ? 'row-reverse' : 'row' }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--surface3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <User size={12} color="var(--text2)" />
                  </div>
                  <div style={{ 
                    background: isMine ? 'var(--brand-bg)' : 'var(--surface2)', 
                    border: `1px solid ${isMine ? 'var(--brand-border)' : 'var(--border)'}`,
                    padding: '8px 12px', borderRadius: 8, fontSize: 12, color: 'var(--text1)',
                    maxWidth: '85%'
                  }}>
                    {c.message}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      <form onSubmit={handlePost} style={{ display: 'flex', gap: 8 }}>
        <input 
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          placeholder="Ask a question or provide an update..."
          style={{ flex: 1, padding: '8px 12px', fontSize: 12 }}
          disabled={posting}
        />
        <button type="submit" className="btn btn-primary" style={{ padding: '8px 12px' }} disabled={posting || !newMessage.trim()}>
          {posting ? <Loader size={14} style={{ animation: 'spinSlow 1s linear infinite' }} /> : <Send size={14} />}
        </button>
      </form>
    </div>
  );
};

export default TaskComments;
