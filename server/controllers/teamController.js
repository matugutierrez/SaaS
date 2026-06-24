const Team = require('../models/Team');

exports.list = async (req, res) => {
  try {
    const teams = await Team.find({ organization: req.organization._id })
      .populate('members', 'name email role');
    res.json({ teams });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { name } = req.body;
    const team = await Team.create({ name, organization: req.organization._id });
    const populated = await Team.findById(team._id).populate('members', 'name email role');
    res.status(201).json({ team: populated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { name, members } = req.body;
    const team = await Team.findOne({ _id: req.params.id, organization: req.organization._id });
    if (!team) return res.status(404).json({ error: 'Team not found' });
    if (name) team.name = name;
    if (members) team.members = members;
    await team.save();
    const populated = await Team.findById(team._id).populate('members', 'name email role');
    res.json({ team: populated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const team = await Team.findOneAndDelete({ _id: req.params.id, organization: req.organization._id });
    if (!team) return res.status(404).json({ error: 'Team not found' });
    res.json({ message: 'Team deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
