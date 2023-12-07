const router = require('express').Router();
const controller = require('./../controllers/users.controller');
const AuthMiddleware = require('../middlewares/auth.middleware');

router.get('/self', AuthMiddleware.mustBeAuthenticated, controller.findSelf);
router.get('/posts', AuthMiddleware.mustBeAuthenticated, controller.findAllPosts);
router.post('', controller.create);
router.post('/login', controller.login);
router.put('/update-post/:id', AuthMiddleware.mustBeAuthenticated, controller.updateMyPost);
router.put('/update/:id', AuthMiddleware.mustBeAuthenticated, controller.update);
router.get('/all', AuthMiddleware.mustBeAuthenticated, controller.findAll);
router.get('/:id', AuthMiddleware.mustBeAuthenticated,  controller.find);
router.delete('/:id', AuthMiddleware.mustBeAuthenticated, controller.delete);

module.exports = router;