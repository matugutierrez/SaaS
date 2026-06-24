const router = require('express').Router();
const auth = require('../middleware/auth');
const { rbac } = require('../middleware/rbac');
const ctrl = require('../controllers/orgController');

router.use(auth);

router.get('/members', ctrl.getMembers);
router.get('/invite-code', ctrl.getInviteCode);
router.put('/members/role', rbac('manage_roles'), ctrl.updateMemberRole);
router.delete('/members/:userId', rbac('manage_roles'), ctrl.removeMember);
router.post('/transfer-ownership', rbac('transfer_ownership'), ctrl.transferOwnership);

module.exports = router;
