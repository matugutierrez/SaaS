const Task = require('../models/Task');

function boardHandler(io, socket) {
  socket.on('board:join', (boardId) => {
    socket.join(`board:${boardId}`);
  });

  socket.on('board:leave', (boardId) => {
    socket.leave(`board:${boardId}`);
  });

  socket.on('board:moveTask', async ({ taskId, columnName, position }) => {
    try {
      const task = await Task.findById(taskId);
      if (!task) return;
      task.columnName = columnName;
      task.position = position;
      task.updatedAt = new Date();
      await task.save();
      const populated = await Task.findById(taskId)
        .populate('assignee', 'name email')
        .populate('reporter', 'name email');
      io.to(`board:${task.board}`).emit('board:taskMoved', populated);
    } catch (err) {
      socket.emit('error', { message: err.message });
    }
  });
}

module.exports = boardHandler;
