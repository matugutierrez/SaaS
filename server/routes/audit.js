const router = require('express').Router();
const auth = require('../middleware/auth');
const { rbac } = require('../middleware/rbac');
const ctrl = require('../controllers/auditController');

router.use(auth);
router.get('/', rbac('read_audit'), ctrl.list);

module.exports = router;
