import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const avatarColors = [
  'from-blue-400 to-blue-600',
  'from-emerald-400 to-emerald-600',
  'from-violet-400 to-violet-600',
  'from-rose-400 to-rose-600',
  'from-amber-400 to-amber-600',
  'from-cyan-400 to-cyan-600',
  'from-pink-400 to-pink-600',
  'from-teal-400 to-teal-600',
];

function getAvatarColor(id) {
  let hash = 0;
  for (let i = 0; i < (id || '').length; i++) {
    hash = ((hash << 5) - hash) + id.charCodeAt(i);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

export default function Message({ message, onReply }) {
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
          <div className={`w-8 h-8 bg-gradient-to-br ${getAvatarColor(message.sender?._id)} rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0 shadow-sm mt-6`}>
            {message.sender?.name?.[0]?.toUpperCase() || '?'}
          </div>
        )}
        <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} min-w-0`}>
          {!isOwn && (
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-0.5 ml-1 font-medium truncate max-w-full">{message.sender?.name}</p>
          )}
          <div className="flex items-start gap-1 max-w-full">
            {isOwn && (
              <div className="relative flex-shrink-0 mt-1">
                <button onClick={() => setMenuOpen(!menuOpen)}
                  className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-400 dark:text-gray-500">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="4" r="1.5" /><circle cx="10" cy="10" r="1.5" /><circle cx="10" cy="16" r="1.5" /></svg>
                </button>
                {menuOpen && <MessageMenu onClose={() => setMenuOpen(false)} onDelete={canDelete ? handleDelete : null} />}
              </div>
            )}
            <div className="relative max-w-full min-w-0">
              <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                isOwn
                  ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-primary-200 dark:shadow-primary-900/30'
                  : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700'
              }`}>
                <p className="whitespace-pre-wrap break-words">{message.content}</p>
              </div>
              <p className={`text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 ${isOwn ? 'text-right' : 'text-left'}`}>
                {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            {!isOwn && (
              <div className="relative flex-shrink-0 mt-1">
                <button onClick={() => setMenuOpen(!menuOpen)}
                  className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-400 dark:text-gray-500">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="4" r="1.5" /><circle cx="10" cy="10" r="1.5" /><circle cx="10" cy="16" r="1.5" /></svg>
                </button>
                {menuOpen && <MessageMenu onClose={() => setMenuOpen(false)} onReply={() => { setMenuOpen(false); onReply?.(message); }} onDelete={canDelete ? handleDelete : null} />}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageMenu({ onClose, onReply, onDelete }) {
  return (
    <>
      <div className="fixed inset-0 z-10" onClick={onClose} />
      <div className="absolute z-20 top-full mt-1 right-0 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-1 min-w-[140px]">
        {onReply && (
          <button onClick={onReply} className="w-full text-left px-3.5 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
            Reply
          </button>
        )}
        <button className="w-full text-left px-3.5 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          Forward
        </button>
        {onDelete && (
          <>
            <div className="border-t border-gray-100 dark:border-gray-700" />
            <button onClick={onDelete} className="w-full text-left px-3.5 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              Delete
            </button>
          </>
        )}
      </div>
    </>
  );
}
