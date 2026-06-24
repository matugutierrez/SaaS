import { useState, useEffect } from 'react';
import api from '../services/api';

export default function Calendar() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/tasks/dashboard').then((res) => {
      setTasks(res.data.recent || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const tasksByDate = {};
  tasks.forEach(t => {
    if (!t.dueDate) return;
    const key = new Date(t.dueDate).toDateString();
    if (!tasksByDate[key]) tasksByDate[key] = [];
    tasksByDate[key].push(t);
  });

  const today = new Date();
  const days = Array.from({ length: 28 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    return d;
  });

  if (loading) return (
    <div className="space-y-4">
      <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse w-48" />
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 28 }).map((_, i) => <div key={i} className="h-24 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />)}
      </div>
    </div>
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Calendar</h1>
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="grid grid-cols-7 border-b border-gray-50 dark:border-gray-800">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 text-center">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((d, i) => {
            const key = d.toDateString();
            const dayTasks = tasksByDate[key] || [];
            const isToday = d.toDateString() === today.toDateString();
            return (
              <div key={i} className={`min-h-[100px] border-b border-r border-gray-50 dark:border-gray-800 p-2 ${isToday ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''}`}>
                <span className={`text-xs font-medium ${isToday ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}`}>
                  {d.getDate()}
                </span>
                <div className="mt-1 space-y-0.5">
                  {dayTasks.slice(0, 3).map(t => (
                    <a key={t._id} href={`/tasks/${t._id}`}
                      className="block text-[10px] px-1.5 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded truncate hover:bg-primary-200 dark:hover:bg-primary-900/50 transition">
                      {t.title}
                    </a>
                  ))}
                  {dayTasks.length > 3 && (
                    <span className="text-[10px] text-gray-400 px-1">+{dayTasks.length - 3} more</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
