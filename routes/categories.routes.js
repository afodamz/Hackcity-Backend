const router = require('express').Router();
const controller = require('./../controllers/categories.controller');
const AuthMiddleware = require('../middlewares/auth.middleware');

router.post('/create', AuthMiddleware.mustBeAuthenticated, controller.create);
router.put('/update/:id', AuthMiddleware.mustBeAuthenticated, controller.update);
router.get('/all', AuthMiddleware.mustBeAuthenticated, controller.findAll);
router.get('/:id', AuthMiddleware.mustBeAuthenticated,  controller.find);
router.delete('/:id', AuthMiddleware.mustBeAuthenticated, controller.delete);

module.exports = router;