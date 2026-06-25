const Board = require('../models/Board');
const Task = require('../models/Task');

const DEFAULT_COLUMNS = [
  { name: 'Backlog', order: 0, color: '#9ca3af' },
  { name: 'To Do', order: 1, color: '#6b7280' },
  { name: 'In Progress', order: 2, color: '#3b82f6' },
  { name: 'Review', order: 3, color: '#f59e0b' },
  { name: 'Testing', order: 4, color: '#8b5cf6' },
  { name: 'Done', order: 5, color: '#22c55e' },
  { name: 'Archived', order: 6, color: '#6b7280' },
];

exports.getByProject = async (req, res) => {
  try {
    const board = await Board.findOne({ project: req.params.projectId, organization: req.organization._id });
    if (!board) return res.status(404).json({ error: 'Board not found' });

    if (board.columns.length < DEFAULT_COLUMNS.length) {
      const existingNames = board.columns.map(c => c.name);
      const merged = [...board.columns];
      DEFAULT_COLUMNS.forEach(dc => {
        if (!existingNames.includes(dc.name)) {
          merged.push(dc);
        }
      });
      merged.sort((a, b) => a.order - b.order);
      merged.forEach((c, i) => c.order = i);
      board.columns = merged;
      await board.save();
    }

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
