const roles = {
  owner: ['read', 'create', 'update', 'delete', 'invite', 'manage_roles', 'transfer_ownership', 'delete_org', 'read_audit'],
  admin_plus: ['read', 'create', 'update', 'delete', 'invite', 'manage_roles', 'read_audit'],
  admin: ['read', 'create', 'update', 'delete'],
  member: ['read', 'chat'],
};

function rbac(...required) {
  return (req, res, next) => {
    const userRole = req.user.role;
    const permissions = roles[userRole] || [];
    const hasAll = required.every(p => permissions.includes(p));
    if (!hasAll) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

function rbacAny(...required) {
  return (req, res, next) => {
    const userRole = req.user.role;
    const permissions = roles[userRole] || [];
    const hasAny = required.some(p => permissions.includes(p));
    if (!hasAny) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

module.exports = { rbac, rbacAny };
