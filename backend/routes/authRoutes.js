const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUsers } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.post('/register', protect, authorizeRoles('Admin'), registerUser);
router.post('/login', loginUser);
router.get('/users', protect, authorizeRoles('Admin'), getUsers);

module.exports = router;
