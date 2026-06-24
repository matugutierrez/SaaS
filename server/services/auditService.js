const AuditLog = require('../models/AuditLog');

async function createAuditLog({ organization, actor, action, entity, entityId, changes }) {
  try {
    await AuditLog.create({ organization, actor, action, entity, entityId, changes });
  } catch (err) {
    console.error('Audit service error:', err.message);
  }
}

module.exports = { createAuditLog };
