const Document = require('../models/Document');
const DocumentVersion = require('../models/DocumentVersion');
const { createAuditLog } = require('../services/auditService');

exports.list = async (req, res) => {
  try {
    const docs = await Document.find({
      project: req.params.projectId,
      organization: req.organization._id,
    })
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name')
      .sort({ updatedAt: -1 });
    res.json({ documents: docs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const doc = await Document.findOne({
      _id: req.params.id,
      organization: req.organization._id,
    })
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name');
    if (!doc) return res.status(404).json({ error: 'Document not found' });
    res.json({ document: doc });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { title, content } = req.body;
    const doc = await Document.create({
      title, content,
      project: req.params.projectId,
      organization: req.organization._id,
      createdBy: req.user._id,
      updatedBy: req.user._id,
    });
    await createAuditLog({
      organization: req.organization._id,
      actor: req.user._id,
      action: 'create',
      entity: 'Document',
      entityId: doc._id,
      changes: { title },
    });
    const populated = await Document.findById(doc._id)
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name');
    res.status(201).json({ document: populated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const doc = await Document.findOne({
      _id: req.params.id,
      organization: req.organization._id,
    });
    if (!doc) return res.status(404).json({ error: 'Document not found' });

    await DocumentVersion.create({
      document: doc._id,
      content: doc.content,
      title: doc.title,
      updatedBy: req.user._id,
      version: doc.version,
    });

    doc.title = req.body.title || doc.title;
    doc.content = req.body.content !== undefined ? req.body.content : doc.content;
    doc.version += 1;
    doc.updatedBy = req.user._id;
    doc.updatedAt = new Date();
    await doc.save();

    await createAuditLog({
      organization: req.organization._id,
      actor: req.user._id,
      action: 'update',
      entity: 'Document',
      entityId: doc._id,
      changes: { version: doc.version },
    });

    const populated = await Document.findById(doc._id)
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name');
    res.json({ document: populated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const doc = await Document.findOneAndDelete({
      _id: req.params.id,
      organization: req.organization._id,
    });
    if (!doc) return res.status(404).json({ error: 'Document not found' });
    await DocumentVersion.deleteMany({ document: doc._id });
    res.json({ message: 'Document deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.versions = async (req, res) => {
  try {
    const versions = await DocumentVersion.find({
      document: req.params.id,
    })
      .populate('updatedBy', 'name')
      .sort({ version: -1 });
    res.json({ versions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
