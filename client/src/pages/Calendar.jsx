import { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/common/Modal';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function Calendar() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(null);
  const [showDetail, setShowDetail] = useState(null);
  const [newEvent, setNewEvent] = useState({ title: '', description: '', color: '#3b82f6' });

  useEffect(() => {
    const start = new Date(currentYear, currentMonth, 1);
    const end = new Date(currentYear, currentMonth + 1, 0);
    start.setDate(start.getDate() - start.getDay());
    end.setDate(end.getDate() + (6 - end.getDay()));

    Promise.all([
      api.get('/tasks', { params: { all: true } }),
      api.get('/calendar', { params: { start: start.toISOString(), end: end.toISOString() } }),
    ]).then(([tasksRes, eventsRes]) => {
      setTasks(tasksRes.data.tasks || []);
      setEvents(eventsRes.data.events || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [currentMonth, currentYear]);

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };

  const addEvent = async (e) => {
    e.preventDefault();
    if (!newEvent.title.trim()) return;
    try {
      const res = await api.post('/calendar', { ...newEvent, date: showAdd });
      setEvents(prev => [...prev, res.data.event]);
      setShowAdd(null);
      setNewEvent({ title: '', description: '', color: '#3b82f6' });
    } catch (err) {
      alert(err.response?.data?.error || 'Error creating event');
    }
  };

  const deleteEvent = async (id) => {
    if (!confirm('Delete this event?')) return;
    try {
      await api.delete(`/calendar/${id}`);
      setEvents(prev => prev.filter(e => e._id !== id));
      setShowDetail(null);
    } catch (err) {
      alert(err.response?.data?.error);
    }
  };

  const firstDay = new Date(currentYear, currentMonth, 1);
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const startPad = firstDay.getDay();
  const totalCells = Math.ceil((startPad + daysInMonth) / 7) * 7;

  const tasksByDate = {};
  tasks.forEach(t => {
    if (!t.dueDate) return;
    const d = new Date(t.dueDate);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    if (!tasksByDate[key]) tasksByDate[key] = [];
    tasksByDate[key].push(t);
  });

  const eventsByDate = {};
  events.forEach(e => {
    const d = new Date(e.date);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    if (!eventsByDate[key]) eventsByDate[key] = [];
    eventsByDate[key].push(e);
  });

  if (loading) return (
    <div className="space-y-4">
      <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse w-48" />
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 35 }).map((_, i) => <div key={i} className="h-28 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />)}
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Calendar</h1>
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <span className="text-lg font-semibold text-gray-800 dark:text-gray-100 w-48 text-center">{MONTHS[currentMonth]} {currentYear}</span>
          <button onClick={nextMonth} className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
          <button onClick={() => { setCurrentMonth(today.getMonth()); setCurrentYear(today.getFullYear()); }}
            className="px-3 py-1.5 text-xs font-medium text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition">Today</button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="grid grid-cols-7 border-b border-gray-50 dark:border-gray-800">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="px-3 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 text-center">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {Array.from({ length: totalCells }).map((_, i) => {
            const dayNum = i - startPad + 1;
            const isCurrentMonth = dayNum >= 1 && dayNum <= daysInMonth;
            const date = new Date(currentYear, currentMonth, dayNum);
            const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
            const dayTasks = isCurrentMonth ? (tasksByDate[key] || []) : [];
            const dayEvents = isCurrentMonth ? (eventsByDate[key] || []) : [];
            const isToday = isCurrentMonth && dayNum === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();

            return (
              <div key={i}
                onClick={() => isCurrentMonth && setShowAdd(date.toISOString())}
                className={`min-h-[120px] border-b border-r border-gray-50 dark:border-gray-800 p-2 transition cursor-pointer ${
                  isToday ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''
                } ${!isCurrentMonth ? 'bg-gray-50/50 dark:bg-gray-950/50' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}>
                <span className={`text-xs font-medium ${isToday ? 'text-primary-600 dark:text-primary-400' : isCurrentMonth ? 'text-gray-500 dark:text-gray-400' : 'text-gray-300 dark:text-gray-700'}`}>
                  {isCurrentMonth ? dayNum : ''}
                </span>
                <div className="mt-1 space-y-0.5">
                  {dayEvents.map(e => (
                    <div key={e._id} onClick={(ev) => { ev.stopPropagation(); setShowDetail(e); }}
                      className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded truncate text-white cursor-pointer hover:opacity-80 transition"
                      style={{ backgroundColor: e.color || '#3b82f6' }}>
                      <span className="truncate">{e.title}</span>
                    </div>
                  ))}
                  {dayTasks.slice(0, 2 - dayEvents.length).map(t => (
                    <a key={t._id} href={`/tasks/${t._id}`} onClick={(ev) => ev.stopPropagation()}
                      className="block text-[10px] px-1.5 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded truncate hover:bg-primary-200 dark:hover:bg-primary-900/50 transition">
                      {t.title}
                    </a>
                  ))}
                  {(dayTasks.length + dayEvents.length) > 3 && (
                    <span className="text-[10px] text-gray-400 px-1">+{dayTasks.length + dayEvents.length - 3} more</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Modal open={!!showAdd} onClose={() => setShowAdd(null)} title={`Add Event — ${showAdd ? new Date(showAdd).toLocaleDateString() : ''}`}>
        <form onSubmit={addEvent} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
            <input value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} required placeholder="Event title..."
              className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none transition" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea value={newEvent.description} onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })} rows={2}
              className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none transition resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Color</label>
            <div className="flex gap-2">
              {['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'].map(c => (
                <button key={c} type="button" onClick={() => setNewEvent({ ...newEvent, color: c })}
                  className={`w-8 h-8 rounded-xl transition-all ${newEvent.color === c ? 'ring-2 ring-offset-2 ring-gray-400 dark:ring-offset-gray-900 scale-110' : ''}`}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={() => setShowAdd(null)}
              className="px-5 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition">Cancel</button>
            <button type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white text-sm font-medium rounded-xl hover:from-primary-700 hover:to-primary-600 shadow-lg shadow-primary-200 dark:shadow-primary-900/30 transition-all active:scale-95">
              Add Event
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={!!showDetail} onClose={() => setShowDetail(null)} title={showDetail?.title || ''}>
        {showDetail && (
          <div className="space-y-4">
            {showDetail.description && <p className="text-sm text-gray-600 dark:text-gray-400">{showDetail.description}</p>}
            <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: showDetail.color }} />
              <span>{new Date(showDetail.date).toLocaleDateString()}</span>
              <span>·</span>
              <span>{showDetail.createdBy?.name}</span>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button onClick={() => deleteEvent(showDetail._id)}
                className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition">Delete</button>
              <button onClick={() => setShowDetail(null)}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition">Close</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
