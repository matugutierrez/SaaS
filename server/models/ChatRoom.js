const mongoose = require('mongoose');

const chatRoomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['project', 'general'], default: 'project' },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  createdAt: { type: Date, default: Date.now },
});

chatRoomSchema.index({ project: 1 });
chatRoomSchema.index({ organization: 1 });

module.exports = mongoose.model('ChatRoom', chatRoomSchema);
