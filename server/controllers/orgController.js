const Organization = require('../models/Organization');
const User = require('../models/User');

exports.getMembers = async (req, res) => {
  try {
    const members = await User.find({ organization: req.organization._id })
      .select('name email role createdAt')
      .sort('name');
    res.json({ members });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateMemberRole = async (req, res) => {
  try {
    const { userId, role } = req.body;
    const target = await User.findById(userId);
    if (!target || target.organization.toString() !== req.organization._id.toString()) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (target.role === 'owner') {
      return res.status(403).json({ error: 'Cannot change owner role' });
    }
    if (!['admin_plus', 'admin', 'member'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    target.role = role;
    await target.save();
    res.json({ user: target });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.removeMember = async (req, res) => {
  try {
    const { userId } = req.params;
    const target = await User.findById(userId);
    if (!target || target.organization.toString() !== req.organization._id.toString()) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (target.role === 'owner') {
      return res.status(403).json({ error: 'Cannot remove owner' });
    }
    await User.findByIdAndDelete(userId);
    res.json({ message: 'Member removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getInviteCode = async (req, res) => {
  try {
    const org = await Organization.findById(req.organization._id);
    res.json({ inviteCode: org.inviteCode });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.transferOwnership = async (req, res) => {
  try {
    const { userId } = req.body;
    if (req.user.role !== 'owner') {
      return res.status(403).json({ error: 'Only owner can transfer ownership' });
    }
    const target = await User.findById(userId);
    if (!target || target.organization.toString() !== req.organization._id.toString()) {
      return res.status(404).json({ error: 'User not found' });
    }
    req.user.role = 'admin_plus';
    await req.user.save();
    target.role = 'owner';
    await target.save();
    res.json({ message: 'Ownership transferred', newOwner: target });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
