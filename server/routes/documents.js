const router = require('express').Router();
const auth = require('../middleware/auth');
const { rbacAny } = require('../middleware/rbac');
const ctrl = require('../controllers/documentController');

router.use(auth);

router.get('/project/:projectId', ctrl.list);
router.get('/:id', ctrl.getOne);
router.get('/:id/versions', ctrl.versions);
router.post('/project/:projectId', rbacAny('create', 'update'), ctrl.create);
router.put('/:id', rbacAny('create', 'update'), ctrl.update);
router.delete('/:id', rbacAny('delete'), ctrl.remove);

module.exports = router;
