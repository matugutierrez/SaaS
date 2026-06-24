const Comment = require('../models/Comment');
const Task = require('../models/Task');
const { createNotification } = require('../services/notificationService');

exports.list = async (req, res) => {
  try {
    const comments = await Comment.find({ task: req.params.taskId, organization: req.organization._id })
      .populate('author', 'name email')
      .sort({ createdAt: -1 });
    res.json({ comments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.taskId, organization: req.organization._id });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    const comment = await Comment.create({
      task: task._id,
      author: req.user._id,
      organization: req.organization._id,
      body: req.body.body,
    });
    const populated = await Comment.findById(comment._id).populate('author', 'name email');
    if (task.assignee && task.assignee.toString() !== req.user._id.toString()) {
      await createNotification({
        user: task.assignee,
        organization: req.organization._id,
        type: 'comment',
        message: `${req.user.name} commented on "${task.title}"`,
        link: `/tasks/${task._id}`,
      });
    }
    res.status(201).json({ comment: populated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const comment = await Comment.findOneAndDelete({
      _id: req.params.id,
      organization: req.organization._id,
    });
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
