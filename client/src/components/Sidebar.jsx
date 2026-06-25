import { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Modal from './common/Modal';

const iconPaths = {
  dashboard: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  calendar: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  reports: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  audit: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  settings: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
  board: 'M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7',
  chat: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
  wiki: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
  templates: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z',
};

const mainNav = [
  { path: '/', label: 'Dashboard', icon: iconPaths.dashboard, end: true },
  { path: '/calendar', label: 'Calendar', icon: iconPaths.calendar, end: true },
  { path: '/reports', label: 'Reports', icon: iconPaths.reports, end: true },
  { path: '/templates', label: 'Templates', icon: iconPaths.templates },
];

export default function Sidebar() {
  const [projects, setProjects] = useState([]);
  const [expanded, setExpanded] = useState(true);
  const [projectsOpen, setProjectsOpen] = useState(true);
  const [menuProject, setMenuProject] = useState(null);
  const [editProject, setEditProject] = useState(null);
  const [deleteProject, setDeleteProject] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const { user } = useAuth();
  const menuRef = useRef(null);

  useEffect(() => {
    api.get('/projects').then((res) => setProjects(res.data.projects)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!menuProject) return;
    const close = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuProject(null); };
    document.addEventListener('mousedown', close, { capture: true });
    return () => document.removeEventListener('mousedown', close, { capture: true });
  }, [menuProject]);

  const openEdit = (p) => {
    setEditProject(p);
    setEditName(p.name);
    setEditDesc(p.description || '');
    setMenuProject(null);
  };

  const saveEdit = async () => {
    if (!editName.trim()) return;
    try {
      const res = await api.put(`/projects/${editProject._id}`, { name: editName.trim(), description: editDesc.trim() });
      setProjects((prev) => prev.map((p) => p._id === editProject._id ? res.data.project : p));
      setEditProject(null);
    } catch (err) {
      alert(err.response?.data?.error || 'Error saving project');
    }
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/projects/${deleteProject._id}`);
      setProjects((prev) => prev.filter((p) => p._id !== deleteProject._id));
      setDeleteProject(null);
    } catch (err) {
      alert(err.response?.data?.error || 'Error deleting project');
    }
  };

  const canViewAudit = user?.role === 'owner' || user?.role === 'admin_plus';

  return (
    <aside className={`bg-white dark:bg-gray-950 border-r border-gray-100 dark:border-gray-800 flex flex-col transition-all duration-300 flex-shrink-0 relative z-[10000] ${expanded ? 'w-64' : 'w-[68px]'}`}>
      <div className="flex items-center justify-between px-4 h-14 border-b border-gray-100 dark:border-gray-800">
        <Link to="/" className={`flex items-center ${expanded ? 'gap-2.5' : 'justify-center flex-1'}`}>
          <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-primary-900/30">F</div>
          {expanded && <span className="text-base font-bold tracking-tight text-gray-800 dark:text-white">FlowSpace</span>}
        </Link>
        <button onClick={() => setExpanded(!expanded)} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
          <svg className="w-4 h-4 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={expanded ? 'M11 19l-7-7 7-7m8 14l-7-7 7-7' : 'M13 5l7 7-7 7M5 5l7 7-7 7'} />
          </svg>
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {mainNav.map((item) => (
          item.path.startsWith('/') && !item.comingSoon ? (
            <NavLink key={item.path} to={item.path} end={item.end} className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${isActive ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'}`
            }>
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} /></svg>
              {expanded && <span>{item.label}</span>}
            </NavLink>
          ) : expanded && item.comingSoon ? (
            <div key={item.path} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 dark:text-gray-600 cursor-not-allowed">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} /></svg>
              <span className="flex-1">{item.label}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 font-mono">soon</span>
            </div>
          ) : null
        ))}

        {canViewAudit && (
          <NavLink to="/audit" className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${isActive ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'}`
          }>
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPaths.audit} /></svg>
            {expanded && <span>Audit Log</span>}
          </NavLink>
        )}

        <NavLink to="/settings" className={({ isActive }) =>
          `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${isActive ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'}`
        }>
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPaths.settings} /></svg>
          {expanded && <span>Settings</span>}
        </NavLink>

        <div className="mt-4 mb-2 px-3">
          <button onClick={() => setProjectsOpen(!projectsOpen)} className="flex items-center justify-between w-full text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest hover:text-gray-600 dark:hover:text-gray-300 transition">
            {expanded && <span>Projects</span>}
            <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${projectsOpen ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>

        {projectsOpen && (
          <div className="space-y-0.5">
            {projects.length === 0 && expanded && (
              <p className="text-xs text-gray-400 dark:text-gray-600 text-center py-4">No projects yet</p>
            )}
            {projects.map((p) => (
              <div key={p._id}>
                <div className="flex items-center group">
                  <NavLink to={`/projects/${p._id}/board`} className={({ isActive }) =>
                    `flex-1 flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all duration-150 ${isActive ? 'bg-gray-100 dark:bg-gray-800 text-primary-700 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'}`
                  }>
                    <div className="w-6 h-6 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-[10px] font-bold text-gray-500 dark:text-gray-300 flex-shrink-0">
                      {p.key?.slice(0, 2)}
                    </div>
                    {expanded && <span className="truncate">{p.name}</span>}
                  </NavLink>
                  {expanded && (
                    <div className="relative pr-1">
                      <button onClick={(e) => { e.stopPropagation(); setMenuProject(menuProject === p._id ? null : p._id); }}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-all">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4z" /></svg>
                      </button>
                      {menuProject === p._id && (
                        <div ref={menuRef} className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-1 z-[99999]">
                          <button onClick={() => openEdit(p)} className="w-full text-left px-3.5 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            Edit
                          </button>
                          <button onClick={() => { setDeleteProject(p); setMenuProject(null); }} className="w-full text-left px-3.5 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {expanded && (
                  <div className="ml-9 mt-0.5 space-y-0.5">
                    {[
                      { to: `/projects/${p._id}/board`, label: 'Board', icon: iconPaths.board },
                      { to: `/projects/${p._id}/chat`, label: 'Chat', icon: iconPaths.chat },
                      { to: `/projects/${p._id}/wiki`, label: 'Wiki', icon: iconPaths.wiki },
                    ].map((link) => (
                      <NavLink key={link.to} to={link.to} className={({ isActive }) =>
                        `flex items-center gap-2 py-1.5 px-2 rounded-lg text-xs transition ${isActive ? 'text-primary-700 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20' : 'text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`
                      }>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={link.icon} /></svg>
                        {link.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </nav>

      {user && expanded && (
        <div className="px-3 py-3 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2 px-2">
            <span className="text-xs text-gray-400 dark:text-gray-500 capitalize">{user.role === 'admin_plus' ? 'Admin+' : user.role}</span>
          </div>
        </div>
      )}

      <Modal open={!!editProject} onClose={() => setEditProject(null)} title="Edit Project">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
            <input value={editName} onChange={(e) => setEditName(e.target.value)} required
              className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none transition" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} rows={3}
              className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none transition resize-none" />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={() => setEditProject(null)}
              className="px-5 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition">Cancel</button>
            <button type="button" onClick={saveEdit}
              className="px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white text-sm font-medium rounded-xl hover:from-primary-700 hover:to-primary-600 shadow-lg shadow-primary-200 dark:shadow-primary-900/30 transition-all active:scale-95">Save</button>
          </div>
        </div>
      </Modal>

      <Modal open={!!deleteProject} onClose={() => setDeleteProject(null)} title="Delete Project">
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Are you sure you want to delete <strong className="text-gray-800 dark:text-gray-200">{deleteProject?.name}</strong>?
            This will permanently remove the project, its board, tasks, chat messages, and all related data.
          </p>
          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={() => setDeleteProject(null)}
              className="px-5 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition">Cancel</button>
            <button type="button" onClick={confirmDelete}
              className="px-5 py-2.5 bg-red-600 text-white text-sm font-medium rounded-xl hover:bg-red-700 shadow-lg shadow-red-200 dark:shadow-red-900/30 transition-all active:scale-95">Delete</button>
          </div>
        </div>
      </Modal>
    </aside>
  );
}
