import { Draggable } from '@hello-pangea/dnd';

const priorityColors = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-blue-100 text-blue-600',
  high: 'bg-orange-100 text-orange-600',
  urgent: 'bg-red-100 text-red-600',
};

export default function TaskCard({ task, index }) {
  return (
    <Draggable draggableId={task._id} index={index}>
      {(provided) => (
        <a
          href={`/tasks/${task._id}`}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="block bg-white rounded-lg shadow-sm border border-gray-200 p-3 hover:shadow-md transition mb-2"
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <p className="text-sm font-medium text-gray-800 line-clamp-2">{task.title}</p>
            <span className={`text-xs px-1.5 py-0.5 rounded font-medium flex-shrink-0 ${priorityColors[task.priority] || priorityColors.medium}`}>
              {task.priority}
            </span>
          </div>
          {task.description && (
            <p className="text-xs text-gray-500 line-clamp-2 mb-2">{task.description}</p>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {task.assignee ? (
                <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-medium" title={task.assignee.name}>
                  {task.assignee.name[0].toUpperCase()}
                </div>
              ) : (
                <div className="w-6 h-6 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center text-xs">?</div>
              )}
              {task.dueDate && (
                <span className={`text-xs ${new Date(task.dueDate) < new Date() ? 'text-red-500' : 'text-gray-400'}`}>
                  {new Date(task.dueDate).toLocaleDateString()}
                </span>
              )}
            </div>
            {task.attachments?.length > 0 && (
              <span className="text-xs text-gray-400">📎 {task.attachments.length}</span>
            )}
          </div>
        </a>
      )}
    </Draggable>
  );
}
