const Task = require('../models/Task');
const Project = require('../models/Project');
const { createAuditLog } = require('../services/auditService');
const { createNotification } = require('../services/notificationService');

exports.list = async (req, res) => {
  try {
    const filter = { organization: req.organization._id };
    if (req.query.project) filter.project = req.query.project;
    if (req.query.assignee) filter.assignee = req.query.assignee;
    if (req.query.columnName) filter.columnName = req.query.columnName;
    const tasks = await Task.find(filter)
      .populate('assignee', 'name email')
      .populate('reporter', 'name email')
      .sort({ updatedAt: -1 });
    res.json({ tasks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, organization: req.organization._id })
      .populate('assignee', 'name email')
      .populate('reporter', 'name email')
      .populate('attachments');
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json({ task });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    let { title, description, board, columnName, assignee, priority, dueDate, tags, project } = req.body;
    if (!assignee) assignee = undefined;
    if (!dueDate) dueDate = undefined;
    const lastTask = await Task.findOne({ board, columnName }).sort({ position: -1 });
    const position = lastTask ? lastTask.position + 1 : 0;
    const task = await Task.create({
      title, description, project, board, columnName, position,
      assignee, priority, dueDate, tags,
      reporter: req.user._id,
      organization: req.organization._id,
    });
    await createAuditLog({
      organization: req.organization._id,
      actor: req.user._id,
      action: 'create',
      entity: 'Task',
      entityId: task._id,
      changes: { title, description, columnName },
    });
    const populated = await Task.findById(task._id)
      .populate('assignee', 'name email')
      .populate('reporter', 'name email');
    if (assignee && assignee.toString() !== req.user._id.toString()) {
      await createNotification({
        user: assignee,
        organization: req.organization._id,
        type: 'task_assigned',
        message: `${req.user.name} assigned you to "${title}"`,
        link: `/tasks/${task._id}`,
      });
    }
    res.status(201).json({ task: populated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const body = { ...req.body };
    if (!body.assignee) body.assignee = null;
    if (!body.dueDate) body.dueDate = null;
    body.updatedAt = new Date();
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, organization: req.organization._id },
      body,
      { new: true }
    ).populate('assignee', 'name email').populate('reporter', 'name email');
    if (!task) return res.status(404).json({ error: 'Task not found' });
    await createAuditLog({
      organization: req.organization._id,
      actor: req.user._id,
      action: 'update',
      entity: 'Task',
      entityId: task._id,
      changes: req.body,
    });
    if (req.body.assignee && req.body.assignee !== req.user._id.toString()) {
      await createNotification({
        user: req.body.assignee,
        organization: req.organization._id,
        type: 'task_assigned',
        message: `${req.user.name} assigned you to "${task.title}"`,
        link: `/tasks/${task._id}`,
      });
    }
    res.json({ task });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updatePosition = async (req, res) => {
  try {
    const { columnName, position } = req.body;
    const task = await Task.findOne({ _id: req.params.id, organization: req.organization._id });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    const oldColumn = task.columnName;
    task.columnName = columnName || task.columnName;
    task.position = position !== undefined ? position : task.position;
    task.updatedAt = new Date();
    await task.save();
    await createAuditLog({
      organization: req.organization._id,
      actor: req.user._id,
      action: 'move',
      entity: 'Task',
      entityId: task._id,
      changes: { from: oldColumn, to: task.columnName },
    });
    const populated = await Task.findById(task._id)
      .populate('assignee', 'name email')
      .populate('reporter', 'name email');
    res.json({ task: populated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, organization: req.organization._id });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    await createAuditLog({
      organization: req.organization._id,
      actor: req.user._id,
      action: 'delete',
      entity: 'Task',
      entityId: task._id,
      changes: { title: task.title },
    });
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.dashboard = async (req, res) => {
  try {
    const orgId = req.organization._id;
    const now = new Date();
    const thirtyAgo = new Date(now - 30 * 86400000);
    const sixtyAgo = new Date(now - 60 * 86400000);

    const validProjects = await Project.find({ organization: orgId }).distinct('_id');
    const projectFilter = { organization: orgId, project: { $in: validProjects } };

    const total = await Task.countDocuments(projectFilter);
    const byColumn = await Task.aggregate([
      { $match: projectFilter },
      { $group: { _id: '$columnName', count: { $sum: 1 } } },
    ]);
    const overdue = await Task.countDocuments({
      ...projectFilter,
      dueDate: { $lt: now },
      columnName: { $ne: 'Done' },
    });
    const assignedToMe = await Task.countDocuments({
      ...projectFilter,
      assignee: req.user._id,
      columnName: { $ne: 'Done' },
    });
    const recent = await Task.find(projectFilter)
      .populate('assignee', 'name')
      .sort({ updatedAt: -1 })
      .limit(10);

    const totalThisPeriod = await Task.countDocuments({ ...projectFilter, createdAt: { $gte: thirtyAgo } });
    const totalPrevPeriod = await Task.countDocuments({ ...projectFilter, createdAt: { $gte: sixtyAgo, $lt: thirtyAgo } });

    const inProgressThisPeriod = await Task.countDocuments({ ...projectFilter, columnName: 'In Progress', createdAt: { $gte: thirtyAgo } });
    const inProgressPrevPeriod = await Task.countDocuments({ ...projectFilter, columnName: 'In Progress', createdAt: { $gte: sixtyAgo, $lt: thirtyAgo } });

    const completedThisPeriod = await Task.countDocuments({ ...projectFilter, columnName: 'Done', updatedAt: { $gte: thirtyAgo } });
    const completedPrevPeriod = await Task.countDocuments({ ...projectFilter, columnName: 'Done', updatedAt: { $gte: sixtyAgo, $lt: thirtyAgo } });

    const overdueThisPeriod = await Task.countDocuments({ ...projectFilter, dueDate: { $lt: now }, columnName: { $ne: 'Done' }, createdAt: { $gte: thirtyAgo } });
    const overduePrevPeriod = await Task.countDocuments({ ...projectFilter, dueDate: { $lt: now }, columnName: { $ne: 'Done' }, createdAt: { $gte: sixtyAgo, $lt: thirtyAgo } });

    res.json({
      total, byColumn, overdue, assignedToMe, recent,
      trend: {
        total: { current: totalThisPeriod, previous: totalPrevPeriod },
        inProgress: { current: inProgressThisPeriod, previous: inProgressPrevPeriod },
        completed: { current: completedThisPeriod, previous: completedPrevPeriod },
        overdue: { current: overdueThisPeriod, previous: overduePrevPeriod },
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.cleanupOrphans = async (req, res) => {
  try {
    const orgId = req.organization._id;
    const validProjects = await Project.find({ organization: orgId }).distinct('_id');
    const result = await Task.deleteMany({ organization: orgId, project: { $nin: validProjects } });
    res.json({ deleted: result.deletedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
