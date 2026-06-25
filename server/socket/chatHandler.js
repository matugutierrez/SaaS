const ChatMessage = require('../models/ChatMessage');

function chatHandler(io, socket) {
  socket.on('chat:join', (roomId) => {
    socket.join(`room:${roomId}`);
  });

  socket.on('chat:leave', (roomId) => {
    socket.leave(`room:${roomId}`);
  });

  socket.on('chat:send', async ({ roomId, content }) => {
    try {
      const message = await ChatMessage.create({
        room: roomId,
        sender: socket.user._id,
        organization: socket.orgId,
        content,
      });
      const populated = await ChatMessage.findById(message._id)
        .populate('sender', 'name email');
      io.to(`room:${roomId}`).emit('chat:message', populated);
    } catch (err) {
      socket.emit('error', { message: err.message });
    }
  });

  socket.on('chat:delete', async ({ messageId, roomId }) => {
    try {
      const message = await ChatMessage.findOne({ _id: messageId, organization: socket.orgId });
      if (!message) return;
      message.deleted = true;
      await message.save();
      io.to(`room:${roomId}`).emit('chat:messageDeleted', { messageId, roomId });
    } catch (err) {
      socket.emit('error', { message: err.message });
    }
  });
}

module.exports = chatHandler;
