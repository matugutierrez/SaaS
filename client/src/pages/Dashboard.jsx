import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [projects, setProjects] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', key: '', description: '' });

  useEffect(() => {
    api.get('/tasks/dashboard').then((res) => setData(res.data)).catch(() => {});
    api.get('/projects').then((res) => setProjects(res.data.projects)).catch(() => {});
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        {canCreate && (
          <button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition">
            + New Project
          </button>
        )}
      </div>

      {data && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border p-4">
            <p className="text-2xl font-bold text-gray-800">{data.total}</p>
            <p className="text-xs text-gray-500">Total Tasks</p>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <p className="text-2xl font-bold text-yellow-600">{data.overdue}</p>
            <p className="text-xs text-gray-500">Overdue</p>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <p className="text-2xl font-bold text-primary-600">{data.assignedToMe}</p>
            <p className="text-xs text-gray-500">Assigned to me</p>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <p className="text-2xl font-bold text-green-600">{data.byColumn?.find(c => c._id === 'Done')?.count || 0}</p>
            <p className="text-xs text-gray-500">Completed</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {data?.byColumn?.filter(c => c._id !== 'Done').map((c) => (
          <div key={c._id} className="bg-white rounded-xl border p-4">
            <h3 className="font-semibold text-sm text-gray-700 mb-2">{c._id}</h3>
            <p className="text-3xl font-bold text-primary-600">{c.count}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border">
        <div className="px-6 py-4 border-b">
          <h2 className="font-semibold">Recent Activity</h2>
        </div>
        <div className="divide-y">
          {data?.recent?.length === 0 && <p className="text-center text-gray-400 text-sm py-8">No recent activity</p>}
          {data?.recent?.map((task) => (
            <a key={task._id} href={`/tasks/${task._id}`} className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50 transition">
              <span className={`w-2 h-2 rounded-full ${task.columnName === 'Done' ? 'bg-green-400' : task.columnName === 'In Progress' ? 'bg-blue-400' : 'bg-gray-400'}`}></span>
              <p className="text-sm text-gray-700 flex-1 truncate">{task.title}</p>
              <span className="text-xs text-gray-400">{task.assignee?.name || 'Unassigned'}</span>
              <span className="text-xs text-gray-400">{new Date(task.updatedAt).toLocaleDateString()}</span>
            </a>
          ))}
        </div>
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowCreate(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">Create Project</h2>
            <form onSubmit={createProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                <input value={newProject.name} onChange={(e) => setNewProject({ ...newProject, name: e.target.value })} required
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Key <span className="text-gray-400">(e.g. PROJ)</span></label>
                <input value={newProject.key} onChange={(e) => setNewProject({ ...newProject, key: e.target.value.toUpperCase() })} required maxLength={5}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none uppercase" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={newProject.description} onChange={(e) => setNewProject({ ...newProject, description: e.target.value })} rows={3}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
