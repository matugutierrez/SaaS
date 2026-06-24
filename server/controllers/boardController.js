const Board = require('../models/Board');
const Task = require('../models/Task');

exports.getByProject = async (req, res) => {
  try {
    const board = await Board.findOne({ project: req.params.projectId, organization: req.organization._id });
    if (!board) return res.status(404).json({ error: 'Board not found' });
    const tasks = await Task.find({ board: board._id, organization: req.organization._id })
      .populate('assignee', 'name email')
      .populate('reporter', 'name email')
      .sort('position');
    res.json({ board, tasks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateColumns = async (req, res) => {
  try {
    const { columns } = req.body;
    const board = await Board.findOneAndUpdate(
      { _id: req.params.id, organization: req.organization._id },
      { columns },
      { new: true }
    );
    if (!board) return res.status(404).json({ error: 'Board not found' });
    res.json({ board });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
