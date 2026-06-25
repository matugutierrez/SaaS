import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function Message({ message }) {
  const { user } = useAuth();
  const [deleted, setDeleted] = useState(message.deleted);
  const isOwn = message.sender?._id === user?._id;
  const canDelete = user?.role === 'owner' || user?.role === 'admin_plus' || user?.role === 'admin';

  const handleDelete = async (e) => {
    e.stopPropagation();
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
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4 group`}>
      <div className={`flex gap-2.5 max-w-[70%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
        {!isOwn && (
          <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0 shadow-sm mt-1">
            {message.sender?.name?.[0]?.toUpperCase() || '?'}
          </div>
        )}
        <div>
          {!isOwn && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 ml-1 font-medium">{message.sender?.name}</p>
          )}
          <div className="relative">
            <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
              isOwn
                ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-md shadow-primary-200 dark:shadow-primary-900/30'
                : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 shadow-sm'
            }`}>
              <p className="whitespace-pre-wrap break-words">{message.content}</p>
            </div>
            {canDelete && (
              <button onClick={handleDelete}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs hover:bg-red-600 shadow-sm">
                ×
              </button>
            )}
          </div>
          <p className={`text-[10px] text-gray-400 dark:text-gray-500 mt-1 ${isOwn ? 'text-right mr-1' : 'ml-1'}`}>
            {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
    </div>
  );
}
