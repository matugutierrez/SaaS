const router = require('express').Router();
const auth = require('../middleware/auth');
const { rbacAny } = require('../middleware/rbac');
const ctrl = require('../controllers/fileController');
const { uploadMiddleware } = require('../middleware/upload');

router.use(auth);

router.post('/upload', rbacAny('create', 'update'), uploadMiddleware, ctrl.upload);
router.get('/:id', ctrl.download);
router.delete('/:id', rbacAny('delete'), ctrl.delete);

module.exports = router;
