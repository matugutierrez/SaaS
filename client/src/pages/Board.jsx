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
  const hoveredColRef = useRef(null);

  const highlightCol = (name) => {
    if (hoveredColRef.current === name) return;
    const toggle = (colName, add) => {
      if (!colName) return;
      const el = document.querySelector(`[data-column-name="${CSS.escape(colName)}"]`);
      if (!el) return;
      const fn = add ? 'add' : 'remove';
      el.classList[fn]('ring-2', 'ring-primary-400', 'ring-inset');
      el.querySelector('.board-droppable')?.classList[fn]('bg-muted/50');
    };
    toggle(hoveredColRef.current, false);
    toggle(name, true);
    hoveredColRef.current = name;
  };

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
      if (!isDragging.current) return;
      mousePos.current = { x: e.clientX, y: e.clientY };
      const colEls = document.querySelectorAll('[data-column-name]');
      for (const colEl of colEls) {
        const rect = colEl.getBoundingClientRect();
        if (e.clientX >= rect.left && e.clientX < rect.right) {
          highlightCol(colEl.getAttribute('data-column-name'));
          return;
        }
      }
      highlightCol(null);
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
    highlightCol(null);
    isDragging.current = false;
    const mouse = mousePos.current;
    mousePos.current = null;

    const { draggableId, source } = result;
    if (!draggableId) return;
    const task = tasks.find((t) => t._id === draggableId);
    if (!task || user?.role === 'member') return;

    let targetColName = null;
    let targetIndex = 0;
    if (mouse) {
      const colEls = document.querySelectorAll('[data-column-name]');
      for (const colEl of colEls) {
        const rect = colEl.getBoundingClientRect();
        if (mouse.x >= rect.left && mouse.x < rect.right) {
          targetColName = colEl.getAttribute('data-column-name');
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

  const moveTask = (taskId, targetColName) => {
    const task = tasks.find((t) => t._id === taskId);
    if (!task || user?.role === 'member' || task.columnName === targetColName) return;
    const targetTasks = tasks.filter((t) => t.columnName === targetColName && t._id !== taskId);
    const targetIndex = targetTasks.length;
    setTasks((prev) => prev.map((t) => {
      if (t._id === taskId) return { ...t, columnName: targetColName, position: targetIndex };
      return t;
    }));
    api.put(`/tasks/${taskId}/position`, { columnName: targetColName, position: targetIndex }).catch(() => {});
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
      {[1,2,3].map(i => <div key={i} className="w-72 bg-panel border border-border p-3 animate-pulse flex-shrink-0"><div className="h-8 bg-muted mb-3" />{[1,2,3].map(j => <div key={j} className="h-28 bg-muted mb-2" />)}</div>)}
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="font-serif font-normal text-text text-xl">{board?.name}</h1>
          {project && (
            <div className="flex items-center gap-3 mt-1">
              <Link to={`/projects/${projectId}/board`} className="text-text border-b border-text text-xs tracking-[0.15em] uppercase font-sans px-2.5 py-1">Board</Link>
              <Link to={`/projects/${projectId}/chat`} className="text-text-secondary text-xs tracking-[0.15em] uppercase font-sans px-2.5 py-1">Chat</Link>
              <Link to={`/projects/${projectId}/wiki`} className="text-text-secondary text-xs tracking-[0.15em] uppercase font-sans px-2.5 py-1">Wiki</Link>
            </div>
          )}
        </div>
        {canEdit && (
          <button onClick={() => setShowCreate(true)}
            className="px-4 py-2 bg-text text-page border border-border text-xs tracking-[0.15em] uppercase font-sans">
            + Add Task
          </button>
        )}
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks..."
            className="w-full pl-9 pr-3 py-2 bg-transparent border border-border text-text text-xs placeholder-text-secondary outline-none" />
        </div>
        <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}
          className="px-3 py-2 bg-transparent border border-border text-text text-xs outline-none">
          <option value="">All priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
        <span className="text-xs text-text-secondary">{filteredTasks.length} tasks</span>
      </div>

      <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <div ref={scrollRef} className="flex gap-4 flex-1 overflow-x-auto pb-4">
          {columns.map((col) => (
            <BoardColumn
              key={col.name}
              column={col}
              columns={columns}
              onMoveTask={moveTask}
              tasks={filteredTasks.filter((t) => t.columnName === col.name).sort((a, b) => a.position - b.position)}
            />
          ))}
        </div>
      </DragDropContext>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Task">
        <form onSubmit={createTask} className="space-y-4">
          <div>
            <label className="block text-xs tracking-[0.22em] uppercase text-text-secondary mb-1">Title</label>
            <input value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} required placeholder="What needs to be done?"
              className="w-full px-3.5 py-2.5 bg-transparent border border-border text-text text-xs outline-none" />
          </div>
          <div>
            <label className="block text-xs tracking-[0.22em] uppercase text-text-secondary mb-1">Description</label>
            <textarea value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} rows={3} placeholder="Add details..."
              className="w-full px-3.5 py-2.5 bg-transparent border border-border text-text text-xs outline-none resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs tracking-[0.22em] uppercase text-text-secondary mb-1">Column</label>
              <select value={newTask.columnName} onChange={(e) => setNewTask({ ...newTask, columnName: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-transparent border border-border text-text text-xs outline-none">
                {columns.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs tracking-[0.22em] uppercase text-text-secondary mb-1">Priority</label>
              <select value={newTask.priority} onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-transparent border border-border text-text text-xs outline-none">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={() => setShowCreate(false)}
              className="px-5 py-2.5 bg-transparent text-text-secondary border border-border text-xs tracking-[0.15em] uppercase font-sans">Cancel</button>
            <button type="submit"
              className="px-5 py-2.5 bg-text text-page border border-border text-xs tracking-[0.15em] uppercase font-sans">Create Task</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
