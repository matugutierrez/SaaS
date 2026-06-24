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
      <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse w-48" />
      <div className="grid grid-cols-2 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="h-40 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />)}
      </div>
    </div>
  );

  const total = data?.total || 0;
  const done = data?.byColumn?.find(c => c._id === 'Done')?.count || 0;
  const inProgress = data?.byColumn?.find(c => c._id === 'In Progress')?.count || 0;
  const overdue = data?.overdue || 0;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Reports</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
          <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">Task Completion</h3>
          <div className="flex items-end gap-4 mb-4">
            <div className="text-4xl font-bold text-gray-800 dark:text-gray-100">{total > 0 ? Math.round((done / total) * 100) : 0}%</div>
            <div className="text-sm text-gray-400 dark:text-gray-500 mb-1">of tasks completed</div>
          </div>
          <div className="w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 rounded-full transition-all duration-500" style={{ width: `${total > 0 ? (done / total) * 100 : 0}%` }} />
          </div>
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{total}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">Total</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{done}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">Done</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-rose-600">{overdue}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">Overdue</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
          <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">Tasks by Status</h3>
          <div className="space-y-3">
            {data?.byColumn?.sort((a, b) => {
              const order = ['Backlog', 'To Do', 'In Progress', 'Review', 'Testing', 'Done', 'Archived'];
              return order.indexOf(a._id) - order.indexOf(b._id);
            }).map(c => {
              const pct = total > 0 ? Math.round((c.count / total) * 100) : 0;
              const colors = {
                'Backlog': 'bg-gray-400', 'To Do': 'bg-gray-500', 'In Progress': 'bg-blue-500',
                'Review': 'bg-amber-500', 'Testing': 'bg-purple-500', 'Done': 'bg-green-500', 'Archived': 'bg-gray-400'
              };
              return (
                <div key={c._id} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 dark:text-gray-400 w-24">{c._id}</span>
                  <div className="flex-1 h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${colors[c._id] || 'bg-gray-400'}`}
                      style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 w-16 text-right">{c.count} ({pct}%)</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
          <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">Priority Distribution</h3>
          <div className="space-y-3">
            {['urgent', 'high', 'medium', 'low'].map(p => {
              const count = data?.byPriority?.find(c => c._id === p)?.count || 0;
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              const colors = { urgent: 'bg-red-500', high: 'bg-orange-500', medium: 'bg-blue-500', low: 'bg-gray-400' };
              return (
                <div key={p} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 dark:text-gray-400 w-16 capitalize">{p}</span>
                  <div className="flex-1 h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${colors[p]}`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 w-16 text-right">{count} ({pct}%)</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
          <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">Velocity</h3>
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">Tasks completed in the last 30 days</p>
          <div className="text-5xl font-bold text-primary-600 dark:text-primary-400 mb-2">{done}</div>
          <p className="text-sm text-gray-500 dark:text-gray-400">tasks completed</p>
          <div className="mt-4 flex items-center gap-2 text-sm">
            <span className="text-gray-500 dark:text-gray-400">In progress:</span>
            <span className="font-semibold text-gray-800 dark:text-gray-200">{inProgress}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
