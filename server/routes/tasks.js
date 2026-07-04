const router = require('express').Router();
const auth = require('../middleware/auth');
const { rbacAny } = require('../middleware/rbac');
const ctrl = require('../controllers/taskController');

router.use(auth);

router.delete('/orphans', rbacAny('delete'), ctrl.cleanupOrphans);
router.get('/dashboard', ctrl.dashboard);
router.get('/', ctrl.list);
router.get('/:id', ctrl.getOne);
router.post('/', rbacAny('create', 'update'), ctrl.create);
router.put('/:id', rbacAny('create', 'update'), ctrl.update);
router.put('/:id/position', rbacAny('create', 'update'), ctrl.updatePosition);
router.delete('/:id', rbacAny('delete'), ctrl.remove);

module.exports = router;
