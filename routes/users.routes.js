const router = require('express').Router();
const controller = require('./../controllers/user.controller');
const AuthMiddleware = require('../middlewares/auth.middleware');

router.get('/self', AuthMiddleware.mustBeAuthenticated, controller.findSelf);
router.post('/create', AuthMiddleware.mustBeAuthenticated, AuthMiddleware.isAdmin, controller.create);
router.put('/update/:id', AuthMiddleware.mustBeAuthenticated, AuthMiddleware.isAdmin, controller.update);
router.put('/password/:id', AuthMiddleware.mustBeAuthenticated, AuthMiddleware.isAdmin, controller.updatePassword);
router.get('/all', AuthMiddleware.mustBeAuthenticated, AuthMiddleware.isAdmin, controller.findAll);
router.get('/:id', AuthMiddleware.mustBeAuthenticated, AuthMiddleware.isAdmin, controller.find);
router.delete('/:id', AuthMiddleware.mustBeAuthenticated, controller.delete);

module.exports = router;