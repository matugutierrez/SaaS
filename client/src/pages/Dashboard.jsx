import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const statusColors = {
  'Backlog': { text: 'text-text-secondary', diamond: '#8a8577' },
  'To Do': { text: 'text-text-secondary', diamond: '#8a8577' },
  'In Progress': { text: 'text-accent-blue', diamond: '#7d9bb8' },
  'Review': { text: 'text-accent-ocre', diamond: '#c2a24b' },
  'Testing': { text: 'text-accent-terracotta', diamond: '#b87d6e' },
  'Done': { text: 'text-accent-sage', diamond: '#8fae8b' },
  'Archived': { text: 'text-text-secondary', diamond: '#8a8577' },
};

const barFillColors = {
  'Backlog': 'bg-text-secondary',
  'To Do': 'bg-text-secondary',
  'In Progress': 'bg-accent-blue',
  'Review': 'bg-accent-ocre',
  'Testing': 'bg-accent-terracotta',
  'Done': 'bg-accent-sage',
  'Archived': 'bg-text-secondary',
};

const accentColorMap = {
  'accent-blue': '#7d9bb8',
  'accent-ocre': '#c2a24b',
  'accent-sage': '#8fae8b',
  'accent-terracotta': '#b87d6e',
};

const statCards = [
  { label: 'Total Tasks', key: 'total', accent: 'accent-blue' },
  { label: 'In Progress', key: 'inProgress', accent: 'accent-ocre' },
  { label: 'Completed', key: 'completed', accent: 'accent-sage' },
  { label: 'Overdue', key: 'overdue', accent: 'accent-terracotta' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [projects, setProjects] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newProject, setNewProject] = useState({ name: '', key: '', description: '' });

  useEffect(() => {
    Promise.all([
      api.get('/tasks/dashboard'),
      api.get('/projects'),
      new Promise(r => setTimeout(r, 400)),
    ]).then(([dashRes, projRes]) => {
      setData(dashRes.data);
      setProjects(projRes.data.projects);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const createProject = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/projects', newProject);
      setProjects((prev) => [...prev, res.data.project]);
      setShowCreate(false);
      setNewProject({ name: '', key: '', description: '' });
    } catch (err) {
      alert(err.response?.data?.error || 'Error creating project');
    }
  };

  const canCreate = user?.role === 'owner' || user?.role === 'admin_plus' || user?.role === 'admin';

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex bg-panel border border-border">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex-1 h-28 animate-pulse" />
          ))}
        </div>
        <div className="h-64 bg-panel border border-border animate-pulse" />
      </div>
    );
  }

  const maxCount = Math.max(...(data?.byColumn?.map(c => c.count) || [1]), 1);

  const getStatValue = (key) => {
    if (key === 'total') return data?.total || 0;
    if (key === 'inProgress') return data?.byColumn?.find(c => c._id === 'In Progress')?.count || 0;
    if (key === 'completed') return data?.byColumn?.find(c => c._id === 'Done')?.count || 0;
    if (key === 'overdue') return data?.overdue || 0;
    return 0;
  };

  const calcTrend = (key) => {
    const t = data?.trend?.[key];
    if (!t) return null;
    if (t.previous === 0 && t.current > 0) return 100;
    if (t.previous === 0 && t.current === 0) return 0;
    return Math.round(((t.current - t.previous) / t.previous) * 100);
  };

  const trendUp = (val) => val > 0;
  const trendDown = (val) => val < 0;

  const isInverted = (key) => key === 'overdue';

  const TrendIndicator = ({ value, inverted }) => {
    if (value === null || value === 0) return null;
    const up = inverted ? trendDown(value) : trendUp(value);
    const down = inverted ? trendUp(value) : trendDown(value);
    const color = up ? 'text-accent-sage' : down ? 'text-accent-terracotta' : 'text-text-secondary';
    return (
      <div className={`flex items-center gap-1 ${color}`}>
        {up ? (
          <svg className="w-4 h-4" viewBox="0 0 24 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 14 13 9 8 1 16" />
            <polyline points="17 4 23 4 23 10" />
          </svg>
        ) : (
          <svg className="w-4 h-4" viewBox="0 0 24 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 16 14 7 9 12 1 4" />
            <polyline points="17 16 23 16 23 10" />
          </svg>
        )}
        <span className="text-xs font-bold">{up ? '+' : ''}{value}%</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif font-normal text-2xl text-text">Dashboard</h1>
          <p className="font-sans text-xs text-text-secondary tracking-[0.15em] mt-0.5">Welcome back, {user?.name}</p>
        </div>
        {canCreate && (
          <button onClick={() => setShowCreate(true)}
            className="bg-transparent text-text-secondary border border-border text-xs tracking-[0.15em] uppercase font-sans px-5 py-2.5">
            + New Project
          </button>
        )}
      </div>

      {data && (
        <>
          <div className="flex bg-panel border border-border">
            {statCards.map((card, i) => {
              const val = getStatValue(card.key);
              const trend = calcTrend(card.key);
              const color = accentColorMap[card.accent];
              return (
                <div key={card.key} className={`flex-1 px-6 py-5 ${i < 3 ? 'border-r border-border-light' : ''}`}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rotate-45" style={{ backgroundColor: color }} />
                      <span className="font-sans text-xs tracking-[0.22em] uppercase text-text-secondary">{card.label}</span>
                    </div>
                    <TrendIndicator value={trend} inverted={isInverted(card.key)} />
                  </div>
                  <div className="font-serif italic text-5xl text-text mt-1">{val}</div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-panel border border-border">
                <div className="p-6">
                  <h3 className="font-serif font-normal text-text text-lg mb-4">Tasks by Status</h3>
                  <div className="space-y-3">
                    {data.byColumn?.sort((a, b) => {
                      const order = ['Backlog', 'To Do', 'In Progress', 'Review', 'Testing', 'Done', 'Archived'];
                      return order.indexOf(a._id) - order.indexOf(b._id);
                    }).map(c => {
                      const colors = statusColors[c._id] || { text: 'text-text-secondary', diamond: '#8a8577' };
                      const bar = barFillColors[c._id] || 'bg-text-secondary';
                      return (
                        <div key={c._id} className="flex items-center gap-3">
                          <div className="w-2.5 h-2.5 rotate-45" style={{ backgroundColor: colors.diamond }} />
                          <span className="text-sm text-text-secondary w-28">{c._id}</span>
                          <div className="flex-1 h-3 bg-border-light overflow-hidden">
                            <div className={`h-full transition-all duration-500 ${bar}`}
                              style={{ width: `${(c.count / maxCount) * 100}%` }} />
                          </div>
                          <span className="text-sm font-semibold text-text w-8 text-right">{c.count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="bg-panel border border-border">
                <div className="px-6 py-4 border-b border-border-light flex items-center justify-between">
                  <h3 className="font-serif font-normal text-text">Recent Activity</h3>
                  <span className="font-sans text-xs tracking-[0.15em] uppercase text-text-secondary">{data.recent?.length || 0} items</span>
                </div>
                <div className="divide-y divide-border-light">
                  {data.recent?.length === 0 ? (
                    <p className="text-center text-text-secondary text-sm py-10">No recent activity</p>
                  ) : data.recent?.map((task) => {
                    const colors = statusColors[task.columnName] || statusColors['Backlog'];
                    return (
                      <Link key={task._id} to={`/tasks/${task._id}`}
                        className="flex items-center gap-3 px-6 py-3.5 transition">
                        <div className="w-2 h-2 rotate-45" style={{ backgroundColor: colors.diamond }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-accent-blue truncate">{task.title}</p>
                          <p className="text-xs text-text-secondary mt-0.5">
                            {task.assignee?.name || 'Unassigned'} · {new Date(task.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 bg-[#1a1f29] border border-border-light ${colors.text}`}>{task.columnName}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-panel border border-border">
                <div className="p-6">
                  <h3 className="font-serif font-normal text-text text-lg mb-4">My Tasks</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-4 py-3 border-l-2 border-accent-blue">
                      <span className="text-sm text-accent-blue font-medium">Assigned to me</span>
                      <span className="text-lg font-bold text-accent-blue">{data.assignedToMe}</span>
                    </div>
                    <div className="flex items-center justify-between px-4 py-3 border-l-2 border-accent-ocre">
                      <span className="text-sm text-accent-ocre font-medium">Overdue</span>
                      <span className="text-lg font-bold text-accent-ocre">{data.overdue}</span>
                    </div>
                    <div className="flex items-center justify-between px-4 py-3 border-l-2 border-accent-sage">
                      <span className="text-sm text-accent-sage font-medium">Completed</span>
                      <span className="text-lg font-bold text-accent-sage">{data.byColumn?.find(c => c._id === 'Done')?.count || 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-panel border border-border">
                <div className="p-6">
                  <h3 className="font-serif font-normal text-text text-lg mb-4">Projects</h3>
                  <div className="space-y-2">
                    {projects.length === 0 ? (
                      <p className="text-sm text-text-secondary text-center py-4">No projects yet</p>
                    ) : projects.slice(0, 5).map(p => (
                      <Link key={p._id} to={`/projects/${p._id}/board`}
                        className="flex items-center gap-2 p-2.5 transition">
                        <div className="w-8 h-8 bg-[#1a1f29] flex items-center justify-center text-text-secondary text-xs font-bold">
                          {p.key}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-text truncate">{p.name}</p>
                          <p className="text-xs text-text-secondary">{p.lead?.name || 'No lead'}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {showCreate && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={() => setShowCreate(false)}>
          <div className="bg-panel border border-border w-full max-w-lg mx-4 p-6 animate-[slideUp_0.2s_ease-out]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 flex items-center justify-center">
                <div className="w-5 h-5 rotate-45" style={{ backgroundColor: '#7d9bb8' }} />
              </div>
              <div>
                <h2 className="font-serif font-normal text-lg text-text">Create Project</h2>
                <p className="font-sans text-xs tracking-[0.15em] uppercase text-text-secondary">Start a new project for your team</p>
              </div>
            </div>
            <form onSubmit={createProject} className="space-y-4">
              <div>
                <label className="block font-sans text-xs tracking-[0.15em] uppercase text-text-secondary mb-1">Project Name</label>
                <input value={newProject.name} onChange={(e) => setNewProject({ ...newProject, name: e.target.value })} required placeholder="e.g. Marketing Campaign"
                  className="w-full px-3.5 py-2.5 border border-border bg-transparent text-text text-xs outline-none transition" />
              </div>
              <div>
                <label className="block font-sans text-xs tracking-[0.15em] uppercase text-text-secondary mb-1">Project Key <span className="text-text-secondary">(2-5 letters)</span></label>
                <input value={newProject.key} onChange={(e) => setNewProject({ ...newProject, key: e.target.value.toUpperCase() })} required maxLength={5} placeholder="e.g. MKT"
                  className="w-full px-3.5 py-2.5 border border-border bg-transparent text-text text-xs outline-none uppercase transition" />
              </div>
              <div>
                <label className="block font-sans text-xs tracking-[0.15em] uppercase text-text-secondary mb-1">Description</label>
                <textarea value={newProject.description} onChange={(e) => setNewProject({ ...newProject, description: e.target.value })} rows={3} placeholder="What's this project about?"
                  className="w-full px-3.5 py-2.5 border border-border bg-transparent text-text text-xs outline-none transition resize-none" />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button type="button" onClick={() => setShowCreate(false)}
                  className="bg-transparent text-text-secondary border border-border text-xs tracking-[0.15em] uppercase font-sans px-5 py-2.5">Cancel</button>
                <button type="submit"
                  className="bg-text text-page border border-border text-xs tracking-[0.15em] uppercase font-sans px-5 py-2.5">
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
