const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUsers, updateUser, deleteUser } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.post('/register', protect, authorizeRoles('Admin'), registerUser);
router.post('/login', loginUser);
router.get('/users', protect, authorizeRoles('Admin'), getUsers);
router.put('/users/:id', protect, authorizeRoles('Admin'), updateUser);
router.delete('/users/:id', protect, authorizeRoles('Admin'), deleteUser);

module.exports = router;
