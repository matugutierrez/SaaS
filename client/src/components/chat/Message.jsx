import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function Message({ message, onReply, onForward }) {
  const { user } = useAuth();
  const [deleted, setDeleted] = useState(message.deleted);
  const [menuOpen, setMenuOpen] = useState(false);
  const isOwn = message.sender?._id === user?._id;
  const canDelete = user?.role === 'owner' || user?.role === 'admin_plus' || user?.role === 'admin';

  const handleDelete = async () => {
    setMenuOpen(false);
    if (!confirm('Delete this message?')) return;
    try {
      await api.delete(`/chat/messages/${message._id}`);
      setDeleted(true);
    } catch (err) {
      alert(err.response?.data?.error || 'Error deleting message');
    }
  };

  if (deleted) return null;

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3 group`}>
      <div className={`flex gap-2.5 max-w-[80%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
        {!isOwn && (
          <div className="w-8 h-8 bg-[#1a1f29] text-text-secondary flex items-center justify-center text-xs font-bold flex-shrink-0 mt-6">
            {message.sender?.name?.[0]?.toUpperCase() || '?'}
          </div>
        )}
        <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} min-w-0`}>
          {!isOwn && (
            <p className="text-[11px] text-text-secondary mb-0.5 ml-1 font-medium truncate max-w-full">{message.sender?.name}</p>
          )}
          <div className="flex items-start gap-1 max-w-full">
            {isOwn && (
              <div className="relative flex-shrink-0 mt-[7px]">
                <button onClick={() => setMenuOpen(!menuOpen)}
                  className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center text-text-secondary hover:bg-[#1a1f29]">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="4" r="1.5" /><circle cx="10" cy="10" r="1.5" /><circle cx="10" cy="16" r="1.5" /></svg>
                </button>
                {menuOpen && <MessageMenu onClose={() => setMenuOpen(false)} onForward={() => { setMenuOpen(false); onForward?.(message); }} onDelete={canDelete ? handleDelete : null} />}
              </div>
            )}
            <div className="relative max-w-full min-w-0">
              <div className={`px-4 py-2.5 text-sm leading-relaxed ${
                isOwn
                  ? 'bg-accent-blue text-page'
                  : 'bg-[#1a1f29] text-text border border-border'
              }`}>
                {message.forwarded && (
                  <p className="text-[10px] opacity-70 mb-1 flex items-center gap-1">
                    <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor"><path d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/></svg>
                    Forwarded from {message.forwardedFrom?.name || 'Unknown'}
                  </p>
                )}
                <p className="whitespace-pre-wrap break-words">{message.content}</p>
              </div>
              <p className={`text-text-secondary text-[10px] mt-0.5 ${isOwn ? 'text-right' : 'text-left'}`}>
                {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            {!isOwn && (
              <div className="relative flex-shrink-0 mt-[7px]">
                <button onClick={() => setMenuOpen(!menuOpen)}
                  className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center text-text-secondary hover:bg-[#1a1f29]">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="4" r="1.5" /><circle cx="10" cy="10" r="1.5" /><circle cx="10" cy="16" r="1.5" /></svg>
                </button>
                {menuOpen && <MessageMenu onClose={() => setMenuOpen(false)} onReply={() => { setMenuOpen(false); onReply?.(message); }} onForward={() => { setMenuOpen(false); onForward?.(message); }} onDelete={canDelete ? handleDelete : null} />}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageMenu({ onClose, onReply, onForward, onDelete }) {
  const [dir, setDir] = useState('down');
  const menuRef = useRef(null);

  useEffect(() => {
    const el = menuRef.current;
    if (!el) return;
    const parent = el.parentElement;
    if (!parent) return;
    const rect = parent.getBoundingClientRect();
    const menuH = el.offsetHeight;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    if (spaceBelow < menuH && spaceAbove > menuH) {
      setDir('up');
    }
    const menuW = el.offsetWidth;
    const spaceRight = window.innerWidth - rect.right;
    if (spaceRight < menuW) {
      el.style.left = 'auto';
      el.style.right = '0';
    }
  }, []);

  return (
    <>
      <div className="fixed inset-0 z-10" onClick={onClose} />
      <div ref={menuRef} className={`absolute z-20 bg-panel border border-border py-1 min-w-[140px] ${
        dir === 'up' ? 'bottom-full mb-1' : 'top-full mt-1'
      } right-0`}>
        {onReply && (
          <button onClick={onReply} className="w-full text-left px-3.5 py-2 text-xs text-text-secondary hover:bg-[#1a1f29] flex items-center gap-2">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
            Reply
          </button>
        )}
        {onForward && (
          <button onClick={onForward} className="w-full text-left px-3.5 py-2 text-xs text-text-secondary hover:bg-[#1a1f29] flex items-center gap-2">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            Forward
          </button>
        )}
        {onDelete && (
          <>
            <div className="border-t border-border" />
            <button onClick={onDelete} className="w-full text-left px-3.5 py-2 text-xs text-accent-terracotta hover:bg-[#1a1f29] flex items-center gap-2">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              Delete
            </button>
          </>
        )}
      </div>
    </>
  );
}
