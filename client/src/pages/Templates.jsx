import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Modal from '../components/common/Modal';

const diamondColors = ['#7d9bb8', '#c2a24b', '#8fae8b', '#b87d6e', '#7d9bb8', '#c2a24b', '#8fae8b'];

const templates = [
  {
    name: 'Bug Tracking',
    description: 'Standard bug reporting and tracking workflow',
    columns: ['To Do', 'In Progress', 'Review', 'Testing', 'Done'],
  },
  {
    name: 'Sprint Planning',
    description: 'Agile sprint with backlog management',
    columns: ['Backlog', 'To Do', 'In Progress', 'Review', 'Done'],
  },
  {
    name: 'Content Calendar',
    description: 'Plan and track content creation',
    columns: ['Idea', 'Writing', 'Review', 'Scheduled', 'Published'],
  },
  {
    name: 'Product Roadmap',
    description: 'Track features from ideation to launch',
    columns: ['Discovery', 'Design', 'Development', 'Testing', 'Launched'],
  },
  {
    name: 'Support Queue',
    description: 'Manage customer support tickets',
    columns: ['New', 'In Progress', 'Waiting', 'Resolved', 'Closed'],
  },
  {
    name: 'HR Onboarding',
    description: 'New employee onboarding checklist',
    columns: ['To Do', 'In Progress', 'Review', 'Done'],
  },
  {
    name: 'Custom',
    description: 'Start from scratch with default columns',
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
      <h1 className="font-serif font-normal text-text text-2xl mb-2">Templates</h1>
      <p className="text-text-secondary text-xs mb-6">Pre-built board templates — click to create a project</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((t, i) => (
          <button key={i} onClick={() => canCreate ? openCreate(t) : null}
            disabled={!canCreate}
            className={`text-left bg-panel border border-border p-5 ${
              !canCreate ? 'opacity-60 cursor-not-allowed' : ''
            }`}>
            <div className="mb-3"><div className="w-4 h-4 rotate-45" style={{ backgroundColor: diamondColors[i] }} /></div>
            <h3 className="font-serif font-normal text-text mb-1">{t.name}</h3>
            <p className="text-text-secondary text-xs mb-3">{t.description}</p>
            <div className="flex flex-wrap gap-1">
              {t.columns.map((c, j) => (
                <span key={j} className="text-[10px] px-2 py-0.5 bg-muted text-text-secondary">{c}</span>
              ))}
              {t.columns.length === 0 && (
                <span className="text-[10px] px-2 py-0.5 bg-muted text-text-secondary">Default</span>
              )}
            </div>
          </button>
        ))}
      </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title={`Create Project — ${selected?.name || ''}`}>
        <form onSubmit={createFromTemplate} className="space-y-4">
          <div>
            <label className="block text-xs tracking-[0.15em] uppercase font-sans text-text-secondary mb-1">Project Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Bug Tracker"
              className="w-full px-3.5 py-2.5 border border-border bg-panel text-text text-sm outline-none" />
          </div>
          <div>
            <label className="block text-xs tracking-[0.15em] uppercase font-sans text-text-secondary mb-1">Project Key <span className="text-text-secondary">(2-5 letters)</span></label>
            <input value={form.key} onChange={(e) => setForm({ ...form, key: e.target.value.toUpperCase() })} required maxLength={5} placeholder="e.g. BUG"
              className="w-full px-3.5 py-2.5 border border-border bg-panel text-text text-sm outline-none uppercase" />
          </div>
          {selected?.columns.length > 0 && (
            <div>
              <label className="block text-xs tracking-[0.15em] uppercase font-sans text-text-secondary mb-2">Columns ({selected.columns.length})</label>
              <div className="flex flex-wrap gap-1.5">
                {selected.columns.map((c, j) => (
                  <span key={j} className="text-xs px-2.5 py-1 bg-muted text-text-secondary">{c}</span>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={() => setShowCreate(false)}
              className="bg-transparent text-text-secondary border border-border text-xs tracking-[0.15em] uppercase font-sans px-5 py-2.5 hover:text-text">Cancel</button>
            <button type="submit" disabled={loading || !form.name.trim() || !form.key.trim()}
              className="bg-text text-page border border-border text-xs tracking-[0.15em] uppercase font-sans px-5 py-2.5 disabled:opacity-50">
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
