const router = require('express').Router();
const auth = require('../middleware/auth');
const { rbacAny } = require('../middleware/rbac');
const ctrl = require('../controllers/chatController');

router.use(auth);

router.get('/rooms', ctrl.getRooms);
router.get('/rooms/:roomId/messages', ctrl.getMessages);
router.post('/rooms/:roomId/messages', rbacAny('chat', 'create'), ctrl.sendMessage);
router.delete('/messages/:messageId', rbacAny('delete'), ctrl.deleteMessage);

module.exports = router;
