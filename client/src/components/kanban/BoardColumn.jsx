import { Droppable } from '@hello-pangea/dnd';
import TaskCard from './TaskCard';

export default function BoardColumn({ column, tasks, index }) {
  return (
    <div className="bg-gray-100 rounded-xl flex-shrink-0 w-72 flex flex-col max-h-full">
      <div className="px-3 py-3 flex items-center gap-2">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: column.color }}></div>
        <h3 className="font-semibold text-sm text-gray-700">{column.name}</h3>
        <span className="text-xs text-gray-400 ml-auto">{tasks.length}</span>
      </div>
      <Droppable droppableId={column.name} type="task">
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 px-2 pb-2 overflow-y-auto min-h-[100px] transition ${
              snapshot.isDraggingOver ? 'bg-primary-50' : ''
            }`}
          >
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
