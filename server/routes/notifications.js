const router = require('express').Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/notificationController');

router.use(auth);

router.get('/', ctrl.list);
router.put('/read', ctrl.markRead);
router.put('/read-all', ctrl.markAllRead);

module.exports = router;
