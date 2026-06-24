const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  key: { type: String, required: true, uppercase: true, trim: true },
  description: { type: String, default: '' },
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  lead: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
  createdAt: { type: Date, default: Date.now },
});

projectSchema.index({ organization: 1 });
projectSchema.index({ key: 1, organization: 1 }, { unique: true });

module.exports = mongoose.model('Project', projectSchema);
