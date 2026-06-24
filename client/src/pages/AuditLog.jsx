import { useState, useEffect } from 'react';
import api from '../services/api';

const actionMeta = {
  create: { color: 'bg-green-100 text-green-700', label: 'Created' },
  update: { color: 'bg-blue-100 text-blue-700', label: 'Updated' },
  delete: { color: 'bg-red-100 text-red-700', label: 'Deleted' },
  move: { color: 'bg-amber-100 text-amber-700', label: 'Moved' },
};

export default function AuditLog() {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState({ entity: '', action: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: page.toString() });
    if (filter.entity) params.append('entity', filter.entity);
    if (filter.action) params.append('action', filter.action);
    api.get(`/audit?${params}`)
      .then((res) => {
        setLogs(res.data.logs);
        setTotalPages(res.data.pages);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, filter]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Audit Log</h1>
        <p className="text-sm text-gray-400 mt-0.5">Track every change in your organization</p>
      </div>

      <div className="flex gap-3 mb-4">
        <select value={filter.entity} onChange={(e) => { setFilter({ ...filter, entity: e.target.value }); setPage(1); }}
          className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none transition bg-white">
          <option value="">All entities</option>
          <option value="Task">Task</option>
          <option value="Project">Project</option>
          <option value="Document">Document</option>
          <option value="Team">Team</option>
        </select>
        <select value={filter.action} onChange={(e) => { setFilter({ ...filter, action: e.target.value }); setPage(1); }}
          className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none transition bg-white">
          <option value="">All actions</option>
          <option value="create">Create</option>
          <option value="update">Update</option>
          <option value="delete">Delete</option>
          <option value="move">Move</option>
        </select>
        <span className="text-sm text-gray-400 self-center ml-auto">{totalPages > 0 && `Page ${page} of ${totalPages}`}</span>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        {loading ? (
          <div className="space-y-2 p-6">
            {[1,2,3,4,5].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-50">
              {logs.length === 0 && (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </div>
                  <p className="text-gray-400 text-sm">No audit logs found</p>
                </div>
              )}
              {logs.map((log) => {
                const meta = actionMeta[log.action] || { color: 'bg-gray-100 text-gray-700', label: log.action };
                return (
                  <div key={log._id} className="px-6 py-4 flex items-center gap-4 text-sm hover:bg-gray-50/50 transition">
                    <div className="w-9 h-9 bg-gradient-to-br from-gray-400 to-gray-600 rounded-xl flex items-center justify-center text-sm font-medium text-white flex-shrink-0 shadow-sm">
                      {log.actor?.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-700">
                        <span className="font-medium text-gray-800">{log.actor?.name}</span>
                        {' '}
                        <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${meta.color}`}>{meta.label}</span>
                        {' '}
                        <span className="font-medium">{log.entity}</span>
                      </p>
                      {log.changes && Object.keys(log.changes).length > 0 && (
                        <p className="text-xs text-gray-400 mt-0.5 truncate">
                          {Object.entries(log.changes).map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v).slice(0, 50) : v}`).join(', ').slice(0, 120)}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 px-6 py-4 border-t border-gray-50">
                <button disabled={page <= 1} onClick={() => setPage(page - 1)}
                  className="px-4 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition font-medium">Previous</button>
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button key={p} onClick={() => setPage(p)}
                      className={`w-8 h-8 text-sm rounded-xl font-medium transition ${p === page ? 'bg-primary-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}>
                      {p}
                    </button>
                  ))}
                </div>
                <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}
                  className="px-4 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition font-medium">Next</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
