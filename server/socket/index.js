const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = require('../config/env');
const chatHandler = require('./chatHandler');
const boardHandler = require('./boardHandler');
const notificationHandler = require('./notificationHandler');

function setupSocket(io) {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('No token'));
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.userId).populate('organization');
      if (!user) return next(new Error('User not found'));
      socket.user = user;
      socket.orgId = user.organization._id.toString();
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    socket.join(`org:${socket.orgId}`);
    socket.join(`user:${socket.user._id}`);

    chatHandler(io, socket);
    boardHandler(io, socket);
    notificationHandler(io, socket);

    socket.on('disconnect', () => {});
  });
}

module.exports = setupSocket;
