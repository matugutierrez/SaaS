import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const navItems = [
  { path: '/', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { path: '/audit', label: 'Audit Log', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', adminOnly: true },
  { path: '/settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
];

export default function Sidebar() {
  const [projects, setProjects] = useState([]);
  const [expanded, setExpanded] = useState(true);
  const [projectsOpen, setProjectsOpen] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    api.get('/projects').then((res) => setProjects(res.data.projects)).catch(() => {});
  }, []);

  const canViewAudit = user?.role === 'owner' || user?.role === 'admin_plus';

  return (
    <aside className={`bg-gray-900 text-white flex flex-col transition-all duration-200 ${expanded ? 'w-64' : 'w-16'}`}>
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-700">
        {expanded && <span className="text-lg font-bold">FlowSpace</span>}
        <button onClick={() => setExpanded(!expanded)} className="text-gray-400 hover:text-white p-1">
          <svg className={`w-5 h-5 transition ${!expanded && 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-2">
        {navItems.map((item) => {
          if (item.adminOnly && !canViewAudit) return null;
          return (
            <NavLink key={item.path} to={item.path} end={item.path === '/'} className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm transition ${isActive ? 'bg-primary-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`
            }>
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} /></svg>
              {expanded && <span>{item.label}</span>}
            </NavLink>
          );
        })}

        <div className="mt-4 px-4 py-2">
          <button onClick={() => setProjectsOpen(!projectsOpen)} className="flex items-center justify-between w-full text-xs text-gray-400 uppercase tracking-wider">
            {expanded && <span>Projects</span>}
            <svg className={`w-4 h-4 transition ${projectsOpen ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>

        {projectsOpen && projects.map((p) => (
          <div key={p._id} className="group">
            <NavLink to={`/projects/${p._id}/board`} className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 mx-2 rounded-lg text-sm transition ${isActive ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`
            }>
              <span className="w-2 h-2 rounded-full bg-primary-400 flex-shrink-0"></span>
              {expanded && <span className="truncate">{p.name}</span>}
            </NavLink>
            {expanded && (
              <div className="ml-8 space-y-0.5">
                <NavLink to={`/projects/${p._id}/board`} className={({ isActive }) => `block text-xs py-1 px-2 rounded ${isActive ? 'text-primary-400' : 'text-gray-500 hover:text-gray-300'}`}>Board</NavLink>
                <NavLink to={`/projects/${p._id}/chat`} className={({ isActive }) => `block text-xs py-1 px-2 rounded ${isActive ? 'text-primary-400' : 'text-gray-500 hover:text-gray-300'}`}>Chat</NavLink>
                <NavLink to={`/projects/${p._id}/wiki`} className={({ isActive }) => `block text-xs py-1 px-2 rounded ${isActive ? 'text-primary-400' : 'text-gray-500 hover:text-gray-300'}`}>Wiki</NavLink>
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
}
