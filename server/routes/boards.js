const router = require('express').Router();
const auth = require('../middleware/auth');
const { rbacAny } = require('../middleware/rbac');
const ctrl = require('../controllers/boardController');

router.use(auth);

router.get('/project/:projectId', ctrl.getByProject);
router.put('/:id/columns', rbacAny('create', 'update'), ctrl.updateColumns);

module.exports = router;
