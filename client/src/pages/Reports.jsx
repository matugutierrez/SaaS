import { useState, useEffect } from 'react';
import api from '../services/api';

export default function Reports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/tasks/dashboard').then((res) => {
      setData(res.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-4">
      <div className="h-10 bg-panel border border-border animate-pulse w-48" />
      <div className="grid grid-cols-2 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="h-40 bg-panel border border-border animate-pulse" />)}
      </div>
    </div>
  );

  const total = data?.total || 0;
  const done = data?.byColumn?.find(c => c._id === 'Done')?.count || 0;
  const inProgress = data?.byColumn?.find(c => c._id === 'In Progress')?.count || 0;
  const overdue = data?.overdue || 0;

  return (
    <div>
      <h1 className="font-serif font-normal text-text text-2xl mb-6">Reports</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-panel border border-border p-4 md:p-6">
          <h3 className="font-serif font-normal text-text mb-3 md:mb-4">Task Completion</h3>
          <div className="flex items-end gap-4 mb-4">
            <div className="font-serif italic text-5xl text-text">{total > 0 ? Math.round((done / total) * 100) : 0}%</div>
            <div className="text-text-secondary text-xs tracking-[0.15em] uppercase mb-1">of tasks completed</div>
          </div>
          <div className="w-full h-2 bg-border">
            <div className="h-full bg-accent-sage transition-all duration-500" style={{ width: `${total > 0 ? (done / total) * 100 : 0}%` }} />
          </div>
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center">
              <p className="font-serif italic text-2xl text-text">{total}</p>
              <p className="text-text-secondary text-xs tracking-[0.15em] uppercase">Total</p>
            </div>
            <div className="text-center">
              <p className="font-serif italic text-2xl text-accent-sage">{done}</p>
              <p className="text-text-secondary text-xs tracking-[0.15em] uppercase">Done</p>
            </div>
            <div className="text-center">
              <p className="font-serif italic text-2xl text-accent-terracotta">{overdue}</p>
              <p className="text-text-secondary text-xs tracking-[0.15em] uppercase">Overdue</p>
            </div>
          </div>
        </div>

        <div className="bg-panel border border-border p-4 md:p-6">
          <h3 className="font-serif font-normal text-text mb-3 md:mb-4">Tasks by Status</h3>
          <div className="space-y-3">
            {data?.byColumn?.sort((a, b) => {
              const order = ['Backlog', 'To Do', 'In Progress', 'Review', 'Testing', 'Done', 'Archived'];
              return order.indexOf(a._id) - order.indexOf(b._id);
            }).map(c => {
              const pct = total > 0 ? Math.round((c.count / total) * 100) : 0;
              const colors = {
                'Backlog': 'bg-border', 'To Do': 'bg-accent-blue', 'In Progress': 'bg-accent-ocre',
                'Review': 'bg-accent-sage', 'Testing': 'bg-accent-terracotta', 'Done': 'bg-accent-sage', 'Archived': 'bg-border'
              };
              return (
                <div key={c._id} className="flex items-center gap-3">
                  <span className="text-sm text-text-secondary w-24">{c._id}</span>
                  <div className="flex-1 h-2 bg-border">
                    <div className={`h-full transition-all duration-500 ${colors[c._id] || 'bg-border'}`}
                      style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-sm text-text w-16 text-right">{c.count} ({pct}%)</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-panel border border-border p-4 md:p-6">
          <h3 className="font-serif font-normal text-text mb-3 md:mb-4">Priority Distribution</h3>
          <div className="space-y-3">
            {['urgent', 'high', 'medium', 'low'].map(p => {
              const count = data?.byPriority?.find(c => c._id === p)?.count || 0;
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              const colors = { urgent: 'bg-accent-terracotta', high: 'bg-accent-ocre', medium: 'bg-accent-blue', low: 'bg-accent-sage' };
              return (
                <div key={p} className="flex items-center gap-3">
                  <span className="text-sm text-text-secondary w-16 capitalize">{p}</span>
                  <div className="flex-1 h-2 bg-border">
                    <div className={`h-full transition-all duration-500 ${colors[p]}`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-sm text-text w-16 text-right">{count} ({pct}%)</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-panel border border-border p-4 md:p-6">
          <h3 className="font-serif font-normal text-text mb-3 md:mb-4">Velocity</h3>
          <p className="text-text-secondary text-xs mb-4">Tasks completed in the last 30 days</p>
          <div className="font-serif italic text-5xl text-text mb-2">{done}</div>
          <p className="text-text-secondary text-xs">tasks completed</p>
          <div className="mt-4 flex items-center gap-2 text-sm">
            <span className="text-text-secondary">In progress:</span>
            <span className="text-text">{inProgress}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
