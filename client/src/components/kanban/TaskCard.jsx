import { Draggable } from '@hello-pangea/dnd';

const priorityMeta = {
  low: { color: 'bg-gray-100 text-gray-600', label: 'Low' },
  medium: { color: 'bg-blue-100 text-blue-600', label: 'Medium' },
  high: { color: 'bg-orange-100 text-orange-600', label: 'High' },
  urgent: { color: 'bg-red-100 text-red-600', label: 'Urgent' },
};

export default function TaskCard({ task, index }) {
  const meta = priorityMeta[task.priority] || priorityMeta.medium;

  return (
    <Draggable draggableId={task._id} index={index}>
      {(provided, snapshot) => (
        <a
          href={`/tasks/${task._id}`}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`block bg-white rounded-xl border shadow-sm p-3.5 hover:shadow-md hover:border-gray-200 transition-all duration-150 mb-2 group ${
            snapshot.isDragging ? 'shadow-2xl rotate-2 scale-105 border-primary-200' : 'border-gray-100'
          }`}
        >
          <div className="flex items-start justify-between gap-2 mb-2.5">
            <p className="text-sm font-medium text-gray-800 line-clamp-2 group-hover:text-primary-600 transition flex-1">{task.title}</p>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold flex-shrink-0 ${meta.color}`}>{meta.label}</span>
          </div>
          {task.description && (
            <p className="text-xs text-gray-400 line-clamp-2 mb-3 leading-relaxed">{task.description}</p>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {task.assignee ? (
                <div className="w-6 h-6 bg-gradient-to-br from-primary-400 to-primary-600 text-white rounded-lg flex items-center justify-center text-[10px] font-bold shadow-sm" title={task.assignee.name}>
                  {task.assignee.name[0]?.toUpperCase() || '?'}
                </div>
              ) : (
                <div className="w-6 h-6 bg-gray-100 text-gray-400 rounded-lg flex items-center justify-center text-xs">?</div>
              )}
              {task.dueDate && (
                <span className={`text-[10px] font-medium ${new Date(task.dueDate) < new Date() ? 'text-red-500' : 'text-gray-400'}`}>
                  {new Date(task.dueDate).toLocaleDateString()}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              {task.attachments?.length > 0 && (
                <span className="text-[10px] text-gray-400">📎 {task.attachments.length}</span>
              )}
            </div>
          </div>
        </a>
      )}
    </Draggable>
  );
}
