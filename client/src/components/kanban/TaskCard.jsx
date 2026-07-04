import { useState, useEffect, useRef } from 'react';
import { Draggable } from '@hello-pangea/dnd';

const priorityMeta = {
  low: { color: 'text-text-secondary', label: 'Low' },
  medium: { color: 'text-accent-blue', label: 'Medium' },
  high: { color: 'text-accent-ocre', label: 'High' },
  urgent: { color: 'text-accent-terracotta', label: 'Urgent' },
};

export default function TaskCard({ task, index, columns, onMoveTask }) {
  const meta = priorityMeta[task.priority] || priorityMeta.medium;
  const [ctx, setCtx] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!ctx) return;
    const close = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setCtx(null);
    };
    const esc = (e) => { if (e.key === 'Escape') setCtx(null); };
    document.addEventListener('mousedown', close, { capture: true });
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', close, { capture: true });
      document.removeEventListener('keydown', esc);
    };
  }, [ctx]);

  return (
    <Draggable draggableId={task._id} index={index}>
      {(provided, snapshot) => (
          <>
        <a data-task-id={task._id}
          href={`/tasks/${task._id}`}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setCtx({ x: e.clientX, y: e.clientY });
          }}
          className={`block bg-panel border border-border p-3.5 mb-2 group ${
            snapshot.isDragging ? 'rotate-2 scale-105' : ''
          }`}
        >
          <div className="flex items-start justify-between gap-2 mb-2.5">
            <p className="text-xs text-text font-sans line-clamp-2 flex-1">{task.title}</p>
            <span className={`border border-border text-[10px] tracking-[0.1em] uppercase px-1.5 py-0.5 flex-shrink-0 ${meta.color}`}>{meta.label}</span>
          </div>
          {task.description && (
            <p className="text-xs text-text-secondary line-clamp-2 mb-3 leading-relaxed">{task.description}</p>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {task.assignee ? (
                <div className="w-6 h-6 bg-[#1a1f29] text-text-secondary flex items-center justify-center text-[10px] font-bold" title={task.assignee.name}>
                  {task.assignee.name[0]?.toUpperCase() || '?'}
                </div>
              ) : (
                <div className="w-6 h-6 bg-[#1a1f29] text-text-secondary flex items-center justify-center text-[10px] font-bold">?</div>
              )}
              {task.dueDate && (
                <span className={`text-[10px] ${new Date(task.dueDate) < new Date() ? 'text-accent-terracotta' : 'text-text-secondary'}`}>
                  {new Date(task.dueDate).toLocaleDateString()}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              {task.attachments?.length > 0 && (
                <span className="text-[10px] text-text-secondary">att {task.attachments.length}</span>
              )}
            </div>
          </div>
        </a>
        {ctx && (
          <div ref={menuRef} className="fixed z-[99999] bg-panel border border-border py-1.5 min-w-[160px]" style={{ left: ctx.x, top: ctx.y }}>
            <div className="px-3.5 py-1.5 text-xs text-text-secondary tracking-[0.15em] uppercase font-sans">Move to</div>
            {columns.map((col) => (
              <button key={col.name}
                onClick={(e) => { e.preventDefault(); onMoveTask?.(task._id, col.name); setCtx(null); }}
                disabled={col.name === task.columnName}
                className={`w-full text-left px-3.5 py-2 text-xs tracking-[0.15em] uppercase font-sans transition flex items-center gap-2.5 ${
                  col.name === task.columnName
                    ? 'text-text-secondary/30 cursor-not-allowed'
                    : 'text-text-secondary hover:text-text'
                }`}>
                <div className="w-2.5 h-2.5" style={{ backgroundColor: col.color }}></div>
                {col.name}
              </button>
            ))}
          </div>
        )}
      </>
      )}
    </Draggable>
  );
}
