const mongoose = require('mongoose');

const columnSchema = new mongoose.Schema({
  name: { type: String, required: true },
  order: { type: Number, required: true },
  color: { type: String, default: '#6b7280' },
});

const boardSchema = new mongoose.Schema({
  name: { type: String, required: true, default: 'Kanban Board' },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  columns: [columnSchema],
  createdAt: { type: Date, default: Date.now },
});

boardSchema.index({ project: 1 });

module.exports = mongoose.model('Board', boardSchema);
