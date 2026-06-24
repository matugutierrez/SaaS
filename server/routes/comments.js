const router = require('express').Router({ mergeParams: true });
const auth = require('../middleware/auth');
const { rbacAny } = require('../middleware/rbac');
const ctrl = require('../controllers/commentController');

router.use(auth);

router.get('/', ctrl.list);
router.post('/', rbacAny('create', 'update'), ctrl.create);
router.delete('/:id', rbacAny('delete'), ctrl.remove);

module.exports = router;
