const router = require('express').Router();
const controller = require('./../controllers/posts.controller');
const AuthMiddleware = require('../middlewares/auth.middleware');

router.post('', AuthMiddleware.mustBeAuthenticated, controller.create);
router.put('/:id', AuthMiddleware.mustBeAuthenticated, controller.update);
router.get('', AuthMiddleware.mustBeAuthenticated, controller.findAll);
router.get('/:id', AuthMiddleware.mustBeAuthenticated,  controller.find);
router.delete('/:id', AuthMiddleware.mustBeAuthenticated, controller.delete);

module.exports = router;