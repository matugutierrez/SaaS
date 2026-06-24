import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Modal from '../components/common/Modal';

const templates = [
  {
    name: 'Bug Tracking',
    description: 'Standard bug reporting and tracking workflow',
    icon: '🐛',
    columns: ['To Do', 'In Progress', 'Review', 'Testing', 'Done'],
  },
  {
    name: 'Sprint Planning',
    description: 'Agile sprint with backlog management',
    icon: '🏃',
    columns: ['Backlog', 'To Do', 'In Progress', 'Review', 'Done'],
  },
  {
    name: 'Content Calendar',
    description: 'Plan and track content creation',
    icon: '📝',
    columns: ['Idea', 'Writing', 'Review', 'Scheduled', 'Published'],
  },
  {
    name: 'Product Roadmap',
    description: 'Track features from ideation to launch',
    icon: '🗺️',
    columns: ['Discovery', 'Design', 'Development', 'Testing', 'Launched'],
  },
  {
    name: 'Support Queue',
    description: 'Manage customer support tickets',
    icon: '🎫',
    columns: ['New', 'In Progress', 'Waiting', 'Resolved', 'Closed'],
  },
  {
    name: 'HR Onboarding',
    description: 'New employee onboarding checklist',
    icon: '👤',
    columns: ['To Do', 'In Progress', 'Review', 'Done'],
  },
  {
    name: 'Custom',
    description: 'Start from scratch with default columns',
    icon: '✨',
    columns: [],
  },
];

export default function Templates() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selected, setSelected] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', key: '' });

  const openCreate = (tmpl) => {
    setSelected(tmpl);
    setForm({ name: '', key: '' });
    setShowCreate(true);
  };

  const createFromTemplate = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.key.trim()) return;
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        key: form.key.toUpperCase(),
        columns: selected.columns.length > 0
          ? selected.columns.map((c, i) => ({ name: c, order: i, color: defaultColors[i] || '#6b7280' }))
          : undefined,
      };
      const res = await api.post('/projects', payload);
      setShowCreate(false);
      navigate(`/projects/${res.data.project._id}/board`);
    } catch (err) {
      alert(err.response?.data?.error || 'Error creating project');
    } finally {
      setLoading(false);
    }
  };

  const canCreate = user?.role === 'owner' || user?.role === 'admin_plus' || user?.role === 'admin';
  const defaultColors = ['#9ca3af', '#6b7280', '#3b82f6', '#f59e0b', '#8b5cf6', '#22c55e', '#6b7280'];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Templates</h1>
      <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">Pre-built board templates — click to create a project</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((t, i) => (
          <button key={i} onClick={() => canCreate ? openCreate(t) : null}
            disabled={!canCreate}
            className={`text-left bg-white dark:bg-gray-900 rounded-2xl border p-5 transition-all duration-200 shadow-sm hover:shadow-md ${
              !canCreate ? 'opacity-60 cursor-not-allowed' : 'hover:border-primary-300 dark:hover:border-primary-700'
            } border-gray-100 dark:border-gray-800`}>
            <div className="text-3xl mb-3">{t.icon}</div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">{t.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{t.description}</p>
            <div className="flex flex-wrap gap-1">
              {t.columns.map((c, j) => (
                <span key={j} className="text-[10px] px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full">{c}</span>
              ))}
              {t.columns.length === 0 && (
                <span className="text-[10px] px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full">Default</span>
              )}
            </div>
          </button>
        ))}
      </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title={`Create Project — ${selected?.name || ''}`}>
        <form onSubmit={createFromTemplate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Bug Tracker"
              className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none transition" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project Key <span className="text-gray-400">(2-5 letters)</span></label>
            <input value={form.key} onChange={(e) => setForm({ ...form, key: e.target.value.toUpperCase() })} required maxLength={5} placeholder="e.g. BUG"
              className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none uppercase transition" />
          </div>
          {selected?.columns.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Columns ({selected.columns.length})</label>
              <div className="flex flex-wrap gap-1.5">
                {selected.columns.map((c, j) => (
                  <span key={j} className="text-xs px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg">{c}</span>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={() => setShowCreate(false)}
              className="px-5 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition">Cancel</button>
            <button type="submit" disabled={loading || !form.name.trim() || !form.key.trim()}
              className="px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white text-sm font-medium rounded-xl hover:from-primary-700 hover:to-primary-600 shadow-lg shadow-primary-200 dark:shadow-primary-900/30 transition-all active:scale-95 disabled:opacity-50">
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
