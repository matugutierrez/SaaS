const ChatRoom = require('../models/ChatRoom');
const ChatMessage = require('../models/ChatMessage');

exports.getRooms = async (req, res) => {
  try {
    const rooms = await ChatRoom.find({ organization: req.organization._id })
      .populate('project', 'name key');
    res.json({ rooms });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 50;
    const messages = await ChatMessage.find({
      room: req.params.roomId,
      organization: req.organization._id,
    })
      .populate('sender', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    const total = await ChatMessage.countDocuments({
      room: req.params.roomId,
      organization: req.organization._id,
    });
    res.json({ messages: messages.reverse(), total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const room = await ChatRoom.findOne({ _id: req.params.roomId, organization: req.organization._id });
    if (!room) return res.status(404).json({ error: 'Room not found' });
    const message = await ChatMessage.create({
      room: room._id,
      sender: req.user._id,
      organization: req.organization._id,
      content: req.body.content,
    });
    const populated = await ChatMessage.findById(message._id).populate('sender', 'name email');
    req.app.get('io').to(`room:${room._id}`).emit('chat:message', populated);
    res.status(201).json({ message: populated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
