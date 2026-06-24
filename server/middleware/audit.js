const AuditLog = require('../models/AuditLog');

async function auditLog(action, entity) {
  return async (req, res, next) => {
    const originalJson = res.json.bind(res);
    res.json = async function (body) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const entityId = req.params.id || body?._id || body?.id;
        try {
          await AuditLog.create({
            organization: req.organization._id,
            actor: req.user._id,
            action,
            entity,
            entityId,
            changes: req.body || {},
          });
        } catch (err) {
          console.error('Audit log error:', err.message);
        }
      }
      return originalJson(body);
    };
    next();
  };
}

module.exports = auditLog;
