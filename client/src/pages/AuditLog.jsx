import { useState, useEffect } from 'react';
import api from '../services/api';

export default function AuditLog() {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState({ entity: '', action: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page });
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
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Audit Log</h1>

      <div className="flex gap-3 mb-4">
        <select value={filter.entity} onChange={(e) => { setFilter({ ...filter, entity: e.target.value }); setPage(1); }}
          className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none">
          <option value="">All entities</option>
          <option value="Task">Task</option>
          <option value="Project">Project</option>
          <option value="Document">Document</option>
          <option value="Team">Team</option>
        </select>
        <select value={filter.action} onChange={(e) => { setFilter({ ...filter, action: e.target.value }); setPage(1); }}
          className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none">
          <option value="">All actions</option>
          <option value="create">Create</option>
          <option value="update">Update</option>
          <option value="delete">Delete</option>
          <option value="move">Move</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border">
        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div></div>
        ) : (
          <>
            <div className="divide-y">
              {logs.length === 0 && <p className="text-center text-gray-400 text-sm py-12">No audit logs found</p>}
              {logs.map((log) => (
                <div key={log._id} className="px-6 py-3 flex items-center gap-4 text-sm">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">
                    {log.actor?.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-700">
                      <span className="font-medium">{log.actor?.name}</span>
                      {' '}{log.action}d{' '}
                      <span className="font-medium">{log.entity}</span>
                    </p>
                    {log.changes && Object.keys(log.changes).length > 0 && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {Object.entries(log.changes).map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`).join(', ').slice(0, 100)}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">{new Date(log.timestamp).toLocaleString()}</span>
                </div>
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 px-6 py-4 border-t">
                <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50">Prev</button>
                <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
                <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50">Next</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
