const express = require('express');
const UserController = require('../controllers/user.controller');
const UserService = require('../services/user.service');
const UserRepository = require('../repositories/user.repository');
const { validatePublicId } = require('../middleware/validation.middleware');

const router = express.Router();

const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);

router.get('/', userController.getAllUsers);
router.get('/search', userController.searchUser);
router.get('/:publicId', validatePublicId, userController.getUserById);
router.post('/', userController.createUser);
router.put('/:publicId', validatePublicId, userController.updateUser);
router.delete('/:publicId', validatePublicId, userController.deleteUser);

module.exports = router;
