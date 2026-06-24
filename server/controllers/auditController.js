const AuditLog = require('../models/AuditLog');

exports.list = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const filter = { organization: req.organization._id };
    if (req.query.entity) filter.entity = req.query.entity;
    if (req.query.action) filter.action = req.query.action;
    const logs = await AuditLog.find(filter)
      .populate('actor', 'name email')
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    const total = await AuditLog.countDocuments(filter);
    res.json({ logs, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
