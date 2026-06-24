const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
});

teamSchema.index({ organization: 1 });

module.exports = mongoose.model('Team', teamSchema);
