const CalendarEvent = require('../models/CalendarEvent');

exports.list = async (req, res) => {
  try {
    const { start, end } = req.query;
    const filter = { organization: req.organization._id };
    if (start && end) {
      filter.date = { $gte: new Date(start), $lte: new Date(end) };
    }
    const events = await CalendarEvent.find(filter).populate('createdBy', 'name').sort('date');
    res.json({ events });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { title, date, description, color } = req.body;
    const event = await CalendarEvent.create({
      title, date, description, color,
      createdBy: req.user._id,
      organization: req.organization._id,
    });
    const populated = await CalendarEvent.findById(event._id).populate('createdBy', 'name');
    res.status(201).json({ event: populated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { title, date, description, color } = req.body;
    const event = await CalendarEvent.findOneAndUpdate(
      { _id: req.params.id, organization: req.organization._id },
      { title, date, description, color },
      { new: true }
    ).populate('createdBy', 'name');
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json({ event });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const event = await CalendarEvent.findOneAndDelete({
      _id: req.params.id, organization: req.organization._id,
    });
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json({ message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
