import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DragDropContext } from '@hello-pangea/dnd';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../services/api';
import BoardColumn from '../components/kanban/BoardColumn';
import Modal from '../components/common/Modal';

export default function Board() {
  const { projectId } = useParams();
  const { user } = useAuth();
  const socket = useSocket();
  const [board, setBoard] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [columns, setColumns] = useState([]);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [showQuickView, setShowQuickView] = useState(null);
  const [newTask, setNewTask] = useState({ title: '', description: '', assignee: '', priority: 'medium', columnName: '' });

  const scrollRef = useRef(null);
  const isDragging = useRef(false);
  const mousePos = useRef(null);
  const rafId = useRef(null);

  useEffect(() => {
    Promise.all([
      api.get(`/boards/project/${projectId}`),
      api.get(`/projects/${projectId}`),
      new Promise(r => setTimeout(r, 300)),
    ]).then(([boardRes, projRes]) => {
      setBoard(boardRes.data.board);
      setTasks(boardRes.data.tasks);
      setColumns(boardRes.data.board.columns.sort((a, b) => a.order - b.order));
      setProject(projRes.data.project);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [projectId]);

  useEffect(() => {
    if (!socket || !board) return;
    socket.emit('board:join', board._id);
    const handler = (task) => {
      setTasks((prev) => {
        const exists = prev.find((t) => t._id === task._id);
        if (exists) return prev.map((t) => (t._id === task._id ? task : t));
        return [...prev, task];
      });
    };
    socket.on('board:taskMoved', handler);
    return () => {
      socket.emit('board:leave', board._id);
      socket.off('board:taskMoved', handler);
    };
  }, [socket, board]);

  useEffect(() => {
    const handler = (e) => {
      if (isDragging.current) mousePos.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (priorityFilter && t.priority !== priorityFilter) return false;
      return true;
    });
  }, [tasks, search, priorityFilter]);

  const doScroll = () => {
    if (mousePos.current === null) return;
    const container = scrollRef.current;
    if (!container) return;
    const threshold = 90;
    const speed = 5;
    const x = mousePos.current.x;
    if (x > window.innerWidth - threshold) {
      container.scrollLeft += speed;
      container.dispatchEvent(new Event('scroll'));
    } else if (x < threshold + 260) {
      container.scrollLeft -= speed;
      container.dispatchEvent(new Event('scroll'));
    }
  };

  const scrollLoop = () => {
    if (!isDragging.current) return;
    doScroll();
    rafId.current = requestAnimationFrame(scrollLoop);
  };

  const onDragStart = () => {
    isDragging.current = true;
    rafId.current = requestAnimationFrame(scrollLoop);
  };

  const onDragEnd = async (result) => {
    cancelAnimationFrame(rafId.current);
    isDragging.current = false;
    const mouse = mousePos.current;
    mousePos.current = null;

    const { draggableId, source } = result;
    if (!draggableId) return;
    const task = tasks.find((t) => t._id === draggableId);
    if (!task || user?.role === 'member') return;

    // ── Find target column from DOM coordinates ──
    let targetColName = null;
    let targetIndex = 0;
    if (mouse) {
      const colEls = document.querySelectorAll('[data-column-name]');
      for (const colEl of colEls) {
        const rect = colEl.getBoundingClientRect();
        if (mouse.x >= rect.left && mouse.x < rect.right) {
          targetColName = colEl.getAttribute('data-column-name');
          // find insertion index within column by comparing mouse.y to task cards
          const cards = colEl.querySelectorAll('[data-task-id]');
          let idx = cards.length;
          cards.forEach((card, i) => {
            const cr = card.getBoundingClientRect();
            if (mouse.y < cr.top + cr.height / 2 && i < idx) idx = i;
          });
          targetIndex = idx;
          break;
        }
      }
    }

    // fallback to library destination if manual calc failed
    if (!targetColName) {
      if (!result.destination) return;
      targetColName = result.destination.droppableId;
      targetIndex = result.destination.index;
    }

    if (source.droppableId === targetColName && source.index === targetIndex) return;

    const newColTasks = tasks.filter((t) => t.columnName === targetColName && t._id !== draggableId);
    newColTasks.splice(targetIndex, 0, task);

    setTasks(prev => prev.map(t => {
      if (t._id === draggableId) return { ...t, columnName: targetColName, position: targetIndex };
      if (t.columnName === targetColName) {
        const idx = newColTasks.findIndex((nt) => nt._id === t._id);
        return { ...t, position: idx };
      }
      return t;
    }));

    try {
      await api.put(`/tasks/${draggableId}/position`, { columnName: targetColName, position: targetIndex });
    } catch (err) {}
  };

  const createTask = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/tasks', {
        ...newTask,
        board: board._id,
        project: projectId,
        columnName: newTask.columnName || columns[0]?.name,
      });
      setTasks((prev) => [...prev, res.data.task]);
      setShowCreate(false);
      setNewTask({ title: '', description: '', assignee: '', priority: 'medium', columnName: '' });
    } catch (err) {
      alert(err.response?.data?.error || 'Error creating task');
    }
  };

  const canEdit = user?.role !== 'member';

  if (loading) return (
    <div className="flex gap-4 h-full overflow-x-auto pb-4">
      {[1,2,3].map(i => <div key={i} className="w-72 bg-gray-100 dark:bg-gray-900 rounded-2xl p-3 animate-pulse flex-shrink-0"><div className="h-8 bg-gray-200 dark:bg-gray-800 rounded mb-3" />{[1,2,3].map(j => <div key={j} className="h-28 bg-gray-200 dark:bg-gray-800 rounded-xl mb-2" />)}</div>)}
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">{board?.name}</h1>
          {project && (
            <div className="flex items-center gap-3 mt-1">
              <Link to={`/projects/${projectId}/board`} className="text-xs text-primary-600 font-medium bg-primary-50 dark:bg-primary-900/30 dark:text-primary-400 px-2.5 py-1 rounded-lg">Board</Link>
              <Link to={`/projects/${projectId}/chat`} className="text-xs text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 px-2.5 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">Chat</Link>
              <Link to={`/projects/${projectId}/wiki`} className="text-xs text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 px-2.5 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">Wiki</Link>
            </div>
          )}
        </div>
        {canEdit && (
          <button onClick={() => setShowCreate(true)}
            className="px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl text-sm font-medium hover:from-primary-700 hover:to-primary-600 shadow-lg shadow-primary-200 dark:shadow-primary-900/30 transition-all active:scale-95">
            + Add Task
          </button>
        )}
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks..."
            className="w-full pl-9 pr-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition" />
        </div>
        <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}
          className="px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none transition">
          <option value="">All priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
        <span className="text-xs text-gray-400 dark:text-gray-500">{filteredTasks.length} tasks</span>
      </div>

      <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <div ref={scrollRef} className="flex gap-4 flex-1 overflow-x-auto pb-4">
          {columns.map((col) => (
            <BoardColumn
              key={col.name}
              column={col}
              tasks={filteredTasks.filter((t) => t.columnName === col.name).sort((a, b) => a.position - b.position)}
            />
          ))}
        </div>
      </DragDropContext>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Task">
        <form onSubmit={createTask} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
            <input value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} required placeholder="What needs to be done?"
              className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none transition" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} rows={3} placeholder="Add details..."
              className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none transition resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Column</label>
              <select value={newTask.columnName} onChange={(e) => setNewTask({ ...newTask, columnName: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none transition">
                {columns.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
              <select value={newTask.priority} onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none transition">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={() => setShowCreate(false)}
              className="px-5 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition">Cancel</button>
            <button type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white text-sm font-medium rounded-xl hover:from-primary-700 hover:to-primary-600 shadow-lg shadow-primary-200 dark:shadow-primary-900/30 transition-all active:scale-95">
              Create Task
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
