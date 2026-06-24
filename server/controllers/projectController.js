const Project = require('../models/Project');
const Board = require('../models/Board');
const ChatRoom = require('../models/ChatRoom');

exports.list = async (req, res) => {
  try {
    const projects = await Project.find({ organization: req.organization._id })
      .populate('lead', 'name email')
      .populate('team', 'name')
      .sort('name');
    res.json({ projects });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, organization: req.organization._id })
      .populate('lead', 'name email')
      .populate('team', 'name');
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json({ project });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, key, description, lead, team } = req.body;
    const project = await Project.create({
      name, key, description, lead, team,
      organization: req.organization._id,
    });

    await Board.create({
      name: `${name} Board`,
      project: project._id,
      organization: req.organization._id,
      columns: [
        { name: 'To Do', order: 0, color: '#6b7280' },
        { name: 'In Progress', order: 1, color: '#3b82f6' },
        { name: 'Done', order: 2, color: '#22c55e' },
      ],
    });

    await ChatRoom.create({
      name: `#${key.toLowerCase()}`,
      type: 'project',
      project: project._id,
      organization: req.organization._id,
    });

    const populated = await Project.findById(project._id)
      .populate('lead', 'name email')
      .populate('team', 'name');
    res.status(201).json({ project: populated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { name, description, lead, team } = req.body;
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, organization: req.organization._id },
      { name, description, lead, team },
      { new: true }
    ).populate('lead', 'name email').populate('team', 'name');
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json({ project });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({ _id: req.params.id, organization: req.organization._id });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    await Board.deleteMany({ project: project._id });
    await ChatRoom.deleteMany({ project: project._id });
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
