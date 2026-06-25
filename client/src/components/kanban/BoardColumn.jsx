import { Droppable } from '@hello-pangea/dnd';
import TaskCard from './TaskCard';

export default function BoardColumn({ column, tasks, hoveredCol }) {
  return (
    <div data-column-name={column.name} className="bg-gray-100/80 dark:bg-gray-900 rounded-2xl flex-shrink-0 w-72 flex flex-col max-h-full shadow-sm dark:shadow-gray-900/50 border border-gray-200/50 dark:border-gray-800 transition-colors duration-200">
      <div className="px-4 py-3.5 flex items-center gap-2.5 border-b border-gray-200/50 dark:border-gray-800">
        <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: column.color }}></div>
        <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300">{column.name}</h3>
        <span className="text-xs text-gray-400 ml-auto bg-white/80 dark:bg-gray-800 px-2 py-0.5 rounded-full font-medium shadow-sm">{tasks.length}</span>
      </div>
      <Droppable droppableId={column.name} type="task">
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 px-2.5 py-2.5 overflow-y-auto min-h-[120px] transition-all duration-200 rounded-b-2xl ${
              snapshot.isDraggingOver || hoveredCol === column.name ? 'bg-primary-50/50 dark:bg-primary-900/30' : ''
            }`}
          >
            {tasks.length === 0 && !snapshot.isDraggingOver && (
              <div className="flex items-center justify-center h-24">
                <p className="text-xs text-gray-400 dark:text-gray-600">Drop tasks here</p>
              </div>
            )}
            {tasks.map((task, i) => (
              <TaskCard key={task._id} task={task} index={i} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
