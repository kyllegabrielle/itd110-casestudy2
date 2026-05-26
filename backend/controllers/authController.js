const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { createUser, findUserByUsername } = require('../utils/userQueries');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/v1/auth/register
// @access  Public (Should be Admin only in production, but open for initial setup)
const registerUser = async (req, res) => {
  try {
    const { username, password, role, name, email } = req.body;

    if (!username || !password || !role || !name) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const userExists = await findUserByUsername(username);

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const user = await createUser({
      username,
      passwordHash,
      role,
      name,
      email
    });

    if (user) {
      res.status(201).json({
        id: user.id,
        username: user.username,
        role: user.role,
        name: user.name,
        token: generateToken(user.id, user.role),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// @desc    Authenticate a user
// @route   POST /api/v1/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await findUserByUsername(username);

    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      res.json({
        id: user.id,
        username: user.username,
        role: user.role,
        name: user.name,
        token: generateToken(user.id, user.role),
      });
    } else {
      res.status(401).json({ message: 'Invalid username or password' });
    }
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

module.exports = {
  registerUser,
  loginUser,
};
