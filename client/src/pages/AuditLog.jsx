import { useState, useEffect } from 'react';
import api from '../services/api';

const actionMeta = {
  create: { color: 'text-accent-sage', label: 'Created' },
  update: { color: 'text-accent-blue', label: 'Updated' },
  delete: { color: 'text-accent-terracotta', label: 'Deleted' },
  move: { color: 'text-accent-ocre', label: 'Moved' },
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
        <h1 className="font-serif font-normal text-2xl text-text">Audit Log</h1>
        <p className="text-text-secondary text-xs mt-0.5">Track every change in your organization</p>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <select value={filter.entity} onChange={(e) => { setFilter({ ...filter, entity: e.target.value }); setPage(1); }}
          className="bg-transparent border border-border text-text text-xs px-3 md:px-4 py-2 md:py-2.5 outline-none flex-1 md:flex-none min-w-[120px]">
          <option value="">All entities</option>
          <option value="Task">Task</option>
          <option value="Project">Project</option>
          <option value="Document">Document</option>
          <option value="Team">Team</option>
        </select>
        <select value={filter.action} onChange={(e) => { setFilter({ ...filter, action: e.target.value }); setPage(1); }}
          className="bg-transparent border border-border text-text text-xs px-3 md:px-4 py-2 md:py-2.5 outline-none flex-1 md:flex-none min-w-[120px]">
          <option value="">All actions</option>
          <option value="create">Create</option>
          <option value="update">Update</option>
          <option value="delete">Delete</option>
          <option value="move">Move</option>
        </select>
        <span className="text-text-secondary text-xs self-center ml-auto w-full md:w-auto text-right">{totalPages > 0 && `Page ${page} of ${totalPages}`}</span>
      </div>

      <div className="bg-panel border border-border">
        {loading ? (
          <div className="space-y-2 p-6">
            {[1,2,3,4,5].map(i => <div key={i} className="h-16 bg-muted animate-pulse" />)}
          </div>
        ) : (
          <>
            <div className="divide-y divide-border-light">
              {logs.length === 0 && (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-muted flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </div>
                  <p className="text-text-secondary text-xs">No audit logs found</p>
                </div>
              )}
              {logs.map((log) => {
                const meta = actionMeta[log.action] || { color: 'text-text-secondary', label: log.action };
                return (
                  <div key={log._id} className="px-4 md:px-6 py-3 md:py-4 flex items-center gap-3 md:gap-4 text-sm hover:bg-muted">
                    <div className="w-9 h-9 bg-muted flex items-center justify-center text-sm font-medium text-text-secondary flex-shrink-0">
                      {log.actor?.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-text">
                        <span className="font-medium text-text">{log.actor?.name}</span>
                        {' '}
                        <span className={`text-[10px] tracking-[0.1em] uppercase font-medium ${meta.color}`}>{meta.label}</span>
                        {' '}
                        <span className="font-serif text-text">{log.entity}</span>
                      </p>
                      {log.changes && Object.keys(log.changes).length > 0 && (
                        <p className="text-text-secondary text-xs mt-0.5 truncate">
                          {Object.entries(log.changes).map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v).slice(0, 50) : v}`).join(', ').slice(0, 120)}
                        </p>
                      )}
                    </div>
                    <span className="text-text-secondary text-xs flex-shrink-0 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
            {totalPages > 1 && (
              <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 px-4 md:px-6 py-3 md:py-4 border-t border-border-light">
                <button disabled={page <= 1} onClick={() => setPage(page - 1)}
                  className="bg-transparent text-text-secondary border border-border text-[10px] md:text-xs tracking-[0.15em] uppercase font-sans px-3 md:px-4 py-1.5 md:py-2 disabled:opacity-50">Previous</button>
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button key={p} onClick={() => setPage(p)}
                      className={`w-7 h-7 md:w-8 md:h-8 text-[11px] md:text-xs font-medium ${p === page ? 'bg-text text-page' : 'text-text-secondary hover:bg-muted'}`}>
                      {p}
                    </button>
                  ))}
                </div>
                <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}
                  className="bg-transparent text-text-secondary border border-border text-[10px] md:text-xs tracking-[0.15em] uppercase font-sans px-3 md:px-4 py-1.5 md:py-2 disabled:opacity-50">Next</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
