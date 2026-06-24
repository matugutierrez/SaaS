function notificationHandler(io, socket) {
  socket.on('notifications:markRead', async (notificationId) => {
    try {
      const Notification = require('../models/Notification');
      await Notification.findByIdAndUpdate(notificationId, { read: true });
      io.to(`user:${socket.user._id}`).emit('notifications:updated');
    } catch (err) {
      socket.emit('error', { message: err.message });
    }
  });
}

module.exports = notificationHandler;
