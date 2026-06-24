import { useState, useEffect } from 'react';
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
  const [newTask, setNewTask] = useState({ title: '', description: '', assignee: '', priority: 'medium', columnName: '' });

  useEffect(() => {
    Promise.all([
      api.get(`/boards/project/${projectId}`),
      api.get(`/projects/${projectId}`),
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

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const { draggableId, source, destination } = result;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const task = tasks.find((t) => t._id === draggableId);
    if (!task || user?.role === 'member') return;

    const newColTasks = tasks.filter((t) => t.columnName === destination.droppableId && t._id !== draggableId);
    newColTasks.splice(destination.index, 0, task);

    const updated = tasks.map((t) => {
      if (t._id === draggableId) {
        return { ...t, columnName: destination.droppableId, position: destination.index };
      }
      if (t.columnName === destination.droppableId) {
        const idx = newColTasks.findIndex((nt) => nt._id === t._id);
        return { ...t, position: idx };
      }
      return t;
    });
    setTasks(updated);

    try {
      await api.put(`/tasks/${draggableId}/position`, {
        columnName: destination.droppableId,
        position: destination.index,
      });
    } catch (err) {
      console.error(err);
    }
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

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div></div>;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800">{board?.name}</h1>
          {project && (
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <Link to={`/projects/${projectId}/board`} className="hover:text-primary-600">Board</Link>
              <Link to={`/projects/${projectId}/chat`} className="hover:text-primary-600">Chat</Link>
              <Link to={`/projects/${projectId}/wiki`} className="hover:text-primary-600">Wiki</Link>
            </div>
          )}
        </div>
        {canEdit && (
          <button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 transition">
            + Add Task
          </button>
        )}
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 flex-1 overflow-x-auto pb-4">
          {columns.map((col) => (
            <BoardColumn
              key={col.name}
              column={col}
              tasks={tasks.filter((t) => t.columnName === col.name).sort((a, b) => a.position - b.position)}
            />
          ))}
        </div>
      </DragDropContext>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Task">
        <form onSubmit={createTask} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} required
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} rows={3}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Column</label>
              <select value={newTask.columnName} onChange={(e) => setNewTask({ ...newTask, columnName: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none">
                {columns.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select value={newTask.priority} onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700">Create</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
