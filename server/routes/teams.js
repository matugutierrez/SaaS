const router = require('express').Router();
const auth = require('../middleware/auth');
const { rbacAny } = require('../middleware/rbac');
const ctrl = require('../controllers/teamController');

router.use(auth);

router.get('/', ctrl.list);
router.post('/', rbacAny('create', 'update'), ctrl.create);
router.put('/:id', rbacAny('create', 'update'), ctrl.update);
router.delete('/:id', rbacAny('delete'), ctrl.remove);

module.exports = router;
