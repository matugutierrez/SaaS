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
      <div className="h-10 bg-panel border border-border animate-pulse w-48" />
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 35 }).map((_, i) => <div key={i} className="h-28 bg-panel border border-border animate-pulse" />)}
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif font-normal text-text text-2xl">Calendar</h1>
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="bg-transparent text-text-secondary border border-border p-2 hover:text-text">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <span className="font-serif text-text w-48 text-center">{MONTHS[currentMonth]} {currentYear}</span>
          <button onClick={nextMonth} className="bg-transparent text-text-secondary border border-border p-2 hover:text-text">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
          <button onClick={() => { setCurrentMonth(today.getMonth()); setCurrentYear(today.getFullYear()); }}
            className="bg-transparent text-text-secondary border border-border text-xs tracking-[0.15em] uppercase font-sans px-3 py-1.5 hover:text-text">Today</button>
        </div>
      </div>

      <div className="bg-panel border border-border">
        <div className="grid grid-cols-7 border-b border-border-light">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="px-3 py-2.5 text-xs tracking-[0.15em] uppercase text-text-secondary text-center">{d}</div>
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
                className={`min-h-[120px] border-b border-r border-border-light p-2 cursor-pointer ${
                  isToday ? 'bg-muted' : ''
                } ${!isCurrentMonth ? '' : ''}`}>
                <span className={`text-xs ${isToday ? 'text-text' : isCurrentMonth ? 'text-text-secondary' : 'text-text-secondary opacity-30'}`}>
                  {isCurrentMonth ? dayNum : ''}
                </span>
                <div className="mt-1 space-y-0.5">
                  {dayEvents.map(e => (
                    <div key={e._id} onClick={(ev) => { ev.stopPropagation(); setShowDetail(e); }}
                      className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 truncate text-text-secondary cursor-pointer border-l-2 hover:opacity-80"
                      style={{ borderLeftColor: e.color || '#7d9bb8' }}>
                      <span className="truncate">{e.title}</span>
                    </div>
                  ))}
                  {dayTasks.slice(0, 2 - dayEvents.length).map(t => (
                    <a key={t._id} href={`/tasks/${t._id}`} onClick={(ev) => ev.stopPropagation()}
                      className="block text-[10px] px-1.5 py-0.5 text-accent-blue truncate">
                      {t.title}
                    </a>
                  ))}
                  {(dayTasks.length + dayEvents.length) > 3 && (
                    <span className="text-text-secondary text-[10px] px-1">+{dayTasks.length + dayEvents.length - 3} more</span>
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
            <label className="block text-xs tracking-[0.15em] uppercase font-sans text-text-secondary mb-1">Title</label>
            <input value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} required placeholder="Event title..."
              className="w-full px-3.5 py-2.5 border border-border bg-panel text-text text-sm outline-none" />
          </div>
          <div>
            <label className="block text-xs tracking-[0.15em] uppercase font-sans text-text-secondary mb-1">Description</label>
            <textarea value={newEvent.description} onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })} rows={2}
              className="w-full px-3.5 py-2.5 border border-border bg-panel text-text text-sm outline-none resize-none" />
          </div>
          <div>
            <label className="block text-xs tracking-[0.15em] uppercase font-sans text-text-secondary mb-1">Color</label>
            <div className="flex gap-2">
              {['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'].map(c => (
                <button key={c} type="button" onClick={() => setNewEvent({ ...newEvent, color: c })}
                  className={`w-8 h-8 border border-border ${newEvent.color === c ? 'ring-1 ring-text' : ''}`}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={() => setShowAdd(null)}
              className="bg-transparent text-text-secondary border border-border text-xs tracking-[0.15em] uppercase font-sans px-5 py-2.5 hover:text-text">Cancel</button>
            <button type="submit"
              className="bg-text text-page border border-border text-xs tracking-[0.15em] uppercase font-sans px-5 py-2.5">
              Add Event
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={!!showDetail} onClose={() => setShowDetail(null)} title={showDetail?.title || ''}>
        {showDetail && (
          <div className="space-y-4">
            {showDetail.description && <p className="text-sm text-text-secondary">{showDetail.description}</p>}
            <div className="flex items-center gap-3 text-sm text-text-secondary">
              <span className="w-3 h-3 border border-border" style={{ backgroundColor: showDetail.color }} />
              <span>{new Date(showDetail.date).toLocaleDateString()}</span>
              <span>·</span>
              <span>{showDetail.createdBy?.name}</span>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button onClick={() => deleteEvent(showDetail._id)}
                className="text-accent-terracotta border border-border text-xs tracking-[0.15em] uppercase font-sans px-4 py-2 hover:opacity-80">Delete</button>
              <button onClick={() => setShowDetail(null)}
                className="bg-transparent text-text-secondary border border-border text-xs tracking-[0.15em] uppercase font-sans px-4 py-2 hover:text-text">Close</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
