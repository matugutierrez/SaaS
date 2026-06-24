const mongoose = require('mongoose');

const documentVersionSchema = new mongoose.Schema({
  document: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true },
  content: { type: String, required: true },
  title: { type: String, required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  version: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

documentVersionSchema.index({ document: 1, version: -1 });

module.exports = mongoose.model('DocumentVersion', documentVersionSchema);
