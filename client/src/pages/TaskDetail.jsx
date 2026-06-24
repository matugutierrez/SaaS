import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const priorityMeta = {
  low: { color: 'bg-gray-100 text-gray-600', label: 'Low' },
  medium: { color: 'bg-blue-100 text-blue-600', label: 'Medium' },
  high: { color: 'bg-orange-100 text-orange-600', label: 'High' },
  urgent: { color: 'bg-red-100 text-red-600', label: 'Urgent' },
};

export default function TaskDetail() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    Promise.all([
      api.get(`/tasks/${taskId}`),
      api.get(`/tasks/${taskId}/comments`),
    ]).then(([taskRes, commentsRes]) => {
      setTask(taskRes.data.task);
      setComments(commentsRes.data.comments);
      const t = taskRes.data.task;
      setEditForm({
        title: t.title,
        description: t.description,
        priority: t.priority,
        assignee: t.assignee?._id || '',
        dueDate: t.dueDate ? t.dueDate.slice(0, 10) : '',
      });
    }).catch(() => navigate('/')).finally(() => setLoading(false));
  }, [taskId]);

  const addComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const res = await api.post(`/tasks/${taskId}/comments`, { body: newComment });
      setComments((prev) => [res.data.comment, ...prev]);
      setNewComment('');
    } catch (err) {
      alert(err.response?.data?.error);
    }
  };

  const updateTask = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/tasks/${taskId}`, editForm);
      setTask(res.data.task);
      setEditing(false);
    } catch (err) {
      alert(err.response?.data?.error);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('task', taskId);
    try {
      const res = await api.post('/files/upload', formData);
      setTask((prev) => ({ ...prev, attachments: [...(prev.attachments || []), res.data.file] }));
    } catch (err) {
      alert(err.response?.data?.error);
    }
  };

  const deleteTask = async () => {
    if (!confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      navigate(-1);
    } catch (err) {
      alert(err.response?.data?.error);
    }
  };

  const canEdit = user?.role !== 'member';

  if (loading) return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="h-12 bg-gray-200 rounded-2xl animate-pulse" />
      <div className="h-96 bg-gray-200 rounded-2xl animate-pulse" />
    </div>
  );
  if (!task) return <p className="text-center text-gray-400 py-12">Task not found</p>;

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg transition">&larr;</button>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${(priorityMeta[task.priority] || priorityMeta.medium).color}`}>
              {(priorityMeta[task.priority] || priorityMeta.medium).label}
            </span>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{task.columnName}</span>
          </div>
          {canEdit && (
            <div className="flex gap-1">
              <button onClick={() => setEditing(!editing)}
                className="px-3 py-1.5 text-xs font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition">{editing ? 'Cancel' : 'Edit'}</button>
              <button onClick={deleteTask}
                className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition">Delete</button>
            </div>
          )}
        </div>

        {editing ? (
          <form onSubmit={updateTask} className="p-6 space-y-4">
            <input value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-lg font-semibold focus:ring-2 focus:ring-primary-500 outline-none transition" />
            <textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} rows={4}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none transition resize-none" />
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Priority</label>
                <select value={editForm.priority} onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none transition">
                  <option value="low">Low</option><option value="medium">Medium</option>
                  <option value="high">High</option><option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Due Date</label>
                <input type="date" value={editForm.dueDate} onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none transition" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Assignee</label>
                <input value={editForm.assignee} onChange={(e) => setEditForm({ ...editForm, assignee: e.target.value })} placeholder="User ID"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none transition" />
              </div>
            </div>
            <button type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white text-sm font-medium rounded-xl hover:from-primary-700 hover:to-primary-600 shadow-lg shadow-primary-200 transition-all active:scale-95">
              Save Changes
            </button>
          </form>
        ) : (
          <div className="p-6">
            <h1 className="text-xl font-bold text-gray-800 mb-3">{task.title}</h1>
            <p className="text-sm text-gray-600 whitespace-pre-wrap mb-6">{task.description || 'No description'}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Status', value: task.columnName },
                { label: 'Assignee', value: task.assignee?.name || 'Unassigned' },
                { label: 'Reporter', value: task.reporter?.name },
                { label: 'Due', value: task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date', highlight: task.dueDate && new Date(task.dueDate) < new Date() ? 'text-red-500' : '' },
              ].map((f, i) => (
                <div key={i} className="bg-gray-50/80 rounded-xl p-3">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">{f.label}</p>
                  <p className={`text-sm font-medium text-gray-700 ${f.highlight || ''}`}>{f.value}</p>
                </div>
              ))}
            </div>
            {task.tags?.length > 0 && (
              <div className="flex gap-1.5 mt-4 flex-wrap">
                {task.tags.map((t, i) => <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg">{t}</span>)}
              </div>
            )}
          </div>
        )}

        <div className="px-6 py-4 border-t border-gray-50 bg-gray-50/50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">Attachments ({task.attachments?.length || 0})</h3>
            {canEdit && (
              <label className="text-xs text-primary-600 hover:text-primary-700 font-medium cursor-pointer hover:underline">
                + Add file
                <input type="file" onChange={handleFileUpload} className="hidden" />
              </label>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            {task.attachments?.length === 0 && <p className="text-xs text-gray-400">No attachments</p>}
            {task.attachments?.map((file) => (
              <a key={file._id} href={`/api/files/${file._id}`} target="_blank"
                className="flex items-center gap-1.5 text-xs bg-white border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition shadow-sm">
                <span>📎</span> {file.originalName}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-50">
          {['details', 'comments'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-6 py-3.5 text-sm font-medium transition border-b-2 ${activeTab === tab ? 'text-primary-600 border-primary-500' : 'text-gray-400 border-transparent hover:text-gray-600'}`}>
              {tab === 'details' ? 'Details' : `Comments (${comments.length})`}
            </button>
          ))}
        </div>

        {activeTab === 'comments' && (
          <div className="p-6">
            <form onSubmit={addComment} className="mb-6">
              <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Write a comment..." rows={2}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none transition resize-none mb-3" />
              <button type="submit" disabled={!newComment.trim()}
                className="px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white text-sm font-medium rounded-xl hover:from-primary-700 hover:to-primary-600 shadow-lg shadow-primary-200 transition-all active:scale-95 disabled:opacity-50">
                Comment
              </button>
            </form>
            <div className="space-y-4">
              {comments.length === 0 && <p className="text-center text-gray-400 text-sm py-8">No comments yet</p>}
              {comments.map((c) => (
                <div key={c._id} className="flex gap-3 p-4 bg-gray-50/50 rounded-xl">
                  <div className="w-9 h-9 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center text-sm font-medium text-white flex-shrink-0 shadow-sm">
                    {c.author?.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-medium text-gray-700">{c.author?.name}</span>
                      <span className="text-[11px] text-gray-400">{new Date(c.createdAt).toLocaleDateString()} · {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{c.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'details' && (
          <div className="p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Activity</h3>
            <p className="text-sm text-gray-400">Created {new Date(task.createdAt).toLocaleString()} · Updated {new Date(task.updatedAt).toLocaleString()}</p>
          </div>
        )}
      </div>
    </div>
  );
}
