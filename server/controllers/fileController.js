const mongoose = require('mongoose');
const path = require('path');
const File = require('../models/File');
const Task = require('../models/Task');
const { getGridFSBucket } = require('../config/db');

exports.upload = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const taskId = req.body.task;
    if (taskId) {
      const task = await Task.findOne({ _id: taskId, organization: req.organization._id });
      if (!task) return res.status(404).json({ error: 'Task not found' });
    }
    const fileDoc = await File.create({
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      gridfsId: req.file.id,
      uploadedBy: req.user._id,
      organization: req.organization._id,
      task: taskId || undefined,
    });
    if (taskId) {
      await Task.findByIdAndUpdate(taskId, { $push: { attachments: fileDoc._id } });
    }
    res.status(201).json({ file: fileDoc });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.download = async (req, res) => {
  try {
    const fileDoc = await File.findOne({ _id: req.params.id, organization: req.organization._id });
    if (!fileDoc) return res.status(404).json({ error: 'File not found' });
    const bucket = getGridFSBucket();
    const downloadStream = bucket.openDownloadStream(fileDoc.gridfsId);
    res.set('Content-Type', fileDoc.mimetype);
    res.set('Content-Disposition', `inline; filename="${fileDoc.originalName}"`);
    downloadStream.pipe(res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const fileDoc = await File.findOneAndDelete({ _id: req.params.id, organization: req.organization._id });
    if (!fileDoc) return res.status(404).json({ error: 'File not found' });
    const bucket = getGridFSBucket();
    await bucket.delete(fileDoc.gridfsId);
    if (fileDoc.task) {
      await Task.findByIdAndUpdate(fileDoc.task, { $pull: { attachments: fileDoc._id } });
    }
    res.json({ message: 'File deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
