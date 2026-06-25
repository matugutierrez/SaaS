import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const statusColors = {
  'Backlog': { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-400', dot: 'bg-gray-400' },
  'To Do': { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-400', dot: 'bg-gray-500' },
  'In Progress': { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400', dot: 'bg-blue-500' },
  'Review': { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-500' },
  'Testing': { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-400', dot: 'bg-purple-500' },
  'Done': { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400', dot: 'bg-green-500' },
  'Archived': { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-400', dot: 'bg-gray-400' },
};

const barColors = {
  'Backlog': 'bg-gray-400',
  'To Do': 'bg-gray-500',
  'In Progress': 'bg-blue-500',
  'Review': 'bg-amber-500',
  'Testing': 'bg-purple-500',
  'Done': 'bg-green-500',
  'Archived': 'bg-gray-400',
};

const statCards = [
  { label: 'Total Tasks', key: 'total', icon: '📋', accent: 'border-l-blue-500', circle: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400', number: 'text-blue-600 dark:text-blue-400' },
  { label: 'In Progress', key: 'inProgress', icon: '⚡', accent: 'border-l-amber-500', circle: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400', number: 'text-amber-600 dark:text-amber-400' },
  { label: 'Completed', key: 'completed', icon: '✅', accent: 'border-l-emerald-500', circle: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400', number: 'text-emerald-600 dark:text-emerald-400' },
  { label: 'Overdue', key: 'overdue', icon: '⚠️', accent: 'border-l-rose-500', circle: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400', number: 'text-rose-600 dark:text-rose-400' },
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
        <div className="flex gap-4">
          {[1,2,3,4].map(i => <div key={i} className="flex-1 h-28 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />)}
        </div>
        <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
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
    const color = up ? 'text-emerald-500' : down ? 'text-rose-500' : 'text-gray-400';
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
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Dashboard</h1>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">Welcome back, {user?.name}</p>
        </div>
        {canCreate && (
          <button onClick={() => setShowCreate(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl text-sm font-medium hover:from-primary-700 hover:to-primary-600 shadow-lg shadow-primary-200 dark:shadow-primary-900/30 transition-all active:scale-95">
            + New Project
          </button>
        )}
      </div>

      {data && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((card, i) => {
              const val = getStatValue(card.key);
              const trend = calcTrend(card.key);
              return (
                <div key={card.key} className={`bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 border-l-4 ${card.accent} p-5 shadow-sm hover:shadow-md transition-all duration-200`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg ${card.circle}`}>
                      {card.icon}
                    </div>
                    <span className={`text-3xl font-bold ${card.number} ${val === 0 ? 'opacity-50' : ''}`}>{val}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{card.label}</p>
                    <TrendIndicator value={trend} inverted={isInverted(card.key)} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm dark:shadow-gray-900/30">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">Tasks by Status</h3>
                <div className="space-y-3">
                  {data.byColumn?.sort((a, b) => {
                    const order = ['Backlog', 'To Do', 'In Progress', 'Review', 'Testing', 'Done', 'Archived'];
                    return order.indexOf(a._id) - order.indexOf(b._id);
                  }).map(c => {
                    const colors = statusColors[c._id] || { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' };
                    const bar = barColors[c._id] || 'bg-gray-400';
                    return (
                      <div key={c._id} className="flex items-center gap-3">
                        <span className={`w-2.5 h-2.5 rounded-full ${colors.dot}`} />
                        <span className="text-sm text-gray-600 dark:text-gray-400 w-28">{c._id}</span>
                        <div className="flex-1 h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-500 ${bar}`}
                            style={{ width: `${(c.count / maxCount) * 100}%` }} />
                        </div>
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 w-8 text-right">{c.count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm dark:shadow-gray-900/30">
                <div className="px-6 py-4 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200">Recent Activity</h3>
                  <span className="text-xs text-gray-400 dark:text-gray-500">{data.recent?.length || 0} items</span>
                </div>
                <div className="divide-y divide-gray-50 dark:divide-gray-800">
                  {data.recent?.length === 0 ? (
                    <p className="text-center text-gray-400 dark:text-gray-600 text-sm py-10">No recent activity</p>
                  ) : data.recent?.map((task) => {
                    const colors = statusColors[task.columnName] || statusColors['Backlog'];
                    return (
                      <Link key={task._id} to={`/tasks/${task._id}`}
                        className="flex items-center gap-3 px-6 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition group">
                        <div className={`w-2 h-2 rounded-full ${colors.dot}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition">{task.title}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                            {task.assignee?.name || 'Unassigned'} · {new Date(task.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}>{task.columnName}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm dark:shadow-gray-900/30">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">My Tasks</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                    <span className="text-sm text-blue-700 dark:text-blue-400 font-medium">Assigned to me</span>
                    <span className="text-lg font-bold text-blue-700 dark:text-blue-400">{data.assignedToMe}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                    <span className="text-sm text-amber-700 dark:text-amber-400 font-medium">Overdue</span>
                    <span className="text-lg font-bold text-amber-700 dark:text-amber-400">{data.overdue}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                    <span className="text-sm text-green-700 dark:text-green-400 font-medium">Completed</span>
                    <span className="text-lg font-bold text-green-700 dark:text-green-400">{data.byColumn?.find(c => c._id === 'Done')?.count || 0}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm dark:shadow-gray-900/30">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">Projects</h3>
                <div className="space-y-2">
                  {projects.length === 0 ? (
                    <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">No projects yet</p>
                  ) : projects.slice(0, 5).map(p => (
                    <Link key={p._id} to={`/projects/${p._id}/board`}
                      className="flex items-center gap-2 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition group">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                        {p.key}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition">{p.name}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">{p.lead?.name || 'No lead'}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowCreate(false)}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6 animate-[slideUp_0.2s_ease-out]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center text-white text-lg">📁</div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Create Project</h2>
                <p className="text-xs text-gray-400 dark:text-gray-500">Start a new project for your team</p>
              </div>
            </div>
            <form onSubmit={createProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project Name</label>
                <input value={newProject.name} onChange={(e) => setNewProject({ ...newProject, name: e.target.value })} required placeholder="e.g. Marketing Campaign"
                  className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project Key <span className="text-gray-400">(2-5 letters)</span></label>
                <input value={newProject.key} onChange={(e) => setNewProject({ ...newProject, key: e.target.value.toUpperCase() })} required maxLength={5} placeholder="e.g. MKT"
                  className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none uppercase transition" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea value={newProject.description} onChange={(e) => setNewProject({ ...newProject, description: e.target.value })} rows={3} placeholder="What's this project about?"
                  className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition resize-none" />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button type="button" onClick={() => setShowCreate(false)}
                  className="px-5 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition">Cancel</button>
                <button type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white text-sm font-medium rounded-xl hover:from-primary-700 hover:to-primary-600 shadow-lg shadow-primary-200 dark:shadow-primary-900/30 transition-all active:scale-95">
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
