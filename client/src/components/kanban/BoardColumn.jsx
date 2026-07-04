import { Droppable } from '@hello-pangea/dnd';
import TaskCard from './TaskCard';

export default function BoardColumn({ column, tasks, columns, onMoveTask }) {
  return (
    <div data-column-name={column.name} className="bg-panel border border-border flex-shrink-0 w-72 flex flex-col max-h-full">
      <div className="px-4 py-3.5 flex items-center gap-2.5 border-b border-border-light">
        <div className="w-2.5 h-2.5" style={{ backgroundColor: column.color }}></div>
        <h3 className="font-serif text-sm text-text">{column.name}</h3>
        <span className="text-text-secondary text-xs ml-auto">{tasks.length}</span>
      </div>
      <Droppable droppableId={column.name} type="task">
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="flex-1 px-2.5 py-2.5 overflow-y-auto min-h-[120px] board-droppable"
          >
            {tasks.length === 0 && !snapshot.isDraggingOver && (
              <div className="flex items-center justify-center h-24">
                <p className="text-xs text-text-secondary">Drop tasks here</p>
              </div>
            )}
            {tasks.map((task, i) => (
              <TaskCard key={task._id} task={task} index={i} columns={columns} onMoveTask={onMoveTask} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
