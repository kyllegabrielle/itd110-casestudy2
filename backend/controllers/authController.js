const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { createUser, findUserByUsername, findUserById, getAllUsers, updateUser, deleteUser } = require('../utils/userQueries');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/v1/auth/register
// @access  Admin only (protected in routes)
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

// @desc    Get all users
// @route   GET /api/v1/auth/users
// @access  Admin only
const getUsers = async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Get Users Error:', error);
    res.status(500).json({ message: 'Server error while fetching users' });
  }
};

// @desc    Update a user
// @route   PUT /api/v1/auth/users/:id
// @access  Admin only
const updateUserController = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password, role, name, email } = req.body;

    const user = await findUserById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if username is being changed and if new username exists
    if (username && username !== user.username) {
      const userExists = await findUserByUsername(username);
      if (userExists) {
        return res.status(400).json({ message: 'Username already taken' });
      }
    }

    const updateData = {
      username: username || user.username,
      name: name || user.name,
      email: email || user.email,
      role: role || user.role,
    };

    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.passwordHash = await bcrypt.hash(password, salt);
    }

    const updatedUser = await updateUser(id, updateData);
    delete updatedUser.passwordHash;

    res.json({ success: true, data: updatedUser });
  } catch (error) {
    console.error('Update User Error:', error);
    res.status(500).json({ message: 'Server error during user update' });
  }
};

// @desc    Delete a user
// @route   DELETE /api/v1/auth/users/:id
// @access  Admin only
const deleteUserController = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deleting self
    if (req.user && req.user.id === id) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    const success = await deleteUser(id);
    if (!success) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete User Error:', error);
    res.status(500).json({ message: 'Server error during user deletion' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUsers,
  updateUser: updateUserController,
  deleteUser: deleteUserController,
};
