const router = require('express').Router();
const controller = require('./../controllers/users.controller');
const AuthMiddleware = require('../middlewares/auth.middleware');

router.put('/:id', AuthMiddleware.mustBeAuthenticated, controller.updatePassword);
router.post('/request-reset', controller.requestResetPassword);
router.post('/reset-password', controller.resetPassword);

module.exports = router;