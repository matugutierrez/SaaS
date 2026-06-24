import { useState, useEffect, useMemo } from 'react';
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

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (priorityFilter && t.priority !== priorityFilter) return false;
      return true;
    });
  }, [tasks, search, priorityFilter]);

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const { draggableId, source, destination } = result;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const task = tasks.find((t) => t._id === draggableId);
    if (!task || user?.role === 'member') return;

    const newColTasks = tasks.filter((t) => t.columnName === destination.droppableId && t._id !== draggableId);
    newColTasks.splice(destination.index, 0, task);

    setTasks(prev => prev.map(t => {
      if (t._id === draggableId) return { ...t, columnName: destination.droppableId, position: destination.index };
      if (t.columnName === destination.droppableId) {
        const idx = newColTasks.findIndex((nt) => nt._id === t._id);
        return { ...t, position: idx };
      }
      return t;
    }));

    try {
      await api.put(`/tasks/${draggableId}/position`, { columnName: destination.droppableId, position: destination.index });
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
      {[1,2,3].map(i => <div key={i} className="w-72 bg-gray-100 rounded-2xl p-3 animate-pulse flex-shrink-0"><div className="h-8 bg-gray-200 rounded mb-3" />{[1,2,3].map(j => <div key={j} className="h-28 bg-gray-200 rounded-xl mb-2" />)}</div>)}
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800">{board?.name}</h1>
          {project && (
            <div className="flex items-center gap-3 mt-1">
              <Link to={`/projects/${projectId}/board`} className="text-xs text-primary-600 font-medium bg-primary-50 px-2.5 py-1 rounded-lg">Board</Link>
              <Link to={`/projects/${projectId}/chat`} className="text-xs text-gray-500 hover:text-gray-700 px-2.5 py-1 rounded-lg hover:bg-gray-100 transition">Chat</Link>
              <Link to={`/projects/${projectId}/wiki`} className="text-xs text-gray-500 hover:text-gray-700 px-2.5 py-1 rounded-lg hover:bg-gray-100 transition">Wiki</Link>
            </div>
          )}
        </div>
        {canEdit && (
          <button onClick={() => setShowCreate(true)}
            className="px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl text-sm font-medium hover:from-primary-700 hover:to-primary-600 shadow-lg shadow-primary-200 transition-all active:scale-95">
            + Add Task
          </button>
        )}
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks..."
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition" />
        </div>
        <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none transition">
          <option value="">All priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
        <span className="text-xs text-gray-400">{filteredTasks.length} tasks</span>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 flex-1 overflow-x-auto pb-4">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} required placeholder="What needs to be done?"
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none transition" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} rows={3} placeholder="Add details..."
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none transition resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Column</label>
              <select value={newTask.columnName} onChange={(e) => setNewTask({ ...newTask, columnName: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none transition">
                {columns.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select value={newTask.priority} onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none transition">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={() => setShowCreate(false)}
              className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition">Cancel</button>
            <button type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white text-sm font-medium rounded-xl hover:from-primary-700 hover:to-primary-600 shadow-lg shadow-primary-200 transition-all active:scale-95">
              Create Task
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
