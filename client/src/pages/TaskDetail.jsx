import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../services/api';

export default function TaskDetail() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const socket = useSocket();
  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    Promise.all([
      api.get(`/tasks/${taskId}`),
      api.get(`/tasks/${taskId}/comments`),
    ]).then(([taskRes, commentsRes]) => {
      setTask(taskRes.data.task);
      setComments(commentsRes.data.comments);
      setEditForm({
        title: taskRes.data.task.title,
        description: taskRes.data.task.description,
        priority: taskRes.data.task.priority,
        assignee: taskRes.data.task.assignee?._id || '',
        dueDate: taskRes.data.task.dueDate ? taskRes.data.task.dueDate.slice(0, 10) : '',
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
      const board = task.board;
      if (typeof board === 'object') {
        navigate(`/projects/${board.project}/board`);
      } else {
        navigate('/');
      }
    } catch (err) {
      alert(err.response?.data?.error);
    }
  };

  const canEdit = user?.role !== 'member';

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div></div>;
  if (!task) return <p className="text-center text-gray-400 py-12">Task not found</p>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl border">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600">&larr; Back</button>
            <span className={`text-xs px-2 py-0.5 rounded font-medium ${
              task.priority === 'urgent' ? 'bg-red-100 text-red-600' :
              task.priority === 'high' ? 'bg-orange-100 text-orange-600' :
              task.priority === 'medium' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
            }`}>{task.priority}</span>
          </div>
          {canEdit && (
            <div className="flex gap-2">
              <button onClick={() => setEditing(!editing)} className="text-sm text-primary-600 hover:underline">{editing ? 'Cancel' : 'Edit'}</button>
              <button onClick={deleteTask} className="text-sm text-red-600 hover:underline">Delete</button>
            </div>
          )}
        </div>

        {editing ? (
          <form onSubmit={updateTask} className="p-6 space-y-4">
            <input value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} required
              className="w-full px-3 py-2 border rounded-lg text-lg font-semibold focus:ring-2 focus:ring-primary-500 outline-none" />
            <textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} rows={4}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Priority</label>
                <select value={editForm.priority} onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none">
                  <option value="low">Low</option><option value="medium">Medium</option>
                  <option value="high">High</option><option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Due Date</label>
                <input type="date" value={editForm.dueDate} onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
            </div>
            <button type="submit" className="px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700">Save Changes</button>
          </form>
        ) : (
          <div className="p-6">
            <h1 className="text-xl font-bold mb-2">{task.title}</h1>
            <p className="text-sm text-gray-600 whitespace-pre-wrap mb-4">{task.description || 'No description'}</p>
            <div className="flex flex-wrap gap-4 text-sm">
              <div><span className="text-gray-400">Status:</span> <span className="font-medium">{task.columnName}</span></div>
              <div><span className="text-gray-400">Assignee:</span> <span className="font-medium">{task.assignee?.name || 'Unassigned'}</span></div>
              <div><span className="text-gray-400">Reporter:</span> <span className="font-medium">{task.reporter?.name}</span></div>
              {task.dueDate && <div><span className="text-gray-400">Due:</span> <span className={`font-medium ${new Date(task.dueDate) < new Date() ? 'text-red-500' : ''}`}>{new Date(task.dueDate).toLocaleDateString()}</span></div>}
            </div>
            {task.tags?.length > 0 && (
              <div className="flex gap-1 mt-3 flex-wrap">
                {task.tags.map((t, i) => <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{t}</span>)}
              </div>
            )}
          </div>
        )}

        <div className="px-6 py-4 border-t">
          <h3 className="font-semibold text-sm mb-3">Attachments</h3>
          {canEdit && (
            <div className="mb-3">
              <input type="file" onChange={handleFileUpload} className="text-sm" />
            </div>
          )}
          <div className="flex gap-2 flex-wrap">
            {task.attachments?.map((file) => (
              <a key={file._id} href={`/api/files/${file._id}`} target="_blank"
                className="text-xs bg-gray-100 px-3 py-1.5 rounded-lg hover:bg-gray-200 flex items-center gap-1">
                📎 {file.originalName}
              </a>
            ))}
            {(!task.attachments || task.attachments.length === 0) && <p className="text-xs text-gray-400">No attachments</p>}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border mt-6">
        <div className="px-6 py-4 border-b">
          <h3 className="font-semibold text-sm">Comments ({comments.length})</h3>
        </div>
        <div className="p-6">
          <form onSubmit={addComment} className="mb-6">
            <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Write a comment..." rows={2}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none mb-2" />
            <button type="submit" disabled={!newComment.trim()}
              className="px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 disabled:opacity-50">Comment</button>
          </form>
          <div className="space-y-4">
            {comments.length === 0 && <p className="text-center text-gray-400 text-sm py-4">No comments yet</p>}
            {comments.map((c) => (
              <div key={c._id} className="flex gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium text-gray-600 flex-shrink-0">
                  {c.author?.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{c.author?.name}</span>
                    <span className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{c.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
