const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  board: { type: mongoose.Schema.Types.ObjectId, ref: 'Board', required: true },
  columnName: { type: String, required: true },
  position: { type: Number, default: 0 },
  assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  dueDate: { type: Date },
  tags: [{ type: String, trim: true }],
  attachments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'File' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

taskSchema.index({ board: 1, columnName: 1, position: 1 });
taskSchema.index({ organization: 1 });
taskSchema.index({ assignee: 1 });
taskSchema.index({ project: 1 });

module.exports = mongoose.model('Task', taskSchema);
